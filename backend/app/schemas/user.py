from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="student", pattern="^(admin|faculty|student)$")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
