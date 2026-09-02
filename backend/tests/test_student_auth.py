import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.user import UserResponse
from app.schemas.team import TeamResponse
from jose import jwt
from app.core.config import settings

client = TestClient(app)


class TestStudentLoginAPI:

    @patch("app.services.auth_service.get_user_by_roll_number")
    @patch("app.services.auth_service.get_student_team")
    def test_student_login_success(self, mock_get_team, mock_get_user):
        mock_user = UserResponse(
            id="student-uuid-123",
            email="student@example.com",
            full_name="John Doe",
            role="student",
            roll_number="23CS001",
        )
        mock_get_user.return_value = mock_user

        mock_team = TeamResponse(
            id="team-1",
            name="Team Alpha",
            project_title="AI Portal",
            faculty_id="faculty-1",
        )
        mock_get_team.return_value = mock_team

        response = client.post(
            "/api/auth/student-login",
            json={"roll_number": "23CS001", "team_id": "team-1"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["roll_number"] == "23CS001"
        assert data["user"]["team_id"] == "team-1"
        assert data["user"]["role"] == "student"

    @patch("app.services.auth_service.get_user_by_roll_number")
    def test_student_login_invalid_roll(self, mock_get_user):
        mock_get_user.return_value = None

        response = client.post(
            "/api/auth/student-login",
            json={"roll_number": "NONEXISTENT", "team_id": "team-1"},
        )

        assert response.status_code == 401
        assert "Invalid roll number" in response.json()["detail"]

    @patch("app.services.auth_service.get_user_by_roll_number")
    @patch("app.services.auth_service.get_student_team")
    def test_student_login_wrong_team(self, mock_get_team, mock_get_user):
        mock_user = UserResponse(
            id="student-uuid-123",
            email="student@example.com",
            full_name="John Doe",
            role="student",
            roll_number="23CS001",
        )
        mock_get_user.return_value = mock_user

        mock_team = TeamResponse(
            id="team-999",
            name="Team Other",
            project_title="Other Project",
            faculty_id="faculty-1",
        )
        mock_get_team.return_value = mock_team

        response = client.post(
            "/api/auth/student-login",
            json={"roll_number": "23CS001", "team_id": "team-1"},
        )

        assert response.status_code == 401
        assert "not assigned" in response.json()["detail"]

    @patch("app.services.auth_service.get_user_by_roll_number")
    def test_student_login_non_student_role(self, mock_get_user):
        mock_user = UserResponse(
            id="faculty-uuid-123",
            email="faculty@example.com",
            full_name="Dr. Smith",
            role="faculty",
            roll_number="FAC001",
        )
        mock_get_user.return_value = mock_user

        response = client.post(
            "/api/auth/student-login",
            json={"roll_number": "FAC001", "team_id": "team-1"},
        )

        assert response.status_code == 403
        assert "Only student accounts" in response.json()["detail"]

    def test_student_login_missing_fields(self):
        response = client.post(
            "/api/auth/student-login",
            json={"roll_number": "", "team_id": "team-1"},
        )
        assert response.status_code in [400, 422]


class TestAuthenticatedEndpoints:

    @patch("app.dependencies.auth.get_supabase_client")
    def test_get_current_user_me(self, mock_supabase):
        mock_res = MagicMock()
        mock_res.data = [{
            "id": "student-uuid-123",
            "email": "student@example.com",
            "full_name": "John Doe",
            "role": "student",
            "roll_number": "23CS001",
        }]
        mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_res

        # Mock team membership
        mock_membership = MagicMock()
        mock_membership.data = [{"team_id": "team-1"}]
        mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_res,
            mock_membership,
        ]

        payload = {
            "sub": "student-uuid-123",
            "roll_number": "23CS001",
            "role": "student",
            "team_id": "team-1",
        }
        token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "student-uuid-123"
        assert data["roll_number"] == "23CS001"
        assert data["role"] == "student"
        assert data["team_id"] == "team-1"

    def test_get_current_user_me_invalid_token(self):
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_123"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_logout(self, mock_supabase):
        mock_res = MagicMock()
        mock_res.data = [{
            "id": "student-uuid-123",
            "email": "student@example.com",
            "full_name": "John Doe",
            "role": "student",
            "roll_number": "23CS001",
        }]
        mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_res

        payload = {
            "sub": "student-uuid-123",
            "role": "student",
        }
        token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

        response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]
