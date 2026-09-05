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


class TestAdvisorDocumentReviewAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_file_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.services.advisor_submission_service.upsert_document_review")
    def test_save_document_review_abstract_success(
        self, mock_upsert, mock_check, mock_get_file, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_file.return_value = FileMetadataResponse(
            id="file-01",
            project_id="proj-01",
            team_id="team-01",
            category="ABSTRACT",
            original_filename="abstract.pdf",
            storage_path="teams/team-01/abstract/test.pdf",
            mime_type="application/pdf",
            file_size=102400,
        )
        mock_check.return_value = True
        mock_upsert.return_value = {
            "id": "doc-rev-01",
            "file_id": "file-01",
            "advisor_id": "advisor-a",
            "status": "APPROVED",
            "remarks": "Abstract is concise and well formatted.",
            "created_at": "2026-09-02T22:00:00Z",
            "updated_at": "2026-09-02T22:00:00Z",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/files/file-01/review",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "APPROVED",
                "remarks": "Abstract is concise and well formatted.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "APPROVED"
        assert data["category"] == "ABSTRACT"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_file_by_id")
    def test_review_image_file_rejected(self, mock_get_file, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        # Image file is not an eligible document review category
        mock_get_file.return_value = FileMetadataResponse(
            id="file-img",
            project_id="proj-01",
            team_id="team-01",
            category="IMAGE",
            original_filename="screenshot.png",
            storage_path="teams/team-01/image/shot.png",
            mime_type="image/png",
            file_size=512000,
        )

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/files/file-img/review",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "APPROVED",
                "remarks": "Reviewing an image",
            },
        )

        assert response.status_code == 400
        assert "not eligible for document review" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_file_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    def test_save_unassigned_document_review_forbidden(
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
        # Team 03 belongs to Advisor B!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/files/file-03/review",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "APPROVED",
                "remarks": "Attempting unauthorized document review",
            },
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
