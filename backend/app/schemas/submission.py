from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.project import ProjectResponse
from app.schemas.file import FileMetadataResponse


class ChecklistItem(BaseModel):
    completed: bool
    label: str


class SubmissionChecklistResponse(BaseModel):
    abstract: ChecklistItem
    report: ChecklistItem
    ppt: ChecklistItem
    images: ChecklistItem
    github: ChecklistItem
    live_demo: ChecklistItem
    completed_count: int
    total_count: int = 6
    all_completed: bool


class FinalSubmissionResponse(BaseModel):
    message: str
    submission_id: str
    status: str
    submitted_at: datetime


class SubmissionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    team_id: str
    status: str
    submitted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MySubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission: Optional[SubmissionDetailResponse] = None
    project: Optional[ProjectResponse] = None
    checklist: SubmissionChecklistResponse
    files: List[FileMetadataResponse] = []
