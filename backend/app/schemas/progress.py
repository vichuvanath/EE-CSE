from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProgressCreate(BaseModel):
    team_id: str
    week_number: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)


class ProgressUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = Field(default=None, min_length=1)


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    week_number: int
    title: str
    content: str
    submitted_by: Optional[str] = None
    submitted_at: Optional[datetime] = None
