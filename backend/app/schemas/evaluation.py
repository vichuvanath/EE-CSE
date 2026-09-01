from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EvaluationCreate(BaseModel):
    weekly_update_id: str
    score: float
    feedback: Optional[str] = None


class EvaluationUpdate(BaseModel):
    score: Optional[float] = None
    feedback: Optional[str] = None


class EvaluationResponse(BaseModel):
    id: str
    weekly_update_id: str
    faculty_id: str
    score: float
    feedback: Optional[str] = None
    graded_at: Optional[datetime] = None
    is_published: bool = False
    published_at: Optional[datetime] = None


class EvaluationPublish(BaseModel):
    is_published: bool
