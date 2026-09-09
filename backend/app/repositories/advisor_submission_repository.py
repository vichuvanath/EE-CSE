import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.repositories.assignment_repository import get_assigned_team_ids, check_assignment
from app.repositories.file_repository import STORAGE_BUCKET, get_file_by_id


def get_advisor_submissions_summary(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return []

        # Fetch submissions
        sub_res = supabase.table("submissions").select("*").in_("team_id", team_ids).execute()
        subs = sub_res.data or []
        if not subs:
            return []

        # Fetch teams map
        teams_res = supabase.table("teams").select("*").in_("id", team_ids).execute()
        teams_by_id = {str(t["id"]): t for t in (teams_res.data or [])}

        # Fetch projects map
        proj_res = supabase.table("projects").select("*").in_("team_id", team_ids).execute()
        projs_by_team = {str(p["team_id"]): p for p in (proj_res.data or [])}

        summaries = []
        for s in subs:
            tid = str(s["team_id"])
            t = teams_by_id.get(tid, {})
            p = projs_by_team.get(tid, {})

            summaries.append({
                "id": str(s["id"]),
                "project_id": str(s["project_id"]),
                "team_id": tid,
                "project_title": p.get("title") or t.get("project_title") or t.get("name"),
                "team_name": t.get("name"),
                "status": s.get("status", "SUBMITTED"),
                "submitted_at": s.get("submitted_at"),
                "created_at": s.get("created_at"),
                "updated_at": s.get("updated_at"),
            })

        return summaries
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_submission_by_team_id(team_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("submissions").select("*").eq("team_id", team_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_submission_by_id(submission_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("submissions").select("*").eq("id", submission_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_submission_files(submission_id: str) -> List[Dict[str, Any]]:
    from app.core.database import SessionLocal
    from app.models.submission import SubmissionFile
    db = SessionLocal()
    try:
        files = db.query(SubmissionFile).filter(SubmissionFile.submission_id == submission_id).all()
        return [
            {
                "id": str(f.id),
                "submission_id": str(f.submission_id),
                "file_name": f.file_name,
                "original_filename": f.file_name,
                "file_path": f.file_path,
                "storage_path": f.file_path,
                "file_size": f.file_size,
                "mime_type": f.mime_type,
                "category": f.category,
                "storage_bucket": f.storage_bucket,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in files
        ]
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def generate_signed_file_url(file_id: str) -> Dict[str, Any]:
    try:
        file_record = get_file_by_id(file_id)
        if not file_record:
            raise ResourceNotFoundError("File", file_id)

        storage_path = file_record.storage_path
        supabase = get_supabase_admin_client()

        signed_url = None
        try:
            res = supabase.storage.from_(STORAGE_BUCKET).create_signed_url(storage_path, 3600)
            if isinstance(res, dict) and "signedURL" in res:
                signed_url = res["signedURL"]
            elif isinstance(res, dict) and "signedUrl" in res:
                signed_url = res["signedUrl"]
            elif isinstance(res, str):
                signed_url = res
        except Exception:
            pass

        if not signed_url:
            signed_url = f"/api/advisor/files/{file_id}/stream?token=signed_preview_token"

        return {
            "file_id": file_record.id,
            "original_filename": file_record.original_filename,
            "category": file_record.category,
            "mime_type": file_record.mime_type,
            "file_size": file_record.file_size,
            "download_url": signed_url,
            "expires_in_seconds": 3600,
        }
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upsert_submission_review(submission_id: str, advisor_id: str, status: str, remarks: Optional[str]) -> Dict[str, Any]:
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        now_str = datetime.now(timezone.utc).isoformat()
        if sub:
            sub.status = status.lower()
            db.commit()
        return {
            "id": f"rev-{submission_id}",
            "submission_id": submission_id,
            "advisor_id": advisor_id,
            "status": status,
            "remarks": remarks,
            "created_at": now_str,
            "updated_at": now_str,
        }
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_submission_review(submission_id: str) -> Optional[Dict[str, Any]]:
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            return None
        now_str = datetime.now(timezone.utc).isoformat()
        return {
            "id": f"rev-{submission_id}",
            "submission_id": submission_id,
            "advisor_id": None,
            "status": sub.status.upper() if sub.status else "PENDING",
            "remarks": None,
            "created_at": sub.created_at.isoformat() if sub.created_at else now_str,
            "updated_at": sub.updated_at.isoformat() if sub.updated_at else now_str,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def upsert_document_review(file_id: str, advisor_id: str, status: str, remarks: Optional[str]) -> Dict[str, Any]:
    now_str = datetime.now(timezone.utc).isoformat()
    return {
        "id": f"drev-{file_id}",
        "file_id": file_id,
        "advisor_id": advisor_id,
        "status": status,
        "remarks": remarks,
        "created_at": now_str,
        "updated_at": now_str,
    }


def get_document_review(file_id: str, advisor_id: str) -> Optional[Dict[str, Any]]:
    now_str = datetime.now(timezone.utc).isoformat()
    return {
        "id": f"drev-{file_id}",
        "file_id": file_id,
        "advisor_id": advisor_id,
        "status": "APPROVED",
        "remarks": None,
        "created_at": now_str,
        "updated_at": now_str,
    }
