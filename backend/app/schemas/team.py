from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    project_title: str = Field(min_length=1, max_length=255)
    faculty_id: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    project_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    faculty_id: Optional[str] = None


class TeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    project_title: str
    faculty_id: Optional[str] = None
    created_at: Optional[datetime] = None


class TeamMemberCreate(BaseModel):
    student_id: str


class TeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    student_id: str
    added_by: Optional[str] = None
    added_at: Optional[datetime] = None


class TeamWithMembers(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    project_title: str
    faculty_id: Optional[str] = None
    members: list[dict] = []
    member_count: int = 0
    created_at: Optional[datetime] = None


class TeamMemberInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    is_team_leader: bool = False


class AdvisorInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None


class MyTeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: str
    name: Optional[str] = None
    project_title: Optional[str] = None
    team_leader: Optional[TeamMemberInfo] = None
    members: List[TeamMemberInfo] = []
    batch: Optional[str] = None
    section: Optional[str] = None
    advisor: Optional[AdvisorInfo] = None
