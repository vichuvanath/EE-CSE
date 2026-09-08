from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Profile Schemas ---
class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str
    roll_number: str
    department: str
    batch: str
    phone_number: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class StudentProfileUpdate(BaseModel):
    phone_number: Optional[str] = Field(None, example="+1234567890")


# --- Team & Project Schemas ---
class TeamMemberResponse(BaseModel):
    student_id: str
    roll_number: str
    full_name: str
    email: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamResponse(BaseModel):
    id: str
    name: str
    class_id: str
    class_name: str
    project: Optional[ProjectResponse] = None
    members: List[TeamMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Deadline Schemas ---
class DeadlineResponse(BaseModel):
    id: str
    class_id: str
    title: str
    description: Optional[str] = None
    due_at: datetime
    is_overdue: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Submission & File Schemas ---
class SubmissionFileResponse(BaseModel):
    id: str
    submission_id: str
    file_name: str
    file_size: int
    mime_type: str
    storage_bucket: str
    download_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    title: str = Field(..., example="EE401 Interim Progress Report")
    description: Optional[str] = Field(None, example="Detailed report covering system design")
    submission_type: str = Field(default="interim_report", example="interim_report")


class SubmissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    submission_type: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: str
    project_id: str
    team_id: str
    submitted_by: Optional[str] = None
    title: str
    description: Optional[str] = None
    submission_type: str
    status: str
    created_at: datetime
    updated_at: datetime
    files: List[SubmissionFileResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int


# --- Evaluation Schemas ---
class EvaluationScoreResponse(BaseModel):
    id: str
    rubric_criterion: str
    max_score: float
    score: float
    comments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluationResponse(BaseModel):
    id: str
    submission_id: str
    feedback: Optional[str] = None
    total_score: Optional[float] = None
    created_at: datetime
    scores: List[EvaluationScoreResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Announcement Schemas ---
class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    is_read: bool = False

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard Schemas ---
class StudentDashboardResponse(BaseModel):
    profile: StudentProfileResponse
    team: Optional[TeamResponse] = None
    project: Optional[ProjectResponse] = None
    deadlines: List[DeadlineResponse] = []
    submissions: List[SubmissionResponse] = []
    unread_notifications_count: int = 0
    recent_notifications: List[NotificationResponse] = []
    evaluations: List[EvaluationResponse] = []
    announcements: List[AnnouncementResponse] = []
