import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.database import SessionLocal
from app.core.exceptions import DatabaseError
from app.models.submission import Submission
from app.models.evaluation import Evaluation

def _format_eval_for_team(eval_obj, team_id, status_fallback="EVALUATED"):
    if not eval_obj:
        return None
    return {
        "id": eval_obj.id,
        "team_id": str(team_id),
        "advisor_id": str(eval_obj.evaluator_id) if eval_obj.evaluator_id else None,
        "status": status_fallback,
        "team_score": float(eval_obj.total_score) if eval_obj.total_score is not None else None,
        "team_remarks": eval_obj.feedback,
        "created_at": eval_obj.created_at.isoformat() if eval_obj.created_at else None,
        "updated_at": eval_obj.updated_at.isoformat() if eval_obj.updated_at else None,
    }


def get_team_evaluation(team_id: str) -> Optional[Dict[str, Any]]:
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()
        if not sub:
            return None
        eval_obj = db.query(Evaluation).filter(Evaluation.submission_id == sub.id).first()
        if not eval_obj:
            return None
        return _format_eval_for_team(eval_obj, team_id, "EVALUATED" if sub.status == "evaluated" else "IN_PROGRESS")
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_evaluation_by_id(evaluation_id: str) -> Optional[Dict[str, Any]]:
    db = SessionLocal()
    try:
        eval_obj = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not eval_obj:
            return None
        sub = db.query(Submission).filter(Submission.id == eval_obj.submission_id).first()
        team_id = sub.team_id if sub else "unknown"
        return _format_eval_for_team(eval_obj, team_id)
    except Exception as e:
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def upsert_team_evaluation(
    team_id: str,
    advisor_id: str,
    team_score: Optional[float] = None,
    team_remarks: Optional[str] = None,
    status_val: Optional[str] = None,
) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()
        if not sub:
            # We can't really create an evaluation without a submission in SQLAlchemy schema
            now_str = datetime.now(timezone.utc).isoformat()
            return {
                "id": str(uuid.uuid4()),
                "team_id": team_id,
                "advisor_id": advisor_id,
                "status": status_val or "NOT_STARTED",
                "team_score": team_score,
                "team_remarks": team_remarks,
                "created_at": now_str,
                "updated_at": now_str,
            }

        eval_obj = db.query(Evaluation).filter(Evaluation.submission_id == sub.id).first()
        if eval_obj:
            if team_score is not None:
                eval_obj.total_score = float(team_score)
            if team_remarks is not None:
                eval_obj.feedback = team_remarks
            eval_obj.evaluator_id = advisor_id
            if status_val == "SUBMITTED" or status_val == "EVALUATED":
                sub.status = "evaluated"
        else:
            eval_obj = Evaluation(
                submission_id=sub.id,
                evaluator_id=advisor_id,
                feedback=team_remarks,
                total_score=float(team_score) if team_score is not None else None,
            )
            db.add(eval_obj)
            if status_val == "SUBMITTED" or status_val == "EVALUATED":
                sub.status = "evaluated"

        db.commit()
        db.refresh(eval_obj)
        return _format_eval_for_team(eval_obj, team_id, status_val or "IN_PROGRESS")
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def update_evaluation_status(evaluation_id: str, new_status: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        eval_obj = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not eval_obj:
            raise DatabaseError(detail="Evaluation not found")
        sub = db.query(Submission).filter(Submission.id == eval_obj.submission_id).first()
        
        if new_status in ["SUBMITTED", "EVALUATED"] and sub:
            sub.status = "evaluated"
            db.commit()
            
        team_id = sub.team_id if sub else "unknown"
        return _format_eval_for_team(eval_obj, team_id, new_status)
    except Exception as e:
        db.rollback()
        raise DatabaseError(detail=str(e))
    finally:
        db.close()


def get_student_evaluations_for_team(team_id: str) -> List[Dict[str, Any]]:
    # student_evaluations table does not exist in Postgres public schema
    return []


def get_student_evaluation_by_id(student_eval_id: str) -> Optional[Dict[str, Any]]:
    return None


def get_student_evaluation_by_eval_and_student(evaluation_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    return None


def upsert_student_evaluation(
    evaluation_id: str,
    student_id: str,
    project_marks: float,
    presentation_marks: float,
    technical_marks: float,
    documentation_marks: float,
    contribution_marks: float,
    total_marks: float,
    remarks: Optional[str],
) -> Dict[str, Any]:
    now_str = datetime.now(timezone.utc).isoformat()
    return {
        "id": str(uuid.uuid4()),
        "evaluation_id": evaluation_id,
        "student_id": student_id,
        "project_marks": project_marks,
        "presentation_marks": presentation_marks,
        "technical_marks": technical_marks,
        "documentation_marks": documentation_marks,
        "contribution_marks": contribution_marks,
        "total_marks": total_marks,
        "remarks": remarks,
        "created_at": now_str,
        "updated_at": now_str,
    }

