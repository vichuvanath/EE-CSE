from fastapi import APIRouter, Depends
from app.schemas.submission import (
    SubmissionChecklistResponse,
    FinalSubmissionResponse,
    MySubmissionResponse,
)
from app.schemas.project import ProjectUpdate, ProjectResponse
from app.services.submission_service import (
    get_student_submission_checklist,
    submit_final_project,
    get_my_submission_overview,
    update_my_submission_project,
)
from app.dependencies.auth import require_student

router = APIRouter(prefix="/submission", tags=["Submissions"])


@router.get(
    "/checklist",
    response_model=SubmissionChecklistResponse,
    summary="Get Student Team Submission Checklist",
    description="Returns real-time completion status for Abstract, Project Report, PPT, Project Images, GitHub Link, and Live Demo Link.",
)
def get_submission_checklist(current_user: dict = Depends(require_student)):
    return get_student_submission_checklist(current_user["id"])


@router.post(
    "/final",
    response_model=FinalSubmissionResponse,
    summary="Submit Final Project",
    description="Officially submits the team's project after verifying that all 6 required checklist items are complete.",
)
def submit_project(current_user: dict = Depends(require_student)):
    return submit_final_project(current_user["id"])


@router.get(
    "/me",
    response_model=MySubmissionResponse,
    summary="Get My Team Submission Overview",
    description="Returns consolidated read-only view of team submission state, project metadata, checklist progress, and uploaded file metadata.",
)
def get_my_submission(current_user: dict = Depends(require_student)):
    return get_my_submission_overview(current_user["id"])


@router.put(
    "/me",
    response_model=ProjectResponse,
    summary="Edit Submission Project Information",
    description="Allows updating project details and links before final submission. Blocks updates with HTTP 409 Conflict if project is already submitted.",
)
def update_my_submission(
    payload: ProjectUpdate,
    current_user: dict = Depends(require_student),
):
    return update_my_submission_project(current_user["id"], payload)


