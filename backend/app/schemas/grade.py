from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class GradeCreate(BaseModel):
    progress_report_id: str
    grade: Decimal = Field(ge=0, le=100)
    feedback: Optional[str] = None


class GradeUpdate(BaseModel):
    grade: Optional[Decimal] = Field(default=None, ge=0, le=100)
    feedback: Optional[str] = None


class GradeVisibilityUpdate(BaseModel):
    is_visible: bool


class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    progress_report_id: str
    faculty_id: str
    grade: Decimal
    feedback: Optional[str] = None
    is_visible: bool = False
    graded_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
