from datetime import datetime, timezone, timedelta
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


class TestAdvisorDeadlinesAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.get_team_by_id")
    @patch("app.services.advisor_extra_service.check_assignment")
    @patch("app.services.advisor_extra_service.upsert_team_deadline")
    def test_save_team_deadline_success(
        self, mock_upsert_dl, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01", name="Team Alpha")
        mock_check.return_value = True
        future_dl = datetime.now(timezone.utc) + timedelta(days=7)

        mock_upsert_dl.return_value = {
            "id": "dl-01",
            "team_id": "team-01",
            "advisor_id": "advisor-a",
            "title": "Final Project Submission Deadline",
            "description": "Please submit code and report before midnight.",
            "deadline_at": future_dl.isoformat(),
            "status": "UPCOMING",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/deadline",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Final Project Submission Deadline",
                "description": "Please submit code and report before midnight.",
                "deadline_at": future_dl.isoformat(),
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Final Project Submission Deadline"
        assert data["status"] == "UPCOMING"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.get_team_by_id")
    @patch("app.services.advisor_extra_service.check_assignment")
    def test_unassigned_team_deadline_forbidden(
        self, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-03")
        # Team 03 is assigned to Advisor B!
        mock_check.return_value = False

        future_dl = datetime.now(timezone.utc) + timedelta(days=7)
        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-03/deadline",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Unauthorized Deadline",
                "deadline_at": future_dl.isoformat(),
            },
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
