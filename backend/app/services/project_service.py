from fastapi import HTTPException, status
from app.repositories.team_repository import get_student_team
from app.repositories.project_repository import (
    get_project_by_team_id,
    upsert_project,
)
from app.schemas.project import ProjectUpdate


def get_my_project(student_id: str) -> dict:
    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    project = get_project_by_team_id(team.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project information has not been created yet for this team",
        )

    return project.model_dump()


def update_my_project(student_id: str, data: ProjectUpdate) -> dict:
    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    # Input validation
    if data.title is not None and len(data.title.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project title cannot be empty",
        )

    # Check if project is already officially submitted
    existing_project = get_project_by_team_id(team.id)
    if existing_project:
        from app.repositories.submission_repository import get_submission_by_project_id
        existing_sub = get_submission_by_project_id(existing_project.id)
        if existing_sub and isinstance(existing_sub, dict) and existing_sub.get("status") == "SUBMITTED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted projects cannot be edited",
            )


    project = upsert_project(team.id, data)
    return project.model_dump()

