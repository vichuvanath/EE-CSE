from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class DeadlineCreateRequest(BaseModel):
    title: Optional[str] = Field("Final Project Submission Deadline", description="Deadline title")
    description: Optional[str] = Field(None, description="Deadline instructions or details")
    deadline_at: datetime = Field(..., description="Deadline timestamp in ISO 8601 format (UTC)")


class DeadlineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    advisor_id: str
    title: str
    description: Optional[str] = None
    deadline_at: datetime
    status: str = Field("UPCOMING", description="Derived status: UPCOMING, DUE_SOON, OVERDUE")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AdvisorProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "advisor"
    roll_number: Optional[str] = None


class AdvisorProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, description="Updated full name")


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    recipient_id: str
    team_id: Optional[str] = None
    type: str
    title: str
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_count: int = 0
    unread_count: int = 0
    page: int = 1
    page_size: int = 20
    notifications: List[NotificationResponse] = []


class UnreadNotificationCountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    unread_count: int = 0
