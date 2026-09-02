import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings

client = TestClient(app)


def generate_student_jwt(student_id: str = "student-1", role: str = "student") -> str:
    payload = {
        "sub": student_id,
        "roll_number": "23CS001",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestEditSubmissionAPI:

    def test_edit_submission_missing_jwt(self):
        response = client.put("/api/submission/me", json={"title": "New Title"})
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.upsert_project")
    def test_edit_submission_draft_state_success(
        self, mock_upsert, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = None  # No submission record (DRAFT state)

        mock_upsert.return_value = MagicMock(
            id="proj-101",
            team_id="team-101",
            title="Updated Title",
            domain="AI",
            problem_statement="Problem",
            description="Desc",
            proposed_solution="Sol",
            technologies_used="FastAPI",
            github_url="https://github.com/user/repo",
            live_demo_url="https://demo.vercel.app",
            status="ongoing",
            created_at=None,
            updated_at=None,
        )

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/submission/me",
            json={
                "title": "Updated Title",
                "github_url": "https://github.com/user/repo",
                "live_demo_url": "https://demo.vercel.app",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    def test_edit_submission_submitted_state_blocked(
        self, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = {"id": "sub-101", "status": "SUBMITTED"}

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/submission/me",
            json={"title": "Attempted Edit"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert "Submitted projects cannot be edited" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    def test_edit_submission_invalid_github_url_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/submission/me",
            json={"github_url": "https://google.com/user/repo"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    @patch("app.dependencies.auth.get_supabase_client")
    def test_edit_submission_invalid_live_demo_url_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/submission/me",
            json={"live_demo_url": "javascript:alert(1)"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422
