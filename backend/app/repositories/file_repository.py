import uuid
from typing import Optional, List
from app.core.database import SessionLocal
from app.core.supabase import get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.schemas.file import FileMetadataResponse
from app.models.submission import Submission, SubmissionFile

STORAGE_BUCKET = "reports"


def create_file_record(data: dict) -> FileMetadataResponse:
    db = SessionLocal()
    try:
        team_id = data.get("team_id")
        project_id = data.get("project_id")
        submission_id = data.get("submission_id")

        if not submission_id and team_id:
            # Find an existing submission or create one
            sub = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()
            if not sub:
                sub = Submission(
                    id=str(uuid.uuid4()),
                    project_id=project_id,
                    team_id=team_id,
                    title="Project Deliverables",
                    submission_type="interim_report",
                    status="draft",
                )
                db.add(sub)
                db.commit()
                db.refresh(sub)
            submission_id = sub.id

        file_id = data.get("id") or str(uuid.uuid4())
        sf = SubmissionFile(
            id=file_id,
            submission_id=submission_id,
            file_name=data.get("original_filename") or data.get("file_name") or "file",
            file_path=data.get("storage_path") or data.get("file_path") or "",
            file_size=int(data.get("file_size") or 0),
            mime_type=data.get("mime_type") or "application/octet-stream",
            category=data.get("category"),
            storage_bucket=data.get("storage_bucket") or STORAGE_BUCKET,
        )
        db.add(sf)
        db.commit()
        db.refresh(sf)

        return FileMetadataResponse(
            id=str(sf.id),
            project_id=str(project_id) if project_id else "",
            team_id=str(team_id) if team_id else "",
            category=sf.category or "",
            original_filename=sf.file_name,
            storage_path=sf.file_path,
            mime_type=sf.mime_type,
            file_size=sf.file_size,
            created_at=sf.created_at,
            updated_at=sf.created_at,
        )
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_files_by_team_id(team_id: str) -> List[FileMetadataResponse]:
    db = SessionLocal()
    try:
        subs = db.query(Submission).filter(Submission.team_id == team_id).all()
        sub_ids = [s.id for s in subs]
        if not sub_ids:
            return []

        sub_project_map = {s.id: s.project_id for s in subs}
        files = db.query(SubmissionFile).filter(SubmissionFile.submission_id.in_(sub_ids)).order_by(SubmissionFile.created_at.desc()).all()

        return [
            FileMetadataResponse(
                id=str(f.id),
                project_id=str(sub_project_map.get(f.submission_id, "")),
                team_id=str(team_id),
                category=f.category or "",
                original_filename=f.file_name,
                storage_path=f.file_path,
                mime_type=f.mime_type,
                file_size=f.file_size,
                created_at=f.created_at,
                updated_at=f.created_at,
            )
            for f in files
        ]
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_file_by_category_and_team(category: str, team_id: str) -> Optional[FileMetadataResponse]:
    db = SessionLocal()
    try:
        subs = db.query(Submission).filter(Submission.team_id == team_id).all()
        sub_ids = [s.id for s in subs]
        if not sub_ids:
            return None

        sub_project_map = {s.id: s.project_id for s in subs}
        f = (
            db.query(SubmissionFile)
            .filter(
                SubmissionFile.submission_id.in_(sub_ids),
                SubmissionFile.category.ilike(category)
            )
            .order_by(SubmissionFile.created_at.desc())
            .first()
        )
        if not f:
            return None

        return FileMetadataResponse(
            id=str(f.id),
            project_id=str(sub_project_map.get(f.submission_id, "")),
            team_id=str(team_id),
            category=f.category or "",
            original_filename=f.file_name,
            storage_path=f.file_path,
            mime_type=f.mime_type,
            file_size=f.file_size,
            created_at=f.created_at,
            updated_at=f.created_at,
        )
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_file_by_id(file_id: str) -> Optional[FileMetadataResponse]:
    db = SessionLocal()
    try:
        f = db.query(SubmissionFile).filter(SubmissionFile.id == file_id).first()
        if not f:
            return None
        sub = db.query(Submission).filter(Submission.id == f.submission_id).first()

        return FileMetadataResponse(
            id=str(f.id),
            project_id=str(sub.project_id) if sub else "",
            team_id=str(sub.team_id) if sub else "",
            category=f.category or "",
            original_filename=f.file_name,
            storage_path=f.file_path,
            mime_type=f.mime_type,
            file_size=f.file_size,
            created_at=f.created_at,
            updated_at=f.created_at,
        )
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def delete_file_record(file_id: str) -> bool:
    db = SessionLocal()
    try:
        f = db.query(SubmissionFile).filter(SubmissionFile.id == file_id).first()
        if f:
            db.delete(f)
            db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def upload_file_to_storage(bucket: str, path: str, content: bytes, mime_type: str) -> str:
    try:
        supabase = get_supabase_admin_client()
        supabase.storage.from_(bucket).upload(
            path=path,
            file=content,
            file_options={"content-type": mime_type, "upsert": "true"},
        )
        return path
    except Exception as e:
        raise DatabaseError(detail=f"Storage upload error: {str(e)}")


def delete_file_from_storage(bucket: str, path: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.storage.from_(bucket).remove([path])
        return True
    except Exception as e:
        raise DatabaseError(detail=f"Storage deletion error: {str(e)}")
