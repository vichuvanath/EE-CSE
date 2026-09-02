from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class StudentProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "student"


class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255, description="Full Name")
