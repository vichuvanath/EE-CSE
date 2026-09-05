from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from app.schemas.advisor import (
    AdvisorTeamSummaryResponse,
    AdvisorTeamDetailResponse,
    AdvisorStudentResponse,
    AdvisorProjectResponse,
)
from app.schemas.advisor_submission import (
    AdvisorSubmissionSummaryResponse,
    AdvisorSubmissionDetailResponse,
    AdvisorFileMetadataResponse,
    AdvisorFileDownloadResponse,
    SubmissionCompletenessResponse,
    SubmissionReviewCreateRequest,
    SubmissionReviewResponse,
    DocumentReviewCreateRequest,
    DocumentReviewResponse,
)
from app.schemas.advisor_evaluation import (
    StudentEvaluationCreateRequest,
    StudentEvaluationResponse,
    TeamEvaluationCreateRequest,
    TeamEvaluationResponse,
    EvaluationStatusResponse,
    EvaluationStateTransitionRequest,
)
from app.schemas.advisor_overview import (
    AdvisorDashboardResponse,
    AdvisorSearchResponse,
    EvaluationStatusOverviewResponse,
)
from app.schemas.advisor_extra import (
    DeadlineCreateRequest,
    DeadlineResponse,
    AdvisorProfileResponse,
    AdvisorProfileUpdateRequest,
    NotificationResponse,
    NotificationListResponse,
    UnreadNotificationCountResponse,
)

