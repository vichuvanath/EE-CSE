import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import Settings, settings
from app.services.file_service import upload_student_file
from app.services.submission_service import submit_final_project
from app.core.exceptions import DatabaseError

client = TestClient(app)


def generate_student_jwt(student_id: str = "student-1", role: str = "student", aud: str = "authenticated") -> str:
    payload = {
        "sub": student_id,
        "roll_number": "23CS001",
        "role": role,
        "team_id": "team-101",
        "aud": aud,
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestProductionReadinessAndFixes:

    def test_production_jwt_secret_validation_raises_error(self):
        with pytest.raises(ValueError) as exc_info:
            Settings(ENVIRONMENT="production", SUPABASE_JWT_SECRET="")
        assert "SUPABASE_JWT_SECRET must be explicitly configured" in str(exc_info.value)

    def test_jwt_invalid_audience_rejected(self):
        token = generate_student_jwt("student-1", "student", aud="wrong_audience")
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]

    @pytest.mark.asyncio
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_project_by_team_id")
    @patch("app.services.file_service.get_file_by_category_and_team")
    @patch("app.services.file_service.upload_file_to_storage")
    @patch("app.services.file_service.create_file_record")
    @patch("app.services.file_service.delete_file_from_storage")
    async def test_storage_upload_db_failure_triggers_rollback(
        self, mock_delete_storage, mock_create_db, mock_upload_storage, mock_get_cat, mock_get_proj, mock_get_team
    ):
        mock_get_team.return_value = MagicMock(id="team-101", name="Team A")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_cat.return_value = None
        mock_upload_storage.return_value = "teams/team-101/abstract/test.pdf"
        mock_create_db.side_effect = DatabaseError(message="Database write timeout")

        mock_file = MagicMock()
        mock_file.filename = "abstract.pdf"
        mock_file.content_type = "application/pdf"
        
        async def mock_read():
            return b"%PDF-dummy-content"
        mock_file.read = mock_read

        with pytest.raises(DatabaseError):
            await upload_student_file("student-1", "ABSTRACT", mock_file)

        mock_delete_storage.assert_called_once()

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.services.submission_service.create_submission_record")
    def test_submission_db_unique_constraint_concurrency_returns_409(
        self, mock_create_sub, mock_get_checklist, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")
        mock_get_proj.return_value = MagicMock(id="proj-101")
        mock_get_sub.return_value = None
        mock_get_checklist.return_value = {"all_completed": True}

        # Simulate PostgreSQL unique constraint violation error
        mock_create_sub.side_effect = DatabaseError(message="Database error", detail="duplicate key value violates unique constraint 'submissions_project_id_key'")

        token = generate_student_jwt("student-1", "student")
        response = client.post(
            "/api/submission/final",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert "already been submitted" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_file_by_id")
    def test_cross_team_file_deletion_blocked(
        self, mock_get_file, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-a", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-a")

        # File belongs to team-b!
        mock_get_file.return_value = MagicMock(id="file-999", team_id="team-b")

        token = generate_student_jwt("student-a", "student")
        response = client.delete(
            "/api/files/file-999",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "does not belong to your team" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.services.project_service.get_project_by_team_id")
    @patch("app.repositories.submission_repository.get_submission_by_project_id")
    def test_update_project_blocked_after_final_submission(
        self, mock_get_sub, mock_get_proj, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-a", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-a")
        mock_get_proj.return_value = MagicMock(id="proj-a")
        mock_get_sub.return_value = {"id": "sub-a", "status": "SUBMITTED"}

        token = generate_student_jwt("student-a", "student")
        response = client.put(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"title": "Updated Title Attempt"},
        )

        assert response.status_code == 409
        assert "Submitted projects cannot be edited" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.file_service.get_student_team")
    @patch("app.services.file_service.get_file_by_id")
    @patch("app.services.file_service.get_project_by_team_id")
    @patch("app.repositories.submission_repository.get_submission_by_project_id")
    def test_delete_file_blocked_after_final_submission(
        self, mock_get_sub, mock_get_proj, mock_get_file, mock_get_team, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-a", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-a")
        mock_get_file.return_value = MagicMock(id="file-a", team_id="team-a")
        mock_get_proj.return_value = MagicMock(id="proj-a")
        mock_get_sub.return_value = {"id": "sub-a", "status": "SUBMITTED"}

        token = generate_student_jwt("student-a", "student")
        response = client.delete(
            "/api/files/file-a",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert "Submitted projects cannot be edited" in response.json()["detail"]


