import pytest
from io import BytesIO
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


class TestFileUploadsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_project_by_team_id")
    @patch("app.services.file_service.get_file_by_category_and_team")
    @patch("app.services.file_service.upload_file_to_storage")
    @patch("app.services.file_service.create_file_record")
    def test_upload_abstract_success(
        self, mock_create_rec, mock_upload_storage, mock_get_cat_file, mock_get_proj, mock_get_team, mock_auth_supabase
    ):

        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101", name="Team 101")
        mock_get_proj.return_value = MagicMock(id="proj-101", team_id="team-101")
        mock_get_cat_file.return_value = None


        mock_upload_storage.return_value = "teams/team-101/abstract/test_abstract.pdf"
        mock_create_rec.return_value = MagicMock(
            id="file-101",
            project_id="proj-101",
            team_id="team-101",
            category="ABSTRACT",
            original_filename="abstract.pdf",
            storage_path="teams/team-101/abstract/test_abstract.pdf",
            mime_type="application/pdf",
            file_size=1024,
            created_at=None,
            updated_at=None,
            model_dump=lambda: {
                "id": "file-101",
                "project_id": "proj-101",
                "team_id": "team-101",
                "category": "ABSTRACT",
                "original_filename": "abstract.pdf",
                "storage_path": "teams/team-101/abstract/test_abstract.pdf",
                "mime_type": "application/pdf",
                "file_size": 1024,
                "created_at": None,
                "updated_at": None,
            },
        )

        token = generate_student_jwt("student-1", "student")
        file_data = BytesIO(b"Dummy PDF Content")
        response = client.post(
            "/api/files/upload/ABSTRACT",
            files={"file": ("abstract.pdf", file_data, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["file"]["category"] == "ABSTRACT"
        assert data["file"]["original_filename"] == "abstract.pdf"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_project_by_team_id")
    def test_upload_invalid_extension(self, mock_get_proj, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")

        token = generate_student_jwt("student-1", "student")
        file_data = BytesIO(b"print('hello')")
        response = client.post(
            "/api/files/upload/ABSTRACT",
            files={"file": ("script.py", file_data, "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 415
        assert "Unsupported file extension" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_project_by_team_id")
    def test_upload_invalid_mime_type(self, mock_get_proj, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")

        token = generate_student_jwt("student-1", "student")
        file_data = BytesIO(b"Dummy Content")
        response = client.post(
            "/api/files/upload/REPORT",
            files={"file": ("report.pdf", file_data, "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 415
        assert "Unsupported MIME type" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_project_by_team_id")
    def test_upload_oversized_file(self, mock_get_proj, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")

        token = generate_student_jwt("student-1", "student")
        # Generate 11 MB dummy payload for ABSTRACT (10 MB max limit)
        oversized_data = BytesIO(b"X" * (11 * 1024 * 1024))
        response = client.post(
            "/api/files/upload/ABSTRACT",
            files={"file": ("large_abstract.pdf", oversized_data, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 413
        assert "exceeds maximum limit" in response.json()["detail"]


    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    def test_upload_invalid_category(self, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        token = generate_student_jwt("student-1", "student")
        file_data = BytesIO(b"Dummy")
        response = client.post(
            "/api/files/upload/INVALID_CAT",
            files={"file": ("file.pdf", file_data, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 422
        assert "Invalid file category" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_files_by_team_id")
    def test_get_my_files_success(self, mock_get_files, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_file = MagicMock(
            id="f-1",
            project_id="p-1",
            team_id="team-101",
            category="ABSTRACT",
            original_filename="doc.pdf",
            storage_path="path/doc.pdf",
            mime_type="application/pdf",
            file_size=500,
            created_at=None,
            updated_at=None,
            model_dump=lambda: {
                "id": "f-1",
                "project_id": "p-1",
                "team_id": "team-101",
                "category": "ABSTRACT",
                "original_filename": "doc.pdf",
                "storage_path": "path/doc.pdf",
                "mime_type": "application/pdf",
                "file_size": 500,
                "created_at": None,
                "updated_at": None,
            },
        )
        mock_get_files.return_value = [mock_file]

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/files/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["files"][0]["original_filename"] == "doc.pdf"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_file_by_id")
    @patch("app.services.file_service.delete_file_from_storage")
    @patch("app.services.file_service.delete_file_record")
    def test_delete_file_success(
        self, mock_del_rec, mock_del_storage, mock_get_file, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_file.return_value = MagicMock(id="f-101", team_id="team-101", storage_path="path/to/f-101")

        token = generate_student_jwt("student-1", "student")
        response = client.delete(
            "/api/files/f-101",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["file_id"] == "f-101"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_file_by_id")
    def test_delete_file_other_team_isolation(self, mock_get_file, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        # File belongs to team-202 (not student's team!)
        mock_get_file.return_value = MagicMock(id="f-202", team_id="team-202")

        token = generate_student_jwt("student-1", "student")
        response = client.delete(
            "/api/files/f-202",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "not belong to your team" in response.json()["detail"]

    def test_file_upload_missing_jwt(self):
        response = client.post("/api/files/upload/ABSTRACT")
        assert response.status_code == 401

    def test_file_upload_invalid_jwt(self):
        response = client.post(
            "/api/files/upload/ABSTRACT",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_file_upload_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "faculty-1", "role": "faculty"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.post(
            "/api/files/upload/ABSTRACT",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
