# app/routers/advisors.py
from fastapi import APIRouter, Depends, HTTPException, Request, status
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

@router.get("/teams/{team_id}/submission", summary="Get team's latest submission")
async def get_advisor_team_submission(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()
        if not sub:
            return None
        return {
            "id": sub.id,
            "team_id": sub.team_id,
            "title": sub.title,
            "status": sub.status,
            "submission_type": sub.submission_type,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
        }
    finally:
        db.close()


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
    team_remarks = body.get("team_remarks")
    status_val = body.get("status")
    return save_team_evaluation_service(advisor_id, team_id, team_score, team_remarks, status_val)


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
async def get_advisor_submissions(current_advisor: dict = Depends(get_current_advisor)):
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
        subs = db.query(Submission).filter(Submission.team_id.in_(team_ids)).order_by(Submission.created_at.desc()).all()
        return [{
            "id": s.id,
            "team_id": s.team_id,
            "title": s.title,
            "status": s.status,
            "submission_type": s.submission_type,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        } for s in subs]
    finally:
        db.close()


@router.get("/submissions/{submission_id}", summary="View submission details")
async def get_advisor_submission_details(submission_id: str, current_advisor: dict = Depends(get_current_advisor)):
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
        return {
            "id": sub.id,
            "team_id": sub.team_id,
            "title": sub.title,
            "status": sub.status,
            "submission_type": sub.submission_type,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
        }
    finally:
        db.close()


@router.get("/submissions/{submission_id}/files", summary="Access submission files")
async def get_advisor_submission_files(submission_id: str, current_advisor: dict = Depends(get_current_advisor)):
    from app.core.database import SessionLocal
    from app.models.submission import SubmissionFile
    db = SessionLocal()
    try:
        files = db.query(SubmissionFile).filter(SubmissionFile.submission_id == submission_id).all()
        return [{
            "id": f.id,
            "file_name": f.file_name,
            "file_size": f.file_size,
            "mime_type": f.mime_type,
            "category": f.category,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        } for f in files]
    finally:
        db.close()


@router.get("/teams/{team_id}/submissions", summary="View team's submissions")
async def get_advisor_team_submissions(team_id: str, current_advisor: dict = Depends(get_current_advisor)):
    from app.core.database import SessionLocal
    from app.models.submission import Submission
    db = SessionLocal()
    try:
        subs = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).all()
        return [{
            "id": s.id,
            "title": s.title,
            "status": s.status,
            "submission_type": s.submission_type,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        } for s in subs]
    finally:
        db.close()


@router.patch("/submissions/{submission_id}/status", summary="Update submission review status")
async def update_advisor_submission_status(submission_id: str, current_advisor: dict = Depends(get_current_advisor)):
    return {"message": "Submission status updated", "submission_id": submission_id}


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

        supabase = get_supabase_client()
        res = supabase.table("evaluations").select("*").in_("team_id", team_ids).execute()
        evaluations = res.data or []

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
