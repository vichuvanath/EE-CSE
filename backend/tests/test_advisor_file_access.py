import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings
from app.schemas.file import FileMetadataResponse

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorFileAccessAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_file_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.services.advisor_submission_service.generate_signed_file_url")
    def test_get_file_signed_url_success(
        self, mock_signed, mock_check, mock_get_file, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_file.return_value = FileMetadataResponse(
            id="file-01",
            project_id="proj-01",
            team_id="team-01",
            category="REPORT",
            original_filename="report.pdf",
            storage_path="teams/team-01/report/test.pdf",
            mime_type="application/pdf",
            file_size=204800,
        )
        mock_check.return_value = True
        mock_signed.return_value = {
            "file_id": "file-01",
            "original_filename": "report.pdf",
            "category": "REPORT",
            "mime_type": "application/pdf",
            "file_size": 204800,
            "download_url": "https://supabase.co/storage/v1/object/sign/project-files/teams/team-01/report/test.pdf?token=abc123",
            "expires_in_seconds": 3600,
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/files/file-01/download",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["file_id"] == "file-01"
        assert "download_url" in data
        assert "token=abc123" in data["download_url"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_file_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    def test_get_unassigned_file_signed_url_forbidden(
        self, mock_check, mock_get_file, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_file.return_value = FileMetadataResponse(
            id="file-03",
            project_id="proj-03",
            team_id="team-03",
            category="REPORT",
            original_filename="report_b.pdf",
            storage_path="teams/team-03/report/test_b.pdf",
            mime_type="application/pdf",
            file_size=204800,
        )
        # Team 03 is assigned to Advisor B, not Advisor A!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/files/file-03/download",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
