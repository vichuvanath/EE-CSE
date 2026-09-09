# app/routers/advisors.py
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.deps import get_current_advisor
from app.services.advisor_service import AdvisorService
from app.repositories.advisor_repository import (
    get_advisor_teams_summary,
    get_advisor_team_details,
    get_advisor_students_list,
    get_advisor_student_detail,
    get_advisor_project_info,
)
from app.repositories.advisor_evaluation_repository import (
    get_team_evaluation,
    get_evaluation_by_id,
    get_student_evaluations_for_team,
)
from app.services.advisor_evaluation_service import (
    get_team_evaluation_service,
    save_team_evaluation_service,
    get_student_evaluations_for_team_service,
    get_student_evaluation_by_id_service,
    save_student_evaluation_service,
    transition_evaluation_status_service,
    get_evaluation_status_service,
)
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/v1/advisors", tags=["Advisors v1"])


# ==========================================
# DASHBOARD
# ==========================================

@router.get("/dashboard")
async def get_advisor_dashboard(
    current_advisor: dict = Depends(get_current_advisor),
    service: AdvisorService = Depends()
):
    return service.get_dashboard_stats(current_advisor["id"])


# ==========================================
# ADVISOR PROFILE
# ==========================================

@router.get("/profile", summary="Get advisor profile")
async def get_advisor_profile(current_advisor: dict = Depends(get_current_advisor)):
    return {
        "id": current_advisor.get("id"),
        "email": current_advisor.get("email"),
        "name": current_advisor.get("name", ""),
        "role": current_advisor.get("role", "advisor"),
        "department": current_advisor.get("department", ""),
        "phone": current_advisor.get("phone", ""),
    }


@router.put("/profile", summary="Update advisor profile")
async def update_advisor_profile(
    profile_data: dict,
    current_advisor: dict = Depends(get_current_advisor),
):
    return {
        "id": current_advisor.get("id"),
        "email": profile_data.get("email", current_advisor.get("email")),
        "name": profile_data.get("name", current_advisor.get("name", "")),
        "role": current_advisor.get("role", "advisor"),
        "department": profile_data.get("department", current_advisor.get("department", "")),
        "phone": profile_data.get("phone", current_advisor.get("phone", "")),
    }


# ==========================================
# ADVISOR STUDENTS
# ==========================================

