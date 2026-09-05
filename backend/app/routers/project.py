from fastapi import APIRouter, Depends
from app.schemas.project import ProjectUpdate, ProjectResponse
from app.services.project_service import get_my_project, update_my_project
from app.dependencies.auth import require_student

router = APIRouter(prefix="/project", tags=["Project Information"])


@router.get(
    "/me",
    response_model=ProjectResponse,
    summary="Get Authenticated Team's Project Information",
    description="Returns title, domain, problem statement, description, proposed solution, and technologies used for the current student's team.",
)
def get_my_project_information(current_user: dict = Depends(require_student)):
    return get_my_project(current_user["id"])


@router.put(
    "/me",
    response_model=ProjectResponse,
    summary="Create or Update Team's Project Information",
    description="Creates or updates project title, domain, problem statement, description, proposed solution, and technologies used for the current student's team.",
)
def update_my_project_information(
    payload: ProjectUpdate,
    current_user: dict = Depends(require_student),
):
    return update_my_project(current_user["id"], payload)
