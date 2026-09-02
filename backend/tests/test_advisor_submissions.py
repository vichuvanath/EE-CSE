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


class TestAdvisorSubmissionsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_advisor_submissions_summary")
    def test_get_my_submissions_success(self, mock_summary, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_summary.return_value = [
            {
                "id": "sub-01",
                "project_id": "proj-01",
                "team_id": "team-01",
                "project_title": "AI Smart Assistant",
                "team_name": "Team Alpha",
                "status": "SUBMITTED",
                "submitted_at": "2026-09-02T22:00:00Z",
            }
        ]

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/submissions",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "sub-01"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.services.advisor_submission_service.get_project_by_team_id")
    @patch("app.services.advisor_submission_service.get_team_by_id")
    def test_get_submission_by_id_success(
        self, mock_get_team, mock_get_proj, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {
            "id": "sub-01",
            "project_id": "proj-01",
            "team_id": "team-01",
            "status": "SUBMITTED",
        }
        mock_check.return_value = True
        mock_get_proj.return_value = None
        mock_get_team.return_value = None

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/submissions/sub-01",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["id"] == "sub-01"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    def test_get_unassigned_submission_forbidden(
        self, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {
            "id": "sub-03",
            "project_id": "proj-03",
            "team_id": "team-03",
            "status": "SUBMITTED",
        }
        # Team 03 belongs to Advisor B!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/submissions/sub-03",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
