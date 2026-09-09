# app/repositories/submission_repository.py
import uuid
from typing import Optional, Dict, Any, List
from app.core.database import SessionLocal
from app.core.exceptions import DatabaseError
from app.models.academic import Project
from app.models.submission import Submission, SubmissionFile


def get_checklist_raw_data(team_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # 1. Fetch project record for links
        proj = db.query(Project).filter(Project.team_id == team_id).first()
        project_data = None
        if proj:
            project_data = {
                "id": str(proj.id),
                "team_id": str(proj.team_id),
                "title": proj.title,
                "description": proj.description,
                "status": proj.status,
                "domain": getattr(proj, "domain", None),
                "problem_statement": getattr(proj, "problem_statement", None),
                "proposed_solution": getattr(proj, "proposed_solution", None),
                "technologies_used": getattr(proj, "technologies_used", None),
                "github_url": getattr(proj, "github_url", None),
                "live_demo_url": getattr(proj, "live_demo_url", None),
            }

        # 2. Fetch uploaded file categories across all submissions for this team
        team_subs = db.query(Submission.id).filter(Submission.team_id == team_id).all()
        sub_ids = [str(s[0]) for s in team_subs]

        categories = []
        if sub_ids:
            files = db.query(SubmissionFile.category).filter(SubmissionFile.submission_id.in_(sub_ids)).all()
            categories = list({str(f[0]).upper() for f in files if f[0]})

        return {
            "project": project_data,
            "categories": categories,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_submission_by_project_id(project_id: str) -> Optional[dict]:
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.project_id == project_id).order_by(Submission.created_at.desc()).first()
        if not sub:
            return None
        return {
            "id": str(sub.id),
            "project_id": str(sub.project_id),
            "team_id": str(sub.team_id),
            "submitted_by": str(sub.submitted_by) if sub.submitted_by else None,
            "title": sub.title,
            "description": sub.description,
            "submission_type": sub.submission_type,
            "status": sub.status,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
            "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
        }
    except Exception:
        return None
    finally:
        db.close()


def create_submission_record(data: dict) -> dict:
    db = SessionLocal()
    try:
        sub_id = data.get("id") or str(uuid.uuid4())
        sub = Submission(
            id=sub_id,
            project_id=data["project_id"],
            team_id=data["team_id"],
            submitted_by=data.get("submitted_by"),
            title=data.get("title") or "Project Milestone Submission",
            description=data.get("description"),
            submission_type=data.get("submission_type") or "final_report",
            status=data.get("status") or "SUBMITTED",
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {
            "id": str(sub.id),
            "project_id": str(sub.project_id),
            "team_id": str(sub.team_id),
            "submitted_by": str(sub.submitted_by) if sub.submitted_by else None,
            "title": sub.title,
            "description": sub.description,
            "submission_type": sub.submission_type,
            "status": sub.status,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
            "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
        }
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()
