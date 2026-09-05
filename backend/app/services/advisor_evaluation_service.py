from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.repositories.advisor_evaluation_repository import (
    get_team_evaluation,
    get_evaluation_by_id,
    upsert_team_evaluation,
    update_evaluation_status,
    get_student_evaluations_for_team,
    get_student_evaluation_by_id,
    upsert_student_evaluation,
)
from app.repositories.team_repository import get_team_by_id, get_team_members
from app.repositories.user_repository import get_user_by_id
from app.repositories.assignment_repository import check_assignment

VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "EVALUATED", "SUBMITTED", "LOCKED"]


def get_team_evaluation_service(advisor_id: str, team_id: str) -> Dict[str, Any]:
    # 1. Team existence
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    # 2. Team authorization
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    eval_record = get_team_evaluation(team_id)
    if not eval_record:
        eval_record = {
            "id": "not_created",
            "team_id": team_id,
            "advisor_id": advisor_id,
            "status": "NOT_STARTED",
            "team_score": None,
            "team_remarks": None,
            "created_at": None,
            "updated_at": None,
        }

    student_evals = get_student_evaluations_for_team(team_id)
    eval_record["student_evaluations"] = student_evals
    return eval_record


def save_team_evaluation_service(
    advisor_id: str,
    team_id: str,
    team_score: Optional[float],
    team_remarks: Optional[str],
    status_val: Optional[str],
) -> Dict[str, Any]:
    # 1. Team existence
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    # 2. Team authorization
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    # 3. Check existing lock status
    existing = get_team_evaluation(team_id)
    if existing and existing.get("status") == "LOCKED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evaluation is LOCKED and cannot be modified",
        )

    # 4. Validate new status if provided
    clean_status = None
    if status_val:
        clean_status = status_val.upper().strip()
        if clean_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid evaluation status '{status_val}'. Allowed: {', '.join(VALID_STATUSES)}",
            )

    # Automatically progress NOT_STARTED -> IN_PROGRESS on save
    if not clean_status:
        if not existing or existing.get("status") == "NOT_STARTED":
            clean_status = "IN_PROGRESS"

    return upsert_team_evaluation(team_id, advisor_id, team_score, team_remarks, clean_status)


def get_student_evaluations_for_team_service(advisor_id: str, team_id: str) -> List[Dict[str, Any]]:
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    return get_student_evaluations_for_team(team_id)


def get_student_evaluation_by_id_service(advisor_id: str, student_eval_id: str) -> Dict[str, Any]:
    student_eval = get_student_evaluation_by_id(student_eval_id)
    if not student_eval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student evaluation '{student_eval_id}' not found",
        )

    eval_record = get_evaluation_by_id(student_eval["evaluation_id"])
    if not eval_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent evaluation record not found",
        )

    team_id = str(eval_record["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Student evaluation belongs to a team not assigned to this advisor",
        )

    return student_eval


def save_student_evaluation_service(
    advisor_id: str,
    team_id: str,
    student_id: str,
    project_marks: float,
    presentation_marks: float,
    technical_marks: float,
    documentation_marks: float,
    contribution_marks: float,
    remarks: Optional[str],
) -> Dict[str, Any]:
    # 1. Check team existence & advisor authorization
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    # 2. Check student existence & membership in team
    user = get_user_by_id(student_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{student_id}' not found",
        )

    members = get_team_members(team_id)
    member_student_ids = [str(m.get("student_id")) for m in members]
    if str(student_id) not in member_student_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student '{student_id}' does not belong to Team '{team_id}'",
        )

    # 3. Check existing lock status
    eval_record = get_team_evaluation(team_id)
    if eval_record and eval_record.get("status") == "LOCKED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evaluation is LOCKED and cannot be modified",
        )

    # 4. Initialize evaluation container if not exists
    if not eval_record:
        eval_record = upsert_team_evaluation(team_id, advisor_id, status_val="IN_PROGRESS")

    eval_id = eval_record["id"]

    # 5. SERVER-SIDE TOTAL MARKS CALCULATION
    total_marks = (
        float(project_marks)
        + float(presentation_marks)
        + float(technical_marks)
        + float(documentation_marks)
        + float(contribution_marks)
    )

    return upsert_student_evaluation(
        evaluation_id=eval_id,
        student_id=student_id,
        project_marks=project_marks,
        presentation_marks=presentation_marks,
        technical_marks=technical_marks,
        documentation_marks=documentation_marks,
        contribution_marks=contribution_marks,
        total_marks=total_marks,
        remarks=remarks,
    )


def transition_evaluation_status_service(
    advisor_id: str, evaluation_id: str, target_status: str
) -> Dict[str, Any]:
    eval_record = get_evaluation_by_id(evaluation_id)
    if not eval_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation '{evaluation_id}' not found",
        )

    team_id = str(eval_record["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Evaluation belongs to a team not assigned to this advisor",
        )

    current_status = eval_record.get("status", "NOT_STARTED")
    target = target_status.upper().strip()

    if target not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target status '{target_status}'. Allowed: {', '.join(VALID_STATUSES)}",
        )

    # LOCKED Immutability Check
    if current_status == "LOCKED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evaluation is LOCKED and cannot be modified or transitioned",
        )

    # Valid transitions validation
    allowed_transitions = {
        "NOT_STARTED": ["IN_PROGRESS", "EVALUATED"],
        "IN_PROGRESS": ["EVALUATED", "SUBMITTED", "LOCKED"],
        "EVALUATED": ["SUBMITTED", "LOCKED", "IN_PROGRESS"],
        "SUBMITTED": ["LOCKED"],
    }

    if target not in allowed_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition evaluation status from '{current_status}' to '{target}'",
        )

    return update_evaluation_status(evaluation_id, target)


def get_evaluation_status_service(advisor_id: str, evaluation_id: str) -> Dict[str, Any]:
    eval_record = get_evaluation_by_id(evaluation_id)
    if not eval_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation '{evaluation_id}' not found",
        )

    team_id = str(eval_record["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Evaluation belongs to a team not assigned to this advisor",
        )

    curr_status = eval_record.get("status", "NOT_STARTED")
    return {
        "evaluation_id": evaluation_id,
        "team_id": team_id,
        "status": curr_status,
        "is_locked": curr_status == "LOCKED",
        "created_at": eval_record.get("created_at"),
        "updated_at": eval_record.get("updated_at"),
    }
