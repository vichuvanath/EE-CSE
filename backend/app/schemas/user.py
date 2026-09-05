from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1, max_length=255)
    roll_number: Optional[str] = Field(default=None, max_length=50)
    role: str = Field(default="student", pattern="^(admin|faculty|student|advisor)$")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    roll_number: Optional[str] = Field(default=None, max_length=50)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    roll_number: Optional[str] = None
    created_at: Optional[datetime] = None


class StudentLoginRequest(BaseModel):
    roll_number: str = Field(min_length=1, max_length=50, description="Student Roll Number e.g. 23CS001")
    team_id: str = Field(min_length=1, description="Assigned Team ID")


class StudentLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class AdvisorLoginRequest(BaseModel):
    advisor_id: str = Field(min_length=1, max_length=255, description="Advisor ID, Roll Number, or Email")
    password: str = Field(min_length=1, description="Advisor Account Password")


class AdvisorLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class CurrentUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    roll_number: Optional[str] = None
    full_name: str
    email: str
    role: str
    team_id: Optional[str] = None
    created_at: Optional[datetime] = None


class LogoutResponse(BaseModel):
    message: str = "Successfully logged out"
