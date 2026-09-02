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


class TestMySubmissionAPI:

    def test_get_my_submission_missing_jwt(self):
        response = client.get("/api/submission/me")
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.repositories.file_repository.get_files_by_team_id")
    def test_get_my_submission_draft_state_success(
        self, mock_get_files, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(
            id="proj-101",
            team_id="team-101",
            title="My Smart App",
            domain="AI",
            problem_statement="Problem",
            description="Desc",
            proposed_solution="Sol",
            technologies_used="Python",
            github_url="https://github.com/org/repo",
            live_demo_url="https://demo.vercel.app",
            status="ongoing",
            created_at=None,
            updated_at=None,
        )
        mock_get_sub.return_value = None

        mock_get_checklist.return_value = {
            "all_completed": True,
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": True, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": True, "label": "Live Demo Link"},
            "completed_count": 6,
            "total_count": 6,
        }

        mock_get_files.return_value = []

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["submission"]["status"] == "DRAFT"
        assert data["project"]["title"] == "My Smart App"
        assert data["checklist"]["completed_count"] == 6
        assert isinstance(data["files"], list)

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.repositories.file_repository.get_files_by_team_id")
    def test_get_my_submission_submitted_state_success(
        self, mock_get_files, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(
            id="proj-101",
            team_id="team-101",
            title="My Smart App",
            domain="AI",
            problem_statement="Problem",
            description="Desc",
            proposed_solution="Sol",
            technologies_used="Python",
            github_url="https://github.com/org/repo",
            live_demo_url="https://demo.vercel.app",
            status="ongoing",
            created_at=None,
            updated_at=None,
        )
        mock_get_sub.return_value = {
            "id": "sub-101",
            "project_id": "proj-101",
            "team_id": "team-101",
            "status": "SUBMITTED",
            "submitted_at": "2026-09-02T20:30:00Z",
        }

        mock_get_checklist.return_value = {
            "all_completed": True,
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": True, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": True, "label": "Live Demo Link"},
            "completed_count": 6,
            "total_count": 6,
        }

        mock_get_files.return_value = []

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["submission"]["status"] == "SUBMITTED"
        assert data["submission"]["submitted_at"] == "2026-09-02T20:30:00Z"
