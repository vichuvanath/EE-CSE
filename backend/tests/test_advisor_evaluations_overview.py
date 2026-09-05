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


class TestAdvisorEvaluationsOverviewAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_overview_service.get_advisor_evaluations_overview")
    def test_get_evaluations_overview_success(self, mock_overview, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_overview.return_value = {
            "total_teams": 3,
            "not_started_count": 1,
            "in_progress_count": 1,
            "evaluated_count": 0,
            "submitted_count": 1,
            "locked_count": 0,
            "teams": [
                {
                    "team_id": "team-01",
                    "team_name": "Team Alpha",
                    "batch": "2023-2027",
                    "section": "A",
                    "project_title": "AI Assistant",
                    "evaluation_id": "eval-01",
                    "evaluation_status": "IN_PROGRESS",
                    "team_score": 90.0,
                    "student_evaluations_count": 4,
                    "total_team_members": 4,
                    "is_locked": False,
                },
                {
                    "team_id": "team-02",
                    "team_name": "Team Beta",
                    "batch": "2023-2027",
                    "section": "B",
                    "project_title": "Blockchain Portal",
                    "evaluation_id": "eval-02",
                    "evaluation_status": "SUBMITTED",
                    "team_score": 95.0,
                    "student_evaluations_count": 3,
                    "total_team_members": 3,
                    "is_locked": False,
                },
            ],
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/evaluations/overview",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_teams"] == 3
        assert data["in_progress_count"] == 1
        assert data["submitted_count"] == 1
        assert len(data["teams"]) == 2
