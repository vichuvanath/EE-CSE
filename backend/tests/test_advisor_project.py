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


class TestAdvisorProjectAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    @patch("app.services.advisor_service.check_assignment")
    @patch("app.services.advisor_service.get_advisor_project_info")
    def test_get_assigned_team_project_success(
        self, mock_info, mock_check, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_info.return_value = {
            "id": "proj-01",
            "team_id": "team-01",
            "title": "Smart City Cloud Dashboard",
            "domain": "IoT Cloud",
            "problem_statement": "Traffic management",
            "description": "Smart IoT system",
            "proposed_solution": "Edge sensors + Cloud analytics",
            "technologies_used": "FastAPI, React, Supabase",
            "github_url": "https://github.com/myteam/smartcity",
            "live_demo_url": "https://smartcity.vercel.app",
            "status": "ongoing",
            "created_at": "2026-09-02T22:00:00Z",
            "updated_at": "2026-09-02T22:00:00Z",
            "files": [
                {
                    "id": "file-1",
                    "category": "ABSTRACT",
                    "original_filename": "abstract.pdf",
                    "storage_path": "teams/team-01/abstract/test.pdf",
                    "mime_type": "application/pdf",
                    "file_size": 10240,
                }
            ],
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/team-01/project",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "proj-01"
        assert data["title"] == "Smart City Cloud Dashboard"
        assert len(data["files"]) == 1

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    @patch("app.services.advisor_service.check_assignment")
    def test_get_unassigned_team_project_forbidden(
        self, mock_check, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_team.return_value = MagicMock(id="team-04")
        # Team 04 is assigned to Advisor B, not Advisor A!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/team-04/project",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Team is not assigned to this advisor" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_team_by_id")
    @patch("app.services.advisor_service.check_assignment")
    @patch("app.services.advisor_service.get_advisor_project_info")
    def test_get_team_without_project_not_found(
        self, mock_info, mock_check, mock_get_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile


        mock_get_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_info.return_value = None

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/teams/team-01/project",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "has not been created yet" in response.json()["detail"]
