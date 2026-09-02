from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AdvisorDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_assigned_teams: int = 0
    total_students: int = 0
    total_projects: int = 0
    total_submissions: int = 0
    pending_submission_reviews: int = 0
    pending_document_reviews: int = 0
    teams_evaluated: int = 0
    teams_not_evaluated: int = 0
    teams_in_progress: int = 0
    teams_submitted: int = 0
    teams_locked: int = 0


class SearchTeamResult(BaseModel):
    team_id: str
    name: str
    batch: Optional[str] = "2023-2027"
    section: Optional[str] = "A"
    project_title: Optional[str] = None
    member_count: int = 0
    submission_status: str = "NOT_SUBMITTED"
    evaluation_status: str = "NOT_STARTED"


class SearchStudentResult(BaseModel):
    student_id: str
    full_name: Optional[str] = None
    roll_number: Optional[str] = None
    email: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None


class SearchProjectResult(BaseModel):
    project_id: str
    team_id: str
    team_name: str
    title: str
    domain: Optional[str] = None
    submission_status: str = "NOT_SUBMITTED"


class SearchEvaluationResult(BaseModel):
    evaluation_id: str
    team_id: str
    team_name: str
    status: str = "NOT_STARTED"
    team_score: Optional[float] = None


class SearchResultsContainer(BaseModel):
    teams: List[SearchTeamResult] = []
    students: List[SearchStudentResult] = []
    projects: List[SearchProjectResult] = []
    evaluations: List[SearchEvaluationResult] = []


class AdvisorSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: Optional[str] = None
    total_count: int = 0
    page: int = 1
    page_size: int = 20
    results: SearchResultsContainer = SearchResultsContainer()


class EvaluationTeamProgressItem(BaseModel):
    team_id: str
    team_name: str
    batch: Optional[str] = "2023-2027"
    section: Optional[str] = "A"
    project_title: Optional[str] = None
    evaluation_id: Optional[str] = None
    evaluation_status: str = "NOT_STARTED"
    team_score: Optional[float] = None
    student_evaluations_count: int = 0
    total_team_members: int = 0
    is_locked: bool = False


class EvaluationStatusOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_teams: int = 0
    not_started_count: int = 0
    in_progress_count: int = 0
    evaluated_count: int = 0
    submitted_count: int = 0
    locked_count: int = 0
    teams: List[EvaluationTeamProgressItem] = []
