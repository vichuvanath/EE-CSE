from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import Project, Team, TeamMember
from app.models.student import Student
from app.models.submission import Submission, SubmissionFile
from app.models.user import User, UserRole
from app.schemas.student import SubmissionFileResponse
from app.services.storage_service import StorageService

router = APIRouter(prefix="/student", tags=["Student File Management"])


def _verify_submission_access(db: Session, user: User, submission_id: str) -> Submission:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "SUBMISSION_NOT_FOUND",
                    "message": "Submission not found",
                }
            },
        )

    # Verify student belongs to the submission's team
    if student:
        membership = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == submission.team_id,
                TeamMember.student_id == student.id,
            )
            .first()
        )
        if not membership and submission.submitted_by != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "FORBIDDEN",
                        "message": "You do not have permission to access files for this submission",
                    }
                },
            )
    return submission


class FileMetadataResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    team_id: Optional[str] = None
    category: Optional[str] = None
    original_filename: str
    storage_path: str
    mime_type: str
    file_size: int
    created_at: str
    updated_at: Optional[str] = None


class MyFilesResponse(BaseModel):
    files: List[FileMetadataResponse]
    count: int


def _get_student_team_and_project(db: Session, user: User) -> tuple[Student, Team, Project]:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "STUDENT_PROFILE_NOT_FOUND", "message": "Student profile not found"}},
        )
    membership = db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "NO_TEAM_ASSIGNED", "message": "Student is not assigned to a team"}},
        )
    team = db.query(Team).filter(Team.id == membership.team_id).first()
    project = db.query(Project).filter(Project.team_id == team.id).first()
    return student, team, project


