from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.repositories.advisor_repository import (
    get_advisor_teams_summary,
    get_advisor_team_details,
    get_advisor_students_list,
    get_advisor_student_detail,
    get_advisor_project_info,
)
from app.repositories.team_repository import get_team_by_id
from app.repositories.user_repository import get_user_by_id
from app.repositories.assignment_repository import check_assignment


def get_my_teams_service(advisor_id: str) -> List[Dict[str, Any]]:
    return get_advisor_teams_summary(advisor_id)


def get_team_details_service(advisor_id: str, team_id: str) -> Dict[str, Any]:
    # 1. Check if team exists in database
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    # 2. Check advisor assignment
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    team_details = get_advisor_team_details(advisor_id, team_id)
    if not team_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team details for team '{team_id}' not found",
        )
    return team_details


def get_students_list_service(advisor_id: str) -> List[Dict[str, Any]]:
    return get_advisor_students_list(advisor_id)


def get_student_details_service(advisor_id: str, student_id: str) -> Dict[str, Any]:
    # 1. Check if student profile exists
    user = get_user_by_id(student_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{student_id}' not found",
        )

    student_detail = get_advisor_student_detail(advisor_id, student_id)
    if not student_detail:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Student belongs to a team not assigned to this advisor",
        )
    return student_detail


def get_project_info_service(advisor_id: str, team_id: str) -> Dict[str, Any]:
    # 1. Check team existence
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    # 2. Check authorization
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    project_info = get_advisor_project_info(advisor_id, team_id)
    if not project_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project information has not been created yet for this team",
        )
    return project_info
