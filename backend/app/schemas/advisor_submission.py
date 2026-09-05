from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AdvisorSubmissionSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission_id: Optional[str] = None
    id: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    project_title: Optional[str] = None
    status: str = "SUBMITTED"
    submitted_at: Optional[str] = None
    review_status: str = "PENDING"


class AdvisorSubmissionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission_id: Optional[str] = None
    id: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    status: str = "SUBMITTED"
    submitted_at: Optional[str] = None
    review_status: str = "PENDING"
    review_remarks: Optional[str] = None
    reviewed_at: Optional[str] = None


class AdvisorFileMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    file_id: Optional[str] = None
    id: Optional[str] = None
    project_id: Optional[str] = None
    team_id: Optional[str] = None
    category: Optional[str] = None
    original_filename: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    storage_path: Optional[str] = None
    review_status: str = "PENDING"
    review_remarks: Optional[str] = None
    created_at: Optional[str] = None


class AdvisorFileDownloadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    file_id: Optional[str] = None
    id: Optional[str] = None
    original_filename: Optional[str] = None
    category: Optional[str] = None
    mime_type: Optional[str] = None
    download_url: Optional[str] = None
    expires_in_seconds: int = 3600


class SubmissionCompletenessItem(BaseModel):
    category: str
    label: str
    completed: bool


class SubmissionCompletenessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    all_completed: bool
    completion_status: Optional[str] = "COMPLETE"
    items: List[SubmissionCompletenessItem] = []


class SubmissionReviewCreateRequest(BaseModel):
    status: str = Field(..., description="Review status: PENDING, IN_REVIEW, REVIEWED, APPROVED, CHANGES_REQUESTED")
    remarks: Optional[str] = Field(None, description="Advisor review comments or feedback")


class SubmissionReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    submission_id: Optional[str] = None
    advisor_id: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DocumentReviewCreateRequest(BaseModel):
    status: str = Field(..., description="Document review status: PENDING, IN_REVIEW, APPROVED, NEEDS_REVISION")
    remarks: Optional[str] = Field(None, description="Advisor document review comments")


class DocumentReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    file_id: Optional[str] = None
    category: Optional[str] = None
    advisor_id: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