@router.get("/students", summary="List assigned students")
async def get_advisor_students(current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return get_advisor_students_list(advisor_id)


@router.get("/students/{student_id}", summary="Student details")
async def get_advisor_student_details(student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    result = get_advisor_student_detail(advisor_id, student_id)
    if not result:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
    return result


@router.get("/students/{student_id}/submissions", summary="Student submissions")
async def get_advisor_student_submissions(student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Student submissions", "student_id": student_id}


@router.get("/students/{student_id}/history", summary="Student history")
async def get_advisor_student_history(student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Student history", "student_id": student_id}


# ==========================================
# ADVISOR TEAMS
# ==========================================

@router.get("/teams", summary="List assigned teams")
async def get_advisor_teams(current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return get_advisor_teams_summary(advisor_id)


@router.post("/teams", summary="Create team")
async def create_advisor_team(current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Team created"}


@router.get("/teams/{team_id}", summary="Team details")
async def get_advisor_team_details_route(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    result = get_advisor_team_details(advisor_id, team_id)
    if not result:
        raise HTTPException(status_code=404, detail="Team not found or not assigned to you")
    return result


@router.patch("/teams/{team_id}", summary="Update team")
async def update_advisor_team(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Team updated", "team_id": team_id}


@router.delete("/teams/{team_id}", summary="Delete team")
async def delete_advisor_team(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Team deleted", "team_id": team_id}


@router.get("/teams/{team_id}/members", summary="List team members")
async def get_advisor_team_members(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "List team members", "team_id": team_id}


@router.post("/teams/{team_id}/members", summary="Add member")
async def add_advisor_team_member(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Member added", "team_id": team_id}


@router.delete("/teams/{team_id}/members/{student_id}", summary="Remove member")
async def remove_advisor_team_member(team_id: str, student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Member removed", "team_id": team_id, "student_id": student_id}


@router.post("/teams/{team_id}/guide", summary="Assign guide")
async def assign_advisor_team_guide(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Guide assigned", "team_id": team_id}


@router.delete("/teams/{team_id}/guide", summary="Remove guide")
async def remove_advisor_team_guide(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Guide removed", "team_id": team_id}


@router.post("/students/{student_id}/transfer", summary="Transfer student")
async def transfer_advisor_student(student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Student transferred", "student_id": student_id}


# ==========================================
# ADVISOR TEAM PROJECT
# ==========================================

@router.get("/teams/{team_id}/project", summary="Get team project")
async def get_advisor_team_project(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    result = get_advisor_project_info(advisor_id, team_id)
    if not result:
        raise HTTPException(status_code=404, detail="Project not found or not assigned to you")
    return result


# ==========================================
# ADVISOR TEAM SUBMISSION
# ==========================================

def _format_submission_full(sub, db):
    """Format a Submission ORM instance into a rich dict with files, submitter, project, and evaluation."""
    from app.models.user import User
    from app.models.academic import Project
    from app.models.evaluation import Evaluation
    from app.services.storage_service import StorageService

    # Submitter info
    submitter_name = None
    if sub.submitted_by:
        submitter = db.query(User).filter(User.id == sub.submitted_by).first()
        if submitter:
            submitter_name = submitter.full_name

    # Project info
    project_data = None
    project = None
    if sub.project_id:
        project = db.query(Project).filter(Project.id == sub.project_id).first()
    if not project and sub.team_id:
        project = db.query(Project).filter(Project.team_id == sub.team_id).first()

    if project:
        project_data = {
            "id": project.id,
            "team_id": project.team_id,
            "title": project.title,
            "domain": getattr(project, "domain", "") or "",
            "problem_statement": getattr(project, "problem_statement", "") or "",
            "description": project.description or "",
            "proposed_solution": getattr(project, "proposed_solution", "") or "",
            "technologies_used": getattr(project, "technologies_used", "") or "",
            "github_url": getattr(project, "github_url", None),
            "live_demo_url": getattr(project, "live_demo_url", None),
            "status": project.status,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        }

    # Files
    files = []
    if sub.files:
        for f in sub.files:
            download_url = None
            try:
                download_url = StorageService.get_signed_url(f.file_path)
            except Exception:
                pass
            files.append({
                "id": f.id,
                "file_name": f.file_name,
                "file_size": f.file_size,
                "mime_type": f.mime_type,
                "category": f.category,
                "download_url": download_url,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            })

    # Evaluation (SQLAlchemy-based, linked by submission_id)
    evaluation_data = None
    eval_obj = db.query(Evaluation).filter(Evaluation.submission_id == sub.id).first()
    if eval_obj:
        evaluator_name = None
        if eval_obj.evaluator_id:
            ev_user = db.query(User).filter(User.id == eval_obj.evaluator_id).first()
            if ev_user:
                evaluator_name = ev_user.full_name
        scores_list = []
        if eval_obj.scores:
            for sc in eval_obj.scores:
                scores_list.append({
                    "id": sc.id,
                    "rubric_criterion": sc.rubric_criterion,
                    "max_score": sc.max_score,
                    "score": sc.score,
                    "comments": sc.comments,
                })
        evaluation_data = {
            "id": eval_obj.id,
            "submission_id": eval_obj.submission_id,
            "evaluator_id": eval_obj.evaluator_id,
            "evaluator_name": evaluator_name,
            "feedback": eval_obj.feedback,
            "total_score": eval_obj.total_score,
            "scores": scores_list,
            "created_at": eval_obj.created_at.isoformat() if eval_obj.created_at else None,
            "updated_at": eval_obj.updated_at.isoformat() if eval_obj.updated_at else None,
        }

    return {
        "id": sub.id,
        "project_id": sub.project_id,
        "team_id": sub.team_id,
        "submitted_by": sub.submitted_by,
        "submitter_name": submitter_name,
        "title": sub.title,
        "description": sub.description,
        "submission_type": sub.submission_type,
        "status": sub.status,
        "files": files,
        "project": project_data,
        "evaluation": evaluation_data,
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
    }


@router.get("/teams/{team_id}/submission", summary="Get team's latest submission")
async def get_advisor_team_submission(
    team_id: str,
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    from app.models.submission import Submission
    sub = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()
    if not sub:
        return None
    return _format_submission_full(sub, db)


# ==========================================
# ADVISOR TEAM EVALUATION
# ==========================================

@router.get("/teams/{team_id}/evaluation", summary="Get team's latest evaluation")
async def get_advisor_team_evaluation(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return get_team_evaluation_service(advisor_id, team_id)


@router.post("/teams/{team_id}/evaluation", summary="Create team evaluation")
async def create_advisor_team_evaluation_single(
    team_id: str,
    request: Request,
    current_advisor: dict = Depends(get_current_advisor),
):
    advisor_id = current_advisor["id"]
    body = await request.json()
    team_score = body.get("team_score")
    team_remarks = body.get("team_remarks") or body.get("remarks")
    status_val = body.get("status")
    result = save_team_evaluation_service(advisor_id, team_id, team_score, team_remarks, status_val)

    # Sync to latest submission in SQLAlchemy so student portal immediately reflects evaluation
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    from app.models.evaluation import Evaluation, EvaluationScore

    db = SessionLocal()
    try:
        latest_sub = (
            db.query(Submission)
            .filter(Submission.team_id == team_id)
            .order_by(Submission.created_at.desc())
            .first()
        )
        if latest_sub:
            eval_obj = db.query(Evaluation).filter(Evaluation.submission_id == latest_sub.id).first()
            if not eval_obj:
                eval_obj = Evaluation(
                    submission_id=latest_sub.id,
                    evaluator_id=advisor_id,
                )
                db.add(eval_obj)
                db.flush()

            eval_obj.feedback = team_remarks or ""
            if team_score is not None:
                eval_obj.total_score = float(team_score)
            eval_obj.evaluator_id = advisor_id

            scores_data = body.get("scores")
            if isinstance(scores_data, dict):
                # Replace existing scores
                for old_score in eval_obj.scores:
                    db.delete(old_score)
                db.flush()
                for crit_name, crit_val in scores_data.items():
                    if isinstance(crit_val, (int, float)):
                        db.add(
                            EvaluationScore(
                                evaluation_id=eval_obj.id,
                                rubric_criterion=crit_name.replace("_", " ").title(),
                                max_score=20.0,
                                score=float(crit_val),
                            )
                        )
            elif isinstance(scores_data, list):
                for old_score in eval_obj.scores:
                    db.delete(old_score)
                db.flush()
                for sc in scores_data:
                    db.add(
                        EvaluationScore(
                            evaluation_id=eval_obj.id,
                            rubric_criterion=sc.get("rubric_criterion", "General"),
                            max_score=float(sc.get("max_score", 20)),
                            score=float(sc.get("score", 0)),
                            comments=sc.get("comments"),
                        )
                    )

            latest_sub.status = "evaluated"
            db.commit()
    except Exception as exc:
        db.rollback()
    finally:
        db.close()

    return result


# ==========================================
# ADVISOR RECORDS
# ==========================================

@router.get("/records", summary="View advisor evaluation records")
async def get_advisor_records(current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    from app.core.database import SessionLocal
    from app.models.academic import TeamAssignment
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        assignments = db.query(TeamAssignment).filter(TeamAssignment.advisor_id == advisor_id).all()
        team_ids = [str(a.team_id) for a in assignments]
        if not team_ids:
            return []

        subs = (
            db.query(Submission)
            .filter(Submission.team_id.in_(team_ids))
            .order_by(Submission.created_at.desc())
            .all()
        )

        from app.repositories.advisor_repository import get_advisor_teams_summary
        teams_summary = get_advisor_teams_summary(advisor_id)
        teams_by_id = {t["team_id"]: t for t in teams_summary}

        sessions = []
        for s in subs:
            tid = str(s.team_id)
            team_data = teams_by_id.get(tid, {})
            created = s.created_at
            sessions.append({
                "id": s.id,
                "title": s.title or f"Submission by {team_data.get('name', tid)}",
                "date": created.strftime("%d %b %Y") if created else "",
                "time": created.strftime("%I:%M %p") if created else "",
                "teams_count": 1,
                "teams": [team_data] if team_data else [],
            })

        return sessions
    finally:
        db.close()


# ==========================================
# ADVISOR SUBMISSIONS
# ==========================================

@router.get("/submissions", summary="View assigned-team submissions")
async def get_advisor_submissions(
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    advisor_id = current_advisor["id"]
    from app.models.academic import TeamAssignment
    from app.models.submission import Submission
    assignments = db.query(TeamAssignment).filter(TeamAssignment.advisor_id == advisor_id).all()
    team_ids = [str(a.team_id) for a in assignments]
    if not team_ids:
        return []
    subs = db.query(Submission).filter(Submission.team_id.in_(team_ids)).order_by(Submission.created_at.desc()).all()
    return [_format_submission_full(s, db) for s in subs]


@router.get("/submissions/{submission_id}", summary="View submission details")
async def get_advisor_submission_details(
    submission_id: str,
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    from app.models.submission import Submission
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _format_submission_full(sub, db)


@router.get("/submissions/{submission_id}/files", summary="Access submission files")
async def get_advisor_submission_files(
    submission_id: str,
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    from app.models.submission import SubmissionFile
    from app.services.storage_service import StorageService
    files = db.query(SubmissionFile).filter(SubmissionFile.submission_id == submission_id).all()
    result = []
    for f in files:
        download_url = None
        try:
            download_url = StorageService.get_signed_url(f.file_path)
        except Exception:
            pass
        result.append({
            "id": f.id,
            "file_name": f.file_name,
            "file_size": f.file_size,
            "mime_type": f.mime_type,
            "category": f.category,
            "download_url": download_url,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        })
    return result


@router.get("/teams/{team_id}/submissions", summary="View team's submissions")
async def get_advisor_team_submissions(
    team_id: str,
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    from app.models.submission import Submission
    subs = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).all()
    return [_format_submission_full(s, db) for s in subs]


@router.patch("/submissions/{submission_id}/status", summary="Update submission review status")
async def update_advisor_submission_status(submission_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Submission status updated", "submission_id": submission_id}


@router.post("/submissions/{submission_id}/evaluate", summary="Evaluate a specific submission")
async def evaluate_advisor_submission(
    submission_id: str,
    request: Request,
    current_advisor: dict = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    """
    Create or update an evaluation against a specific submission.
    This creates a SQLAlchemy Evaluation record linked to the submission_id,
    making the evaluation visible to students.
    """
    from app.models.submission import Submission
    from app.models.evaluation import Evaluation, EvaluationScore
    from app.models.user import User

    advisor_id = current_advisor["id"]
    body = await request.json()

    feedback = body.get("feedback") or body.get("remarks") or ""
    total_score = body.get("total_score") if body.get("total_score") is not None else body.get("marks_awarded")
    letter_grade = body.get("letter_grade") or body.get("grade")
    scores_input = body.get("scores", [])

    # Normalize scores into a standardized list of rubric dicts
    norm_scores = []
    if isinstance(scores_input, list):
        for sc in scores_input:
            if isinstance(sc, dict):
                norm_scores.append({
                    "rubric_criterion": sc.get("rubric_criterion") or sc.get("criterion") or "General",
                    "max_score": float(sc.get("max_score", 20)),
                    "score": float(sc.get("score", 0)),
                    "comments": sc.get("comments") or sc.get("comment"),
                })
    elif isinstance(scores_input, dict):
        for crit_key, val in scores_input.items():
            criterion_label = crit_key.replace("_", " ").title()
            if isinstance(val, (int, float)):
                norm_scores.append({
                    "rubric_criterion": criterion_label,
                    "max_score": 20.0,
                    "score": float(val),
                    "comments": None,
                })
            elif isinstance(val, dict):
                norm_scores.append({
                    "rubric_criterion": val.get("rubric_criterion") or criterion_label,
                    "max_score": float(val.get("max_score", val.get("max", 20))),
                    "score": float(val.get("score", 0)),
                    "comments": val.get("comments") or val.get("comment"),
                })

    if total_score is None and norm_scores:
        total_score = sum(s["score"] for s in norm_scores)

    if not letter_grade and total_score is not None:
        pct = (total_score / 100.0) * 100.0
        if pct >= 90:
            letter_grade = "A+"
        elif pct >= 80:
            letter_grade = "A"
        elif pct >= 70:
            letter_grade = "B+"
        elif pct >= 60:
            letter_grade = "B"
        else:
            letter_grade = "C"

    # Verify submission exists
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Check or create evaluation
    eval_obj = db.query(Evaluation).filter(Evaluation.submission_id == submission_id).first()

    if eval_obj:
        # Update existing evaluation
        eval_obj.feedback = feedback
        if total_score is not None:
            eval_obj.total_score = float(total_score)
        eval_obj.evaluator_id = advisor_id

        # Replace scores
        for old_score in eval_obj.scores:
            db.delete(old_score)
        db.flush()
    else:
        # Create new evaluation
        eval_obj = Evaluation(
            submission_id=submission_id,
            evaluator_id=advisor_id,
            feedback=feedback,
            total_score=float(total_score) if total_score is not None else None,
        )
        db.add(eval_obj)
        db.flush()

    # Add rubric scores
    for sc in norm_scores:
        score_obj = EvaluationScore(
            evaluation_id=eval_obj.id,
            rubric_criterion=sc["rubric_criterion"],
            max_score=sc["max_score"],
            score=sc["score"],
            comments=sc["comments"],
        )
        db.add(score_obj)

    # Update submission status to evaluated
    sub.status = "evaluated"

    db.commit()
    db.refresh(eval_obj)
    db.refresh(sub)

    formatted = _format_submission_full(sub, db)
    return {
        "message": "Submission evaluated successfully",
        "submission_id": sub.id,
        "marks_awarded": eval_obj.total_score,
        "total_score": eval_obj.total_score,
        "letter_grade": letter_grade,
        "status": "evaluated",
        **formatted,
    }


# ==========================================
# ADVISOR EVALUATIONS
# ==========================================

@router.get("/evaluations", summary="View advisor's evaluations")
async def get_advisor_evaluations(current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    from app.core.database import SessionLocal
    from app.models.academic import TeamAssignment
    from app.core.supabase import get_supabase_client
    db = SessionLocal()
    try:
        assignments = db.query(TeamAssignment).filter(TeamAssignment.advisor_id == advisor_id).all()
        team_ids = [str(a.team_id) for a in assignments]
        if not team_ids:
            return []

        from app.models.submission import Submission
        from app.models.evaluation import Evaluation
        
        subs = db.query(Submission).filter(Submission.team_id.in_(team_ids)).order_by(Submission.created_at.desc()).all()
        team_latest_subs = {}
        for sub in reversed(subs):
            team_latest_subs[str(sub.team_id)] = sub.id
            
        evaluations = []
        if team_latest_subs:
            sub_ids = list(team_latest_subs.values())
            evals = db.query(Evaluation).filter(Evaluation.submission_id.in_(sub_ids)).all()
            for eval_obj in evals:
                team_id = next((tid for tid, sid in team_latest_subs.items() if sid == eval_obj.submission_id), None)
                if team_id:
                    evaluations.append({
                        "id": eval_obj.id,
                        "team_id": team_id,
                        "status": "EVALUATED" if getattr(eval_obj, "status", None) == "evaluated" else "IN_PROGRESS",
                        "team_score": eval_obj.total_score,
                        "team_remarks": eval_obj.feedback,
                        "created_at": eval_obj.created_at.isoformat() if eval_obj.created_at else None,
                        "updated_at": eval_obj.updated_at.isoformat() if eval_obj.updated_at else None,
                    })

        from app.repositories.advisor_repository import get_advisor_teams_summary
        teams_summary = get_advisor_teams_summary(advisor_id)
        teams_by_id = {t["team_id"]: t for t in teams_summary}

        result = []
        for ev in evaluations:
            tid = ev.get("team_id")
            team_data = teams_by_id.get(tid, {})
            created = ev.get("created_at", "")
            result.append({
                "id": ev.get("id"),
                "team_id": tid,
                "title": f"Evaluation for {team_data.get('name', tid)}",
                "status": ev.get("status", "NOT_STARTED"),
                "team_score": ev.get("team_score"),
                "team_remarks": ev.get("team_remarks"),
                "created_at": created,
                "date": created[:10] if created else "",
            })

        return result
    finally:
        db.close()


@router.post("/teams/{team_id}/evaluations", summary="Create Advisor/Guide evaluation")
async def create_advisor_team_evaluation(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return save_team_evaluation_service(advisor_id, team_id, None, None, "IN_PROGRESS")


@router.get("/evaluations/{evaluation_id}", summary="View evaluation")
async def get_advisor_evaluation(evaluation_id: str, current_advisor: dict = Depends(get_current_advisor)):
    eval_record = get_evaluation_by_id(evaluation_id)
    if not eval_record:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return eval_record


@router.patch("/evaluations/{evaluation_id}", summary="Update evaluation")
async def update_advisor_evaluation(
    evaluation_id: str,
    request: Request,
    current_advisor: dict = Depends(get_current_advisor),
):
    advisor_id = current_advisor["id"]
    body = await request.json()
    eval_record = get_evaluation_by_id(evaluation_id)
    if not eval_record:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    team_id = str(eval_record["team_id"])
    team_score = body.get("team_score", eval_record.get("team_score"))
    team_remarks = body.get("team_remarks", eval_record.get("team_remarks"))
    status_val = body.get("status", eval_record.get("status"))
    return save_team_evaluation_service(advisor_id, team_id, team_score, team_remarks, status_val)


@router.post("/evaluations/{evaluation_id}/submit", summary="Finalize evaluation")
async def submit_advisor_evaluation(evaluation_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return transition_evaluation_status_service(advisor_id, evaluation_id, "SUBMITTED")


@router.patch("/evaluations/{evaluation_id}/visibility", summary="Show/hide marks")
async def update_advisor_evaluation_visibility(
    evaluation_id: str,
    request: Request,
    current_advisor: dict = Depends(get_current_advisor),
):
    return {"message": "Evaluation visibility updated", "evaluation_id": evaluation_id}


@router.patch("/evaluations/{evaluation_id}/release", summary="Set release date")
async def release_advisor_evaluation(
    evaluation_id: str,
    request: Request,
    current_advisor: dict = Depends(get_current_advisor),
):
    return {"message": "Evaluation released", "evaluation_id": evaluation_id}


@router.get("/teams/{team_id}/evaluations", summary="View team evaluations")
async def get_advisor_team_evaluations_list(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    advisor_id = current_advisor["id"]
    return get_student_evaluations_for_team_service(advisor_id, team_id)


# ==========================================
# ADVISOR CLASSES
# ==========================================

@router.get("/classes", summary="View assigned classes")
async def get_advisor_classes(current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Assigned classes"}


@router.post("/classes", summary="Create class")
async def create_advisor_class(current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Class created"}


@router.get("/classes/{class_id}", summary="Class details")
async def get_advisor_class_details(class_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Class details", "class_id": class_id}


@router.patch("/classes/{class_id}", summary="Update class")
async def update_advisor_class(class_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Class updated", "class_id": class_id}


@router.delete("/classes/{class_id}", summary="Delete class")
async def delete_advisor_class(class_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Class deleted", "class_id": class_id}


@router.get("/classes/{class_id}/students", summary="View enrolled students")
async def get_advisor_class_students(class_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Enrolled students", "class_id": class_id}


@router.post("/classes/{class_id}/students", summary="Enroll student")
async def enroll_advisor_class_student(class_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Student enrolled", "class_id": class_id}


@router.delete("/classes/{class_id}/students/{student_id}", summary="Remove student")
async def remove_advisor_class_student(class_id: str, student_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Student removed", "class_id": class_id, "student_id": student_id}


# ==========================================
# ADVISOR ANNOUNCEMENTS
# ==========================================

@router.get("/announcements", summary="View announcements")
async def get_advisor_announcements(current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Announcements"}


@router.post("/announcements", summary="Create department/class announcement")
async def create_advisor_announcement(current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Announcement created"}


@router.patch("/announcements/{announcement_id}", summary="Edit announcement")
async def edit_advisor_announcement(announcement_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Announcement edited", "announcement_id": announcement_id}


@router.delete("/announcements/{announcement_id}", summary="Delete announcement")
async def delete_advisor_announcement(announcement_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Announcement deleted", "announcement_id": announcement_id}
