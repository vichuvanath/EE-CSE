import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorProfileAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.get_advisor_profile")
    def test_get_advisor_profile_success(self, mock_get_prof, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_prof.return_value = {
            "id": "advisor-a",
            "full_name": "Dr. Alan Turing",
            "email": "advisor-a@college.edu",
            "role": "advisor",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/profile",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "advisor-a"
        assert data["full_name"] == "Dr. Alan Turing"
        assert data["role"] == "advisor"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.update_advisor_profile")
    def test_update_advisor_profile_success(self, mock_update_prof, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_update_prof.return_value = {
            "id": "advisor-a",
            "full_name": "Dr. Alan M. Turing",
            "email": "advisor-a@college.edu",
            "role": "advisor",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.put(
            "/api/advisor/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={"full_name": "Dr. Alan M. Turing"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Dr. Alan M. Turing"
