from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class StudentEvaluationCreateRequest(BaseModel):
    project_marks: float = Field(..., ge=0, le=20, description="Project marks (0-20)")
    presentation_marks: float = Field(..., ge=0, le=20, description="Presentation marks (0-20)")
    technical_marks: float = Field(..., ge=0, le=20, description="Technical marks (0-20)")
    documentation_marks: float = Field(..., ge=0, le=20, description="Documentation marks (0-20)")
    contribution_marks: float = Field(..., ge=0, le=20, description="Contribution marks (0-20)")
    remarks: Optional[str] = Field(None, description="Individual student evaluation remarks")


class StudentEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    evaluation_id: str
    student_id: str
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    project_marks: float = 0.0
    presentation_marks: float = 0.0
    technical_marks: float = 0.0
    documentation_marks: float = 0.0
    contribution_marks: float = 0.0
    total_marks: float = 0.0
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TeamEvaluationCreateRequest(BaseModel):
    team_score: float = Field(..., ge=0, le=100, description="Overall team evaluation score (0-100)")
    team_remarks: Optional[str] = Field(None, description="Overall team evaluation feedback")
    status: Optional[str] = Field("IN_PROGRESS", description="Evaluation state: NOT_STARTED, IN_PROGRESS, EVALUATED, SUBMITTED, LOCKED")


class TeamEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    advisor_id: str
    status: str = "IN_PROGRESS"
    team_score: Optional[float] = None
    team_remarks: Optional[str] = None
    student_evaluations: List[StudentEvaluationResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class EvaluationStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    evaluation_id: Optional[str] = None
    team_id: str
    status: str = "NOT_STARTED"
    is_locked: bool = False


class EvaluationStateTransitionRequest(BaseModel):
    status: str = Field(..., description="Target evaluation state: SUBMITTED, LOCKED")
