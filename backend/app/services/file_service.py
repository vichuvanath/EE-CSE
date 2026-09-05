import re
import uuid
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from app.repositories.team_repository import get_student_team
from app.repositories.project_repository import get_project_by_team_id, upsert_project
from app.repositories.file_repository import (
    STORAGE_BUCKET,
    create_file_record,
    get_files_by_team_id,
    get_file_by_category_and_team,
    get_file_by_id,
    delete_file_record,
    upload_file_to_storage,
    delete_file_from_storage,
)
from app.schemas.project import ProjectUpdate

# Centralized constants & limits
ALLOWED_EXTENSIONS = {
    "ABSTRACT": [".pdf", ".docx"],
    "REPORT": [".pdf", ".docx"],
    "PPT": [".ppt", ".pptx"],
    "IMAGE": [".jpg", ".jpeg", ".png", ".webp"],
}

ALLOWED_MIME_TYPES = {
    "ABSTRACT": [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ],
    "REPORT": [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ],
    "PPT": [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    "IMAGE": [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ],
}

MAX_FILE_SIZES = {
    "ABSTRACT": 10 * 1024 * 1024,  # 10 MB
    "REPORT": 20 * 1024 * 1024,    # 20 MB
    "PPT": 20 * 1024 * 1024,       # 20 MB
    "IMAGE": 5 * 1024 * 1024,      # 5 MB per image
}


async def upload_student_file(student_id: str, category: str, file: UploadFile) -> dict:
    cat = category.upper().strip()
    if cat not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid file category '{category}'. Must be one of: ABSTRACT, REPORT, PPT, IMAGE",
        )

    # 1. Resolve student's team
    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    # 2. Resolve or create student's project
    project = get_project_by_team_id(team.id)
    if project:
        from app.repositories.submission_repository import get_submission_by_project_id
        existing_sub = get_submission_by_project_id(project.id)
        if existing_sub and isinstance(existing_sub, dict) and existing_sub.get("status") == "SUBMITTED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted projects cannot be edited or modified",
            )
    else:
        project = upsert_project(team.id, ProjectUpdate(title=f"{team.name} Project"))



    # 3. Read file binary content
    content = await file.read()
    filename = file.filename or "file"
    ext = Path(filename).suffix.lower()

    # 4. Validate extension
    if ext not in ALLOWED_EXTENSIONS[cat]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file extension '{ext}' for category {cat}. Allowed: {', '.join(ALLOWED_EXTENSIONS[cat])}",
        )

    # 5. Validate MIME type
    mime_type = (file.content_type or "").lower().strip()
    if mime_type not in ALLOWED_MIME_TYPES[cat]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported MIME type '{mime_type}' for category {cat}. Allowed: {', '.join(ALLOWED_MIME_TYPES[cat])}",
        )

    # 6. Validate file size
    file_size = len(content)
    if file_size > MAX_FILE_SIZES[cat]:
        max_mb = MAX_FILE_SIZES[cat] // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {max_mb}MB for category {cat}",
        )


    # 7. Check existing file for single-file replacement (ABSTRACT, REPORT, PPT)
    existing_file = None
    if cat in ["ABSTRACT", "REPORT", "PPT"]:
        existing_file = get_file_by_category_and_team(cat, team.id)

    # 8. Generate safe unique storage path
    safe_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
    unique_path = f"teams/{team.id}/{cat.lower()}/{uuid.uuid4().hex[:8]}_{safe_filename}"

    # 9. Upload new file to Storage
    upload_file_to_storage(STORAGE_BUCKET, unique_path, content, mime_type)

    # 10. Persist metadata record in DB (with rollback if DB insertion fails)
    try:
        file_record = create_file_record({
            "project_id": project.id,
            "team_id": team.id,
            "category": cat,
            "original_filename": filename,
            "storage_path": unique_path,
            "mime_type": mime_type,
            "file_size": file_size,
        })
    except Exception as db_err:
        # ROLLBACK: Remove newly uploaded storage file to prevent orphan files
        try:
            delete_file_from_storage(STORAGE_BUCKET, unique_path)
        except Exception as cleanup_err:
            print(f"[LOG ERROR] Failed to remove orphaned storage file '{unique_path}': {str(cleanup_err)}")
        raise db_err

    # 11. Clean up old file if single-file replacement succeeded
    if existing_file:
        try:
            delete_file_from_storage(STORAGE_BUCKET, existing_file.storage_path)
        except Exception as cleanup_err:
            print(f"[LOG WARNING] Storage removal of old file '{existing_file.storage_path}' skipped/failed: {str(cleanup_err)}")
        try:
            delete_file_record(existing_file.id)
        except Exception as db_cleanup_err:
            print(f"[LOG WARNING] DB removal of old file record '{existing_file.id}' skipped/failed: {str(db_cleanup_err)}")

    return {
        "message": f"File successfully uploaded for category {cat}",
        "file": file_record.model_dump(),
    }


def get_my_files(student_id: str) -> dict:
    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    files = get_files_by_team_id(team.id)
    return {
        "files": [f.model_dump() for f in files],
        "count": len(files),
    }


def delete_student_file(student_id: str, file_id: str) -> dict:
    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    file_record = get_file_by_id(file_id)
    if not file_record or file_record.team_id != team.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or does not belong to your team",
        )

    # Check if project is already officially submitted
    project = get_project_by_team_id(team.id)
    if project:
        from app.repositories.submission_repository import get_submission_by_project_id
        existing_sub = get_submission_by_project_id(project.id)
        if existing_sub and isinstance(existing_sub, dict) and existing_sub.get("status") == "SUBMITTED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted projects cannot be edited or modified",
            )



    try:
        delete_file_from_storage(STORAGE_BUCKET, file_record.storage_path)
    except Exception as err:
        print(f"[LOG WARNING] Storage removal of path '{file_record.storage_path}' skipped/failed: {str(err)}")

    delete_file_record(file_id)

    return {
        "message": "File successfully deleted",
        "file_id": file_id,
    }

