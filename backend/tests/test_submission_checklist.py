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


class TestSubmissionChecklistAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_no_items_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {"project": None, "categories": []}

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["completed_count"] == 0
        assert data["total_count"] == 6
        assert data["all_completed"] is False
        assert data["abstract"]["completed"] is False
        assert data["report"]["completed"] is False
        assert data["ppt"]["completed"] is False
        assert data["images"]["completed"] is False
        assert data["github"]["completed"] is False
        assert data["live_demo"]["completed"] is False

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_abstract_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {"project": None, "categories": ["ABSTRACT"]}

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["completed_count"] == 1
        assert data["abstract"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_report_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {"project": None, "categories": ["REPORT"]}

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["report"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_ppt_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {"project": None, "categories": ["PPT"]}

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["ppt"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_images_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {"project": None, "categories": ["IMAGE"]}

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["images"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_github_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {
            "project": {"github_url": "https://github.com/myuser/repo", "live_demo_url": None},
            "categories": [],
        }

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["github"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_live_demo_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {
            "project": {"github_url": None, "live_demo_url": "https://demo.vercel.app"},
            "categories": [],
        }

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["live_demo"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_all_completed(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {
            "project": {
                "github_url": "https://github.com/myuser/repo",
                "live_demo_url": "https://demo.vercel.app",
            },
            "categories": ["ABSTRACT", "REPORT", "PPT", "IMAGE"],
        }

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["completed_count"] == 6
        assert data["total_count"] == 6
        assert data["all_completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_github_cleared(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {
            "project": {"github_url": "   ", "live_demo_url": "https://demo.app"},
            "categories": [],
        }

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["github"]["completed"] is False
        assert data["live_demo"]["completed"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_live_demo_cleared(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_raw.return_value = {
            "project": {"github_url": "https://github.com/user/repo", "live_demo_url": None},
            "categories": [],
        }

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["live_demo"]["completed"] is False

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_checklist_raw_data")
    def test_checklist_cross_team_isolation(self, mock_get_raw, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-a", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-a")
        mock_get_raw.return_value = {"project": None, "categories": ["ABSTRACT"]}

        token = generate_student_jwt("student-a", "student")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        mock_get_raw.assert_called_once_with("team-a")

    def test_checklist_missing_jwt(self):
        response = client.get("/api/submission/checklist")
        assert response.status_code == 401

    def test_checklist_invalid_jwt(self):
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_checklist_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "faculty-1", "role": "faculty"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.get(
            "/api/submission/checklist",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
