import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings
from app.schemas.user import UserResponse

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorStudentsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_advisor_students_list")
    def test_get_advisor_students_success(self, mock_list, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_list.return_value = [
            {
                "id": "std-1",
                "full_name": "Alice Student",
                "roll_number": "23CS001",
                "email": "alice@college.edu",
                "role": "student",
                "batch": "2023-2027",
                "section": "A",
                "team_id": "team-01",
                "team_name": "Team Alpha",
                "is_team_leader": True,
            }
        ]

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/students",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "std-1"
        assert data[0]["team_id"] == "team-01"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_user_by_id")
    @patch("app.services.advisor_service.get_advisor_student_detail")
    def test_get_assigned_student_detail_success(
        self, mock_detail, mock_get_user, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_user.return_value = UserResponse(id="std-1", email="alice@college.edu", full_name="Alice Student", role="student")
        mock_detail.return_value = {
            "id": "std-1",
            "full_name": "Alice Student",
            "roll_number": "23CS001",
            "email": "alice@college.edu",
            "role": "student",
            "batch": "2023-2027",
            "section": "A",
            "team_id": "team-01",
            "team_name": "Team Alpha",
            "is_team_leader": True,
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/students/std-1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "std-1"
        assert "password" not in data

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_user_by_id")
    @patch("app.services.advisor_service.get_advisor_student_detail")
    def test_get_unassigned_student_detail_forbidden(
        self, mock_detail, mock_get_user, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_user.return_value = UserResponse(id="std-99", email="std99@college.edu", full_name="Student 99", role="student")
        mock_detail.return_value = None

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/students/std-99",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_service.get_user_by_id")
    def test_get_nonexistent_student_not_found(
        self, mock_get_user, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_user.return_value = None

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/students/nonexistent-student",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


