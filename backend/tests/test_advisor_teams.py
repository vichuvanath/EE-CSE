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


class TestAdvisorTeamsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_advisor_teams_summary")
    def test_get_my_teams_success(self, mock_summary, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-1", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_summary.return_value = [
            {
                "team_id": "team-01",
                "name": "Team Alpha",
                "project_title": "AI Health",
                "team_leader": {"id": "std-1", "full_name": "Alice", "is_team_leader": True},
                "member_count": 4,
                "batch": "2023-2027",
                "section": "A",
                "submission_status": "SUBMITTED",
            }
        ]

        token = generate_jwt("advisor-1", "advisor")
        response = client.get(
            "/api/advisor/teams",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["team_id"] == "team-01"
        assert data[0]["submission_status"] == "SUBMITTED"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_advisor_teams_summary")
    def test_get_my_teams_empty_list(self, mock_summary, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-2", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_summary.return_value = []

        token = generate_jwt("advisor-2", "advisor")
        response = client.get(
            "/api/advisor/teams",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json() == []

    @patch("app.dependencies.auth.get_supabase_client")
    def test_student_cannot_access_advisor_teams(self, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        token = generate_jwt("student-1", "student")
        response = client.get(
            "/api/advisor/teams",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Advisor access required" in response.json()["detail"]

    def test_unauthenticated_request_rejected(self):
        response = client.get("/api/advisor/teams")
        assert response.status_code in [401, 403]

