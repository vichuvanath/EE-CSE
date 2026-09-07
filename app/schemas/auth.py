from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., example="student@university.edu")
    password: str = Field(..., min_length=6, example="password123")


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., example="your-refresh-token")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., example="student@university.edu")


class ResetPasswordRequest(BaseModel):
    access_token: str = Field(..., description="Reset access token received via email")
    new_password: str = Field(..., min_length=6, example="newsecurepassword123")


class MessageResponse(BaseModel):
    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class APIErrorResponse(BaseModel):
    error: ErrorDetail
