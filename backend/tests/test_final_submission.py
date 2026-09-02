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


class TestFinalSubmissionAPI:

    def test_final_submission_missing_jwt(self):
        response = client.post("/api/submission/final")
        assert response.status_code == 401

    def test_final_submission_invalid_jwt(self):
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_final_submission_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "faculty-1", "role": "faculty"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    def test_final_submission_incomplete_checklist(
        self, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = None

        mock_get_checklist.return_value = {
            "all_completed": False,
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": False, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": False, "label": "Live Demo Link"},
        }

        token = generate_student_jwt("student-1", "student")
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
        detail = response.json()["detail"]
        assert "cannot be submitted" in detail["message"]
        assert "PPT" in detail["missing_items"]
        assert "Live Demo Link" in detail["missing_items"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.services.submission_service.create_submission_record")
    def test_final_submission_success(
        self, mock_create_sub, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = None

        mock_get_checklist.return_value = {
            "all_completed": True,
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": True, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": True, "label": "Live Demo Link"},
        }

        mock_create_sub.return_value = {
            "id": "sub-uuid-999",
            "project_id": "proj-101",
            "team_id": "team-101",
            "status": "SUBMITTED",
            "submitted_at": "2026-09-02T20:30:00Z",
        }

        token = generate_student_jwt("student-1", "student")
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUBMITTED"
        assert data["submission_id"] == "sub-uuid-999"
        assert "submitted_at" in data

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    def test_final_submission_already_submitted(
        self, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = {"id": "sub-1", "status": "SUBMITTED", "submitted_at": "2026-09-01T12:00:00Z"}

        token = generate_student_jwt("student-1", "student")
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert "already been submitted" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.services.submission_service.create_submission_record")
    def test_client_payload_ownership_tampering_ignored(
        self, mock_create_sub, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = None

        mock_get_checklist.return_value = {"all_completed": True}
        mock_create_sub.return_value = {"id": "sub-1", "status": "SUBMITTED", "submitted_at": "2026-09-02T20:30:00Z"}

        token = generate_student_jwt("student-1", "student")
        # Attempting to supply another team_id or project_id in body
        response = client.post(
            "/api/submission/final",
            json={"team_id": "other-team", "project_id": "other-proj"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        # Verify repository was called with authenticated student's team & project!
        created_payload = mock_create_sub.call_args[0][0]
        assert created_payload["team_id"] == "team-101"
        assert created_payload["project_id"] == "proj-101"
