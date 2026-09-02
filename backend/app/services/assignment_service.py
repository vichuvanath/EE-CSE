from typing import List, Dict
from fastapi import HTTPException, status
from app.repositories.assignment_repository import (
    create_assignment,
    check_assignment,
    get_assigned_team_ids,
    remove_assignment,
)
from app.repositories.user_repository import get_user_by_id
from app.repositories.team_repository import get_team_by_id


def check_advisor_team_access(advisor_id: str, team_id: str) -> bool:
    if not advisor_id or not team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Advisor ID and Team ID are required",
        )
    return check_assignment(advisor_id, team_id)


def get_advisor_assigned_team_ids(advisor_id: str) -> List[str]:
    user = get_user_by_id(advisor_id)
    if not user or user.role.lower() not in ["advisor", "faculty"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an advisor",
        )
    return get_assigned_team_ids(advisor_id)


def create_advisor_team_assignment(admin_user: dict, advisor_id: str, team_id: str) -> Dict:
    # Strictly require admin/HOD role to create assignments
    role = admin_user.get("role", "").lower()
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators or HODs can create advisor-team assignments",
        )

    # Validate advisor profile exists and is advisor/faculty
    advisor = get_user_by_id(advisor_id)
    if not advisor or advisor.role.lower() not in ["advisor", "faculty"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User '{advisor_id}' is not a valid advisor or faculty member",
        )

    # Validate target team exists
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    assignment = create_assignment(advisor_id, team_id)
    return assignment.model_dump()
