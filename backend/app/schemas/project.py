from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    team_id: str
    title: str
    description: Optional[str] = None
    github_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    team_id: str
    title: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
