from fastapi import APIRouter, Depends
from app.schemas.team import MyTeamResponse
from app.services.team_service import get_my_team
from app.dependencies.auth import require_student

router = APIRouter(prefix="/team", tags=["My Team"])


@router.get(
    "/me",
    response_model=MyTeamResponse,
    summary="Get Authenticated Student Team Details",
    description="Returns team, team leader, members, project title, batch, section, and assigned advisor for the current student.",
)
def get_my_team_details(current_user: dict = Depends(require_student)):
    return get_my_team(current_user["id"])
