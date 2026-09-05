import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings
from app.schemas.user import UserResponse

client = TestClient(app)


class TestAdvisorAuthAPI:

    @patch("app.repositories.user_repository.get_user_by_email")
    def test_advisor_login_success_by_email(self, mock_get_user):
        mock_get_user.return_value = UserResponse(
            id="advisor-uuid-101",
            email="prof.smith@college.edu",
            full_name="Prof. John Smith",
            role="advisor",
        )

        response = client.post(
            "/api/auth/advisor-login",
            json={
                "advisor_id": "prof.smith@college.edu",
                "password": "SecretPassword123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["id"] == "advisor-uuid-101"
        assert data["user"]["email"] == "prof.smith@college.edu"
        assert data["user"]["role"] == "advisor"

        # Verify JWT payload
        payload = jwt.decode(
            data["access_token"],
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        assert payload["sub"] == "advisor-uuid-101"
        assert payload["role"] == "advisor"
        assert "password" not in data
        assert "password_hash" not in data

    @patch("app.repositories.user_repository.get_user_by_id")
    @patch("app.repositories.user_repository.get_user_by_roll_number")
    def test_advisor_login_success_by_id(self, mock_get_roll, mock_get_id):
        mock_get_id.return_value = UserResponse(
            id="adv-102",
            email="dr.jones@college.edu",
            full_name="Dr. Jones",
            role="faculty",
        )

        response = client.post(
            "/api/auth/advisor/login",
            json={
                "advisor_id": "adv-102",
                "password": "ValidPassword",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["user"]["id"] == "adv-102"
        assert data["user"]["role"] == "faculty"

    @patch("app.repositories.user_repository.get_user_by_email")
    def test_advisor_login_invalid_email_not_found(self, mock_get_user):
        mock_get_user.return_value = None

        response = client.post(
            "/api/auth/advisor-login",
            json={
                "advisor_id": "nonexistent@college.edu",
                "password": "AnyPassword",
            },
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    @patch("app.repositories.user_repository.get_user_by_email")
    def test_advisor_login_invalid_password(self, mock_get_user):
        mock_get_user.return_value = UserResponse(
            id="advisor-uuid-101",
            email="prof.smith@college.edu",
            full_name="Prof. John Smith",
            role="advisor",
        )

        response = client.post(
            "/api/auth/advisor-login",
            json={
                "advisor_id": "prof.smith@college.edu",
                "password": "wrong_password",
            },
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    @patch("app.repositories.user_repository.get_user_by_email")
    def test_student_attempting_advisor_login_rejected(self, mock_get_user):
        # User exists but is a student!
        mock_get_user.return_value = UserResponse(
            id="student-uuid-999",
            email="student@college.edu",
            full_name="Alice Student",
            role="student",
        )

        response = client.post(
            "/api/auth/advisor-login",
            json={
                "advisor_id": "student@college.edu",
                "password": "StudentPassword",
            },
        )

        assert response.status_code == 403
        assert "Only advisor accounts can log in here" in response.json()["detail"]

    def test_advisor_login_missing_fields_validation(self):
        response = client.post(
            "/api/auth/advisor-login",
            json={"advisor_id": ""},
        )
        assert response.status_code == 422