@router.get("/files", response_model=MyFilesResponse)
def list_my_files(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    List all files uploaded by the student's team across all submissions.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    # Get all submissions for this team
    submissions = db.query(Submission).filter(Submission.team_id == team.id).all()
    submission_ids = [s.id for s in submissions]

    # Get all files across team submissions
    files = (
        db.query(SubmissionFile)
        .filter(SubmissionFile.submission_id.in_(submission_ids))
        .order_by(SubmissionFile.created_at.desc())
        .all()
    )

    file_responses = [
        FileMetadataResponse(
            id=f.id,
            project_id=project.id if project else None,
            team_id=team.id,
            category=f.category,
            original_filename=f.file_name,
            storage_path=f.file_path,
            mime_type=f.mime_type,
            file_size=f.file_size,
            created_at=f.created_at.isoformat() if f.created_at else "",
            updated_at=f.created_at.isoformat() if f.created_at else None,
        )
        for f in files
    ]

    return MyFilesResponse(files=file_responses, count=len(file_responses))


@router.post("/files/upload/{category}", response_model=FileMetadataResponse)
async def upload_file_by_category(
    category: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Upload a file with a category (ABSTRACT, REPORT, PPT, IMAGE).
    Creates or finds a draft submission for the team and attaches the file.
    """
    if category.upper() not in ["ABSTRACT", "REPORT", "PPT", "IMAGE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_CATEGORY", "message": "Category must be ABSTRACT, REPORT, PPT, or IMAGE"}},
        )

    student, team, project = _get_student_team_and_project(db, current_user)

    # Find or create a draft submission for this team
    submission = (
        db.query(Submission)
        .filter(Submission.team_id == team.id, Submission.status == "draft")
        .first()
    )
    if not submission:
        if not project:
            project = Project(
                team_id=team.id,
                title=f"{team.name} Senior Project",
                description="Electrical Engineering Senior Design Project",
                status="active",
            )
            db.add(project)
            db.commit()
            db.refresh(project)

        submission = Submission(
            project_id=project.id,
            team_id=team.id,
            submitted_by=current_user.id,
            title="Project Files Submission",
            description="Auto-created for file uploads",
            submission_type="file_upload",
            status="draft",
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

    content_bytes = await file.read()
    StorageService.validate_file(file, content_bytes)

    storage_path = StorageService.generate_storage_path(submission.id, file.filename or "report.pdf")
    uploaded_path = StorageService.upload_file(
        file_bytes=content_bytes,
        storage_path=storage_path,
        mime_type=file.content_type or "application/pdf",
    )

    file_metadata = SubmissionFile(
        submission_id=submission.id,
        file_name=file.filename or "report.pdf",
        file_path=uploaded_path,
        file_size=len(content_bytes),
        mime_type=file.content_type or "application/pdf",
        category=category.upper(),
        storage_bucket="reports",
    )
    db.add(file_metadata)
    db.commit()
    db.refresh(file_metadata)

    return FileMetadataResponse(
        id=file_metadata.id,
        project_id=project.id if project else None,
        team_id=team.id,
        category=file_metadata.category,
        original_filename=file_metadata.file_name,
        storage_path=file_metadata.file_path,
        mime_type=file_metadata.mime_type,
        file_size=file_metadata.file_size,
        created_at=file_metadata.created_at.isoformat() if file_metadata.created_at else "",
        updated_at=file_metadata.created_at.isoformat() if file_metadata.created_at else None,
    )


@router.post("/submissions/{submission_id}/files", response_model=SubmissionFileResponse)
async def upload_submission_file(
    submission_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Upload a report file for a submission.
    Validates file size, type, and submission draft status.
    Stores binary in Supabase Storage and metadata in PostgreSQL.
    """
    submission = _verify_submission_access(db, current_user, submission_id)

    # Block uploading files to finalized submissions
    if submission.status not in ["draft", "submitted"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "SUBMISSION_FINALIZED",
                    "message": f"Cannot attach files to a submission with status '{submission.status}'",
                }
            },
        )

    content_bytes = await file.read()
    # 1. Validate file size & extension
    StorageService.validate_file(file, content_bytes)

    # 2. Generate safe storage path
    storage_path = StorageService.generate_storage_path(submission_id, file.filename or "report.pdf")

    # 3. Upload binary to Supabase Storage
    uploaded_path = StorageService.upload_file(
        file_bytes=content_bytes,
        storage_path=storage_path,
        mime_type=file.content_type or "application/pdf",
    )

    # 4. Save metadata to PostgreSQL submission_files table
    file_metadata = SubmissionFile(
        submission_id=submission.id,
        file_name=file.filename or "report.pdf",
        file_path=uploaded_path,
        file_size=len(content_bytes),
        mime_type=file.content_type or "application/pdf",
        storage_bucket="reports",
    )
    db.add(file_metadata)
    db.commit()
    db.refresh(file_metadata)

    signed_url = StorageService.get_signed_url(uploaded_path)
    return SubmissionFileResponse(
        id=file_metadata.id,
        submission_id=file_metadata.submission_id,
        file_name=file_metadata.file_name,
        file_size=file_metadata.file_size,
        mime_type=file_metadata.mime_type,
        storage_bucket=file_metadata.storage_bucket,
        download_url=signed_url,
        created_at=file_metadata.created_at,
    )


@router.get("/files/{file_id}", response_model=SubmissionFileResponse)
def get_submission_file(
    file_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get file metadata and temporary signed download URL.
    Verifies student team ownership.
    """
    file_record = db.query(SubmissionFile).filter(SubmissionFile.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "message": "Requested file not found",
                }
            },
        )

    _verify_submission_access(db, current_user, file_record.submission_id)
    signed_url = StorageService.get_signed_url(file_record.file_path)

    return SubmissionFileResponse(
        id=file_record.id,
        submission_id=file_record.submission_id,
        file_name=file_record.file_name,
        file_size=file_record.file_size,
        mime_type=file_record.mime_type,
        storage_bucket=file_record.storage_bucket,
        download_url=signed_url,
        created_at=file_record.created_at,
    )


@router.delete("/files/{file_id}")
def delete_submission_file(
    file_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Delete a submission file.
    Only permitted if submission is in draft state.
    Deletes object from Supabase Storage and metadata from DB.
    """
    file_record = db.query(SubmissionFile).filter(SubmissionFile.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "message": "File not found",
                }
            },
        )

    submission = _verify_submission_access(db, current_user, file_record.submission_id)
    if submission.status not in ["draft"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "SUBMISSION_FINALIZED",
                    "message": "Cannot delete files from a submitted or finalized report",
                }
            },
        )

    # Delete storage binary and database record
    StorageService.delete_file(file_record.file_path)
    db.delete(file_record)
    db.commit()

    return {"message": "File deleted successfully"}
