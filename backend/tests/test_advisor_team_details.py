import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorTeamDetailsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    @patch("app.services.advisor_service.check_assignment")
    @patch("app.services.advisor_service.get_advisor_team_details")
    def test_get_assigned_team_details_success(
        self, mock_details, mock_check, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_details.return_value = {
            "team_id": "team-01",
            "name": "Team Alpha",
            "project_title": "Smart City AI",
            "batch": "2023-2027",
            "section": "A",
            "member_count": 2,
            "team_leader": {"id": "std-1", "full_name": "Alice", "is_team_leader": True},
            "advisor": {"id": "advisor-a", "full_name": "Dr. Smith"},
            "members": [
                {"id": "std-1", "full_name": "Alice", "is_team_leader": True},
                {"id": "std-2", "full_name": "Bob", "is_team_leader": False},
            ],
            "project": {"id": "proj-1", "title": "Smart City AI"},
            "submission": {"id": "sub-1", "status": "SUBMITTED"},
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/team-01",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["team_id"] == "team-01"
        assert len(data["members"]) == 2

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    @patch("app.services.advisor_service.check_assignment")
    def test_get_unassigned_team_details_forbidden(
        self, mock_check, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_team.return_value = MagicMock(id="team-04")
        # Team 04 belongs to Advisor B, not Advisor A!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/team-04",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Team is not assigned to this advisor" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    def test_get_nonexistent_team_details_not_found(
        self, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_team.return_value = None

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/nonexistent-team",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
