from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AdvisorTeamAssignmentCreate(BaseModel):
    advisor_id: str = Field(min_length=1, description="Advisor User Profile ID")
    team_id: str = Field(min_length=1, description="Target Team ID")


class AdvisorTeamAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    advisor_id: str
    team_id: str
    created_at: Optional[datetime] = None
