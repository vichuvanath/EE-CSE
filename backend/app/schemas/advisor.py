from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class FacultyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "faculty"


class TeamAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    faculty_id: str
    team_id: str
    assigned_at: Optional[str] = None


class TeamLeaderSummary(BaseModel):
    student_id: Optional[str] = None
    id: Optional[str] = None
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None


class AdvisorTeamSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    project_title: Optional[str] = None
    batch: Optional[str] = "2023-2027"
    section: Optional[str] = "A"
    leader: Optional[TeamLeaderSummary] = None
    member_count: int = 0
    submission_status: str = "NOT_SUBMITTED"
    created_at: Optional[str] = None


class AdvisorStudentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: Optional[str] = None
    id: Optional[str] = None
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_leader: bool = False
    is_team_leader: bool = False


class AdvisorTeamDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    project_title: Optional[str] = None
    batch: Optional[str] = "2023-2027"
    section: Optional[str] = "A"
    members: List[AdvisorStudentSummary] = []
    member_count: int = 0
    submission_status: str = "NOT_SUBMITTED"
    created_at: Optional[str] = None


class AdvisorStudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: Optional[str] = None
    id: Optional[str] = None
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "student"
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    is_leader: bool = False
    is_team_leader: bool = False


class AdvisorProjectFileSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: str
    original_filename: str
    file_size: int
    created_at: Optional[str] = None


class AdvisorProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: Optional[str] = None
    id: Optional[str] = None
    team_id: Optional[str] = None
    title: Optional[str] = None
    domain: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    proposed_solution: Optional[str] = None
    technologies_used: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    files: List[AdvisorProjectFileSummary] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
