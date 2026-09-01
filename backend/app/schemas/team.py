from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    project_title: str = Field(min_length=1, max_length=255)
    faculty_id: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    project_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    faculty_id: Optional[str] = None


class TeamResponse(BaseModel):
    id: str
    name: str
    project_title: str
    faculty_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeamMemberCreate(BaseModel):
    student_id: str


class TeamMemberResponse(BaseModel):
    id: str
    team_id: str
    student_id: str
    added_by: Optional[str] = None
    added_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeamWithMembers(BaseModel):
    id: str
    name: str
    project_title: str
    faculty_id: Optional[str] = None
    members: list[dict] = []
    member_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