from app.services.advisor_service import (
    get_my_teams_service,
    get_team_details_service,
    get_students_list_service,
    get_student_details_service,
    get_project_info_service,
)
from app.services.advisor_submission_service import (
    get_my_submissions_service,
    get_team_submission_service,
    get_submission_by_id_service,
    get_submission_files_service,
    get_file_download_url_service,
    get_submission_completeness_service,
    save_submission_review_service,
    get_submission_review_service,
    get_document_review_service,
    save_document_review_service,
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
from app.services.advisor_overview_service import (
    get_dashboard_overview_service,
    search_records_service,
    get_evaluations_overview_service,
)
from app.services.advisor_extra_service import (
    get_my_deadlines_service,
    get_team_deadline_service,
    save_team_deadline_service,
    get_advisor_profile_service,
    update_advisor_profile_service,
    get_advisor_notifications_service,
    get_unread_notifications_service,
    mark_notification_read_service,
    mark_all_notifications_read_service,
)
from app.dependencies.auth import require_advisor

router = APIRouter(prefix="/advisor", tags=["Advisor Portal"])


# =====================================================================
# MODULE 18 — SUBMISSION DEADLINE MANAGEMENT
# =====================================================================

@router.get(
    "/deadlines",
    response_model=List[DeadlineResponse],
    summary="Get Assigned Team Deadlines",
    description="Returns list of submission deadlines for assigned teams with derived status (UPCOMING, DUE_SOON, OVERDUE).",
)
def get_my_deadlines_endpoint(current_advisor: dict = Depends(require_advisor)):
    return get_my_deadlines_service(current_advisor["id"])


@router.get(
    "/teams/{team_id}/deadline",
    response_model=DeadlineResponse,
    summary="Get Assigned Team Deadline",
    description="Returns submission deadline details for an assigned team.",
)
def get_team_deadline_endpoint(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_team_deadline_service(current_advisor["id"], team_id)


@router.post(
    "/teams/{team_id}/deadline",
    response_model=DeadlineResponse,
    summary="Save/Update Assigned Team Deadline",
    description="Saves or updates submission deadline timestamp and title for an assigned team.",
)
def save_team_deadline_endpoint(
    team_id: str,
    payload: DeadlineCreateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return save_team_deadline_service(
        advisor_id=current_advisor["id"],
        team_id=team_id,
        title=payload.title,
        deadline_at=payload.deadline_at,
        description=payload.description,
    )


# =====================================================================
# MODULE 19 — ADVISOR PROFILE
# =====================================================================

@router.get(
    "/profile",
    response_model=AdvisorProfileResponse,
    summary="Get Authenticated Advisor Profile",
    description="Returns profile details for the currently authenticated advisor derived strictly from JWT.",
)
def get_advisor_profile_endpoint(current_advisor: dict = Depends(require_advisor)):
    return get_advisor_profile_service(current_advisor["id"])


@router.put(
    "/profile",
    response_model=AdvisorProfileResponse,
    summary="Update Authenticated Advisor Profile",
    description="Updates editable profile fields (e.g. full_name) for the authenticated advisor.",
)
def update_advisor_profile_endpoint(
    payload: AdvisorProfileUpdateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return update_advisor_profile_service(current_advisor["id"], payload.full_name)


# =====================================================================
# MODULE 20 — NOTIFICATIONS
# =====================================================================

@router.get(
    "/notifications",
    response_model=NotificationListResponse,
    summary="Get Advisor Notifications",
    description="Returns paginated list of notifications for the authenticated advisor.",
)
def get_advisor_notifications_endpoint(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_advisor: dict = Depends(require_advisor),
):
    return get_advisor_notifications_service(current_advisor["id"], page=page, page_size=page_size)


@router.get(
    "/notifications/unread",
    response_model=UnreadNotificationCountResponse,
    summary="Get Unread Notification Count",
    description="Returns total unread notification count for the authenticated advisor.",
)
def get_unread_notifications_endpoint(current_advisor: dict = Depends(require_advisor)):
    return get_unread_notifications_service(current_advisor["id"])


@router.patch(
    "/notifications/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark Notification As Read",
    description="Marks a specific notification as read.",
)
def mark_notification_read_endpoint(
    notification_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return mark_notification_read_service(current_advisor["id"], notification_id)


@router.patch(
    "/notifications/read-all",
    summary="Mark All Notifications As Read",
    description="Marks all unread notifications as read for the authenticated advisor.",
)
def mark_all_notifications_read_endpoint(current_advisor: dict = Depends(require_advisor)):
    return mark_all_notifications_read_service(current_advisor["id"])


# =====================================================================
# MODULE 15 — ADVISOR DASHBOARD
# =====================================================================

@router.get(
    "/dashboard",
    response_model=AdvisorDashboardResponse,
    summary="Get Advisor Dashboard Statistics",
    description="Returns live database statistics for assigned teams, students, projects, submissions, pending reviews, and evaluation breakdown.",
)
def get_advisor_dashboard_endpoint(current_advisor: dict = Depends(require_advisor)):
    return get_dashboard_overview_service(current_advisor["id"])


# =====================================================================
# MODULE 16 — SEARCH & FILTER
# =====================================================================

@router.get(
    "/search",
    response_model=AdvisorSearchResponse,
    summary="Authorization-Safe Search & Filter",
    description="Performs authorization-safe search across assigned teams, students, projects, and evaluations with pagination.",
)
def search_advisor_records_endpoint(
    q: Optional[str] = Query(None, description="Search query string"),
    type: Optional[str] = Query("all", description="Search type: team, student, project, evaluation, all"),
    status: Optional[str] = Query(None, description="Filter by status"),
    batch: Optional[str] = Query(None, description="Filter by batch"),
    section: Optional[str] = Query(None, description="Filter by section"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    current_advisor: dict = Depends(require_advisor),
):
    return search_records_service(
        advisor_id=current_advisor["id"],
        q=q,
        search_type=type,
        status=status,
        batch=batch,
        section=section,
        page=page,
        page_size=page_size,
    )


# =====================================================================
# MODULE 17 — EVALUATION STATUS OVERVIEW
# =====================================================================

@router.get(
    "/evaluations/overview",
    response_model=EvaluationStatusOverviewResponse,
    summary="Get Evaluation Status Progress Overview",
    description="Returns state machine progress breakdown (NOT_STARTED, IN_PROGRESS, EVALUATED, SUBMITTED, LOCKED) across assigned teams.",
)
def get_evaluations_overview_endpoint(current_advisor: dict = Depends(require_advisor)):
    return get_evaluations_overview_service(current_advisor["id"])


@router.get(
    "/teams",
    response_model=List[AdvisorTeamSummaryResponse],
    summary="Get My Assigned Teams",
    description="Returns list of team summaries assigned to the currently authenticated advisor.",
)
def get_my_teams(current_advisor: dict = Depends(require_advisor)):
    return get_my_teams_service(current_advisor["id"])


@router.get(
    "/teams/{team_id}",
    response_model=AdvisorTeamDetailResponse,
    summary="Get Assigned Team Details",
    description="Returns detailed team information, members list, project summary, and submission status for an assigned team.",
)
def get_team_details(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_team_details_service(current_advisor["id"], team_id)


@router.get(
    "/students",
    response_model=List[AdvisorStudentResponse],
    summary="Get My Assigned Students",
    description="Returns list of student profiles belonging to the advisor's assigned teams.",
)
def get_advisor_students(current_advisor: dict = Depends(require_advisor)):
    return get_students_list_service(current_advisor["id"])


@router.get(
    "/students/{student_id}",
    response_model=AdvisorStudentResponse,
    summary="Get Student Details",
    description="Returns profile details for a student belonging to an advisor's assigned team.",
)
def get_student_details(
    student_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_student_details_service(current_advisor["id"], student_id)


@router.get(
    "/teams/{team_id}/project",
    response_model=AdvisorProjectResponse,
    summary="Get Assigned Team Project Information",
    description="Returns project details and uploaded files metadata list for an assigned team.",
)
def get_team_project(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_project_info_service(current_advisor["id"], team_id)


# =====================================================================
# MODULE 8 — SUBMISSION MANAGEMENT
# =====================================================================

@router.get(
    "/submissions",
    response_model=List[AdvisorSubmissionSummaryResponse],
    summary="Get My Assigned Team Submissions",
    description="Returns list of submissions for teams assigned to the currently authenticated advisor.",
)
def get_my_submissions(current_advisor: dict = Depends(require_advisor)):
    return get_my_submissions_service(current_advisor["id"])


@router.get(
    "/teams/{team_id}/submission",
    response_model=AdvisorSubmissionDetailResponse,
    summary="Get Assigned Team Submission",
    description="Returns full submission details for an assigned team.",
)
def get_team_submission(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_team_submission_service(current_advisor["id"], team_id)


@router.get(
    "/submissions/{submission_id}",
    response_model=AdvisorSubmissionDetailResponse,
    summary="Get Submission By ID",
    description="Returns full submission details by submission ID with advisor assignment validation.",
)
def get_submission_by_id_endpoint(
    submission_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_submission_by_id_service(current_advisor["id"], submission_id)


# =====================================================================
# MODULE 9 — PROJECT FILE ACCESS
# =====================================================================

@router.get(
    "/submissions/{submission_id}/files",
    response_model=List[AdvisorFileMetadataResponse],
    summary="Get Submission Uploaded Files Metadata",
    description="Returns metadata list of files uploaded for a submission.",
)
def get_submission_files_endpoint(
    submission_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_submission_files_service(current_advisor["id"], submission_id)


@router.get(
    "/files/{file_id}/download",
    response_model=AdvisorFileDownloadResponse,
    summary="Get Secure File Download Signed URL",
    description="Generates a secure 1-hour signed URL to download/view a project file from private Supabase storage.",
)
def get_file_download_url_endpoint(
    file_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_file_download_url_service(current_advisor["id"], file_id)


# =====================================================================
# MODULE 10 — SUBMISSION REVIEW
# =====================================================================

@router.get(
    "/submissions/{submission_id}/completeness",
    response_model=SubmissionCompletenessResponse,
    summary="Get Submission Completeness Checklist",
    description="Returns checklist status for required submission components.",
)
def get_submission_completeness(
    submission_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_submission_completeness_service(current_advisor["id"], submission_id)


@router.get(
    "/submissions/{submission_id}/review",
    response_model=SubmissionReviewResponse,
    summary="Get Submission Review Status & Remarks",
    description="Returns persistent submission review status and remarks.",
)
def get_submission_review_endpoint(
    submission_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_submission_review_service(current_advisor["id"], submission_id)


@router.post(
    "/submissions/{submission_id}/review",
    response_model=SubmissionReviewResponse,
    summary="Save/Update Submission Review",
    description="Saves or updates persistent submission review status and advisor remarks.",
)
def save_submission_review_endpoint(
    submission_id: str,
    payload: SubmissionReviewCreateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return save_submission_review_service(current_advisor["id"], submission_id, payload.status, payload.remarks)


# =====================================================================
# MODULE 11 — DOCUMENT REVIEW
# =====================================================================

@router.get(
    "/files/{file_id}/review",
    response_model=DocumentReviewResponse,
    summary="Get Document Review Status & Remarks",
    description="Returns document-level review status and remarks for ABSTRACT, REPORT, or PPT.",
)
def get_document_review_endpoint(
    file_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_document_review_service(current_advisor["id"], file_id)


@router.post(
    "/files/{file_id}/review",
    response_model=DocumentReviewResponse,
    summary="Save/Update Document Review",
    description="Saves or updates document-level review status and remarks for ABSTRACT, REPORT, or PPT.",
)
def save_document_review_endpoint(
    file_id: str,
    payload: DocumentReviewCreateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return save_document_review_service(current_advisor["id"], file_id, payload.status, payload.remarks)


# =====================================================================
# MODULE 12 & 13 — TEAM & STUDENT EVALUATION
# =====================================================================

@router.get(
    "/teams/{team_id}/evaluation",
    response_model=TeamEvaluationResponse,
    summary="Get Team Evaluation & Student Scores",
    description="Returns overall team evaluation score, remarks, status, and list of individual student evaluations.",
)
def get_team_evaluation_endpoint(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_team_evaluation_service(current_advisor["id"], team_id)


@router.post(
    "/teams/{team_id}/evaluation",
    response_model=TeamEvaluationResponse,
    summary="Save/Update Team Evaluation",
    description="Saves or updates team-level score and remarks. Rejects edits if evaluation is LOCKED.",
)
def save_team_evaluation_endpoint(
    team_id: str,
    payload: TeamEvaluationCreateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return save_team_evaluation_service(current_advisor["id"], team_id, payload.team_score, payload.team_remarks, payload.status)


@router.get(
    "/teams/{team_id}/students/evaluations",
    response_model=List[StudentEvaluationResponse],
    summary="List Team Student Evaluations",
    description="Returns list of individual student evaluation records for an assigned team.",
)
def get_student_evaluations_for_team_endpoint(
    team_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_student_evaluations_for_team_service(current_advisor["id"], team_id)


@router.get(
    "/student-evaluations/{student_evaluation_id}",
    response_model=StudentEvaluationResponse,
    summary="Get Student Evaluation By ID",
    description="Returns individual student evaluation record by ID.",
)
def get_student_evaluation_by_id_endpoint(
    student_evaluation_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_student_evaluation_by_id_service(current_advisor["id"], student_evaluation_id)


@router.post(
    "/teams/{team_id}/students/{student_id}/evaluation",
    response_model=StudentEvaluationResponse,
    summary="Save/Update Student Evaluation",
    description="Saves or updates individual student evaluation marks. Server-side total marks are automatically calculated. Rejects edits if evaluation is LOCKED.",
)
def save_student_evaluation_endpoint(
    team_id: str,
    student_id: str,
    payload: StudentEvaluationCreateRequest,
    current_advisor: dict = Depends(require_advisor),
):
    return save_student_evaluation_service(
        advisor_id=current_advisor["id"],
        team_id=team_id,
        student_id=student_id,
        project_marks=payload.project_marks,
        presentation_marks=payload.presentation_marks,
        technical_marks=payload.technical_marks,
        documentation_marks=payload.documentation_marks,
        contribution_marks=payload.contribution_marks,
        remarks=payload.remarks,
    )


# =====================================================================
# MODULE 14 — EVALUATION MANAGEMENT & LOCKING
# =====================================================================

@router.post(
    "/evaluations/{evaluation_id}/submit",
    response_model=TeamEvaluationResponse,
    summary="Submit Team Evaluation",
    description="Transitions evaluation status to SUBMITTED.",
)
def submit_evaluation_endpoint(
    evaluation_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return transition_evaluation_status_service(current_advisor["id"], evaluation_id, "SUBMITTED")


@router.post(
    "/evaluations/{evaluation_id}/lock",
    response_model=TeamEvaluationResponse,
    summary="Lock Team Evaluation (Make Immutable)",
    description="Transitions evaluation status to LOCKED. Permanently prevents any further modifications.",
)
def lock_evaluation_endpoint(
    evaluation_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return transition_evaluation_status_service(current_advisor["id"], evaluation_id, "LOCKED")


@router.get(
    "/evaluations/{evaluation_id}/status",
    response_model=EvaluationStatusResponse,
    summary="Get Evaluation Status & Lock State",
    description="Returns current status and lock flag for an evaluation.",
)
def get_evaluation_status_endpoint(
    evaluation_id: str,
    current_advisor: dict = Depends(require_advisor),
):
    return get_evaluation_status_service(current_advisor["id"], evaluation_id)
