from datetime import datetime
from typing import Optional
from urllib.parse import urlparse
from pydantic import BaseModel, Field, field_validator, ConfigDict


def _validate_url(v: Optional[str], required_domain: Optional[str] = None) -> Optional[str]:
    if v is None:
        return None
    val = v.strip()
    if not val:
        return None

    try:
        parsed = urlparse(val)
    except Exception:
        raise ValueError("Invalid URL structure")

    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme '{parsed.scheme}'. Must be http or https")

    host = parsed.netloc.lower().split(":")[0]
    if not host:
        raise ValueError("Invalid URL: missing host domain")

    if required_domain:
        if host != required_domain and not host.endswith("." + required_domain):
            raise ValueError(f"URL domain must point to {required_domain}")

    return val


class ProjectCreate(BaseModel):
    team_id: Optional[str] = None
    title: str = Field(min_length=1, max_length=255, description="Project Title")
    domain: Optional[str] = Field(default=None, max_length=255, description="Project Domain/Category")
    problem_statement: Optional[str] = Field(default=None, max_length=5000, description="Problem Statement")
    description: Optional[str] = Field(default=None, max_length=5000, description="Project Description")
    proposed_solution: Optional[str] = Field(default=None, max_length=5000, description="Proposed Solution")
    technologies_used: Optional[str] = Field(default=None, max_length=1000, description="Technologies Used")
    github_url: Optional[str] = Field(default=None, max_length=500)
    live_demo_url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("github_url")
    @classmethod
    def validate_github_url(cls, v: Optional[str]) -> Optional[str]:
        return _validate_url(v, required_domain="github.com")

    @field_validator("live_demo_url")
    @classmethod
    def validate_live_demo_url(cls, v: Optional[str]) -> Optional[str]:
        return _validate_url(v)


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255, description="Project Title")
    domain: Optional[str] = Field(default=None, max_length=255, description="Project Domain/Category")
    problem_statement: Optional[str] = Field(default=None, max_length=5000, description="Problem Statement")
    description: Optional[str] = Field(default=None, max_length=5000, description="Project Description")
    proposed_solution: Optional[str] = Field(default=None, max_length=5000, description="Proposed Solution")
    technologies_used: Optional[str] = Field(default=None, max_length=1000, description="Technologies Used")
    github_url: Optional[str] = Field(default=None, max_length=500)
    live_demo_url: Optional[str] = Field(default=None, max_length=500)
    status: Optional[str] = Field(default=None, max_length=50)

    @field_validator("github_url")
    @classmethod
    def validate_github_url(cls, v: Optional[str]) -> Optional[str]:
        return _validate_url(v, required_domain="github.com")

    @field_validator("live_demo_url")
    @classmethod
    def validate_live_demo_url(cls, v: Optional[str]) -> Optional[str]:
        return _validate_url(v)


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    title: Optional[str] = None
    domain: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    proposed_solution: Optional[str] = None
    technologies_used: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    status: Optional[str] = "ongoing"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
