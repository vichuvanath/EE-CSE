from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class WeeklyUpdateCreate(BaseModel):
    project_id: str
    week_number: int
    objective: str
    progress: Optional[str] = None
    challenges: Optional[str] = None
    submission_url: Optional[str] = None


class WeeklyUpdateUpdate(BaseModel):
    objective: Optional[str] = None
    progress: Optional[str] = None
    challenges: Optional[str] = None
    submission_url: Optional[str] = None


class WeeklyUpdateResponse(BaseModel):
    id: str
    project_id: str
    week_number: int
    objective: str
    progress: Optional[str] = None
    challenges: Optional[str] = None
    submission_url: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
