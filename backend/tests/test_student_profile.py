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


class TestStudentProfileAPI:

    def test_get_profile_missing_jwt(self):
        response = client.get("/api/student/profile")
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.profile_repository.get_supabase_client")
    def test_get_profile_success(self, mock_prof_supabase, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_prof_rec = MagicMock()
        mock_prof_rec.data = [{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Johnson",
            "email": "alice@example.com",
            "role": "student",
        }]
        mock_prof_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_prof_rec

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/student/profile",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "student-1"
        assert data["roll_number"] == "23CS001"
        assert data["full_name"] == "Alice Johnson"
        assert data["role"] == "student"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.profile_repository.get_supabase_client")
    @patch("app.repositories.profile_repository.get_supabase_admin_client")
    def test_update_profile_full_name_success(self, mock_admin_supabase, mock_prof_supabase, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_prof_rec = MagicMock()
        mock_prof_rec.data = [{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Johnson",
            "email": "alice@example.com",
            "role": "student",
        }]
        mock_prof_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_prof_rec

        mock_update_rec = MagicMock()
        mock_update_rec.data = [{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "role": "student",
        }]
        mock_admin_supabase.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_rec

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/student/profile",
            json={"full_name": "Alice Smith"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["full_name"] == "Alice Smith"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.profile_repository.get_supabase_client")
    @patch("app.repositories.profile_repository.get_supabase_admin_client")
    def test_update_profile_cannot_escalate_role(self, mock_admin_supabase, mock_prof_supabase, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_prof_rec = MagicMock()
        mock_prof_rec.data = [{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Johnson",
            "email": "alice@example.com",
            "role": "student",
        }]
        mock_prof_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_prof_rec

        mock_update_rec = MagicMock()
        mock_update_rec.data = [{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Johnson Updated",
            "email": "alice@example.com",
            "role": "student",
        }]
        mock_admin_supabase.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_rec

        token = generate_student_jwt("student-1", "student")
        # Attempt payload tampering with role and id
        response = client.put(
            "/api/student/profile",
            json={"full_name": "Alice Johnson Updated", "role": "admin", "id": "admin-1"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        # Role must remain student!
        assert response.json()["role"] == "student"

    @patch("app.dependencies.auth.get_supabase_client")
    def test_logout_endpoint_functional(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

