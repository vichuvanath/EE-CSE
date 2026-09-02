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


class TestAdvisorDashboardAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_overview_service.get_advisor_dashboard_stats")
    def test_get_dashboard_stats_success(self, mock_stats, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_stats.return_value = {
            "total_assigned_teams": 3,
            "total_students": 12,
            "total_projects": 3,
            "total_submissions": 2,
            "pending_submission_reviews": 1,
            "pending_document_reviews": 2,
            "teams_evaluated": 1,
            "teams_not_evaluated": 1,
            "teams_in_progress": 1,
            "teams_submitted": 1,
            "teams_locked": 0,
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_assigned_teams"] == 3
        assert data["total_students"] == 12
        assert data["total_projects"] == 3
        assert data["pending_submission_reviews"] == 1

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_overview_service.get_advisor_dashboard_stats")
    def test_get_dashboard_stats_zero_teams(self, mock_stats, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-empty", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_stats.return_value = {
            "total_assigned_teams": 0,
            "total_students": 0,
            "total_projects": 0,
            "total_submissions": 0,
            "pending_submission_reviews": 0,
            "pending_document_reviews": 0,
            "teams_evaluated": 0,
            "teams_not_evaluated": 0,
            "teams_in_progress": 0,
            "teams_submitted": 0,
            "teams_locked": 0,
        }

        token = generate_jwt("advisor-empty", "advisor")
        response = client.get(
            "/api/advisor/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_assigned_teams"] == 0
        assert data["total_students"] == 0
