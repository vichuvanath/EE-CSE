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


class TestAdvisorTeamEvaluationAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_team_evaluation")
    @patch("app.services.advisor_evaluation_service.upsert_team_evaluation")
    def test_save_team_evaluation_success(
        self, mock_upsert, mock_get_eval, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_get_eval.return_value = {"id": "eval-01", "status": "NOT_STARTED"}
        mock_upsert.return_value = {
            "id": "eval-01",
            "team_id": "team-01",
            "advisor_id": "advisor-a",
            "status": "IN_PROGRESS",
            "team_score": 92.5,
            "team_remarks": "Outstanding teamwork and documentation.",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "team_score": 92.5,
                "team_remarks": "Outstanding teamwork and documentation.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["team_score"] == 92.5
        assert data["team_remarks"] == "Outstanding teamwork and documentation."
        assert data["status"] == "IN_PROGRESS"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    def test_unassigned_team_evaluation_forbidden(
        self, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-03")
        # Team 03 belongs to Advisor B!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-03/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "team_score": 85.0,
                "team_remarks": "Attempting unauthorized evaluation",
            },
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
