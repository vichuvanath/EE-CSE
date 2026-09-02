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


class TestAdvisorNotificationsAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.get_notifications_for_recipient")
    def test_get_notifications_success(self, mock_notifs, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_notifs.return_value = {
            "total_count": 1,
            "unread_count": 1,
            "page": 1,
            "page_size": 20,
            "notifications": [
                {
                    "id": "notif-01",
                    "recipient_id": "advisor-a",
                    "team_id": "team-01",
                    "type": "NEW_SUBMISSION",
                    "title": "New Submission Received",
                    "message": "Team Alpha submitted their project.",
                    "is_read": False,
                    "created_at": "2026-09-02T22:00:00Z",
                }
            ],
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/notifications",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 1
        assert data["unread_count"] == 1
        assert len(data["notifications"]) == 1

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.mark_notification_as_read")
    def test_mark_notification_as_read_success(self, mock_mark, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_mark.return_value = {
            "id": "notif-01",
            "recipient_id": "advisor-a",
            "team_id": "team-01",
            "type": "NEW_SUBMISSION",
            "title": "New Submission Received",
            "message": "Team Alpha submitted their project.",
            "is_read": True,
            "created_at": "2026-09-02T22:00:00Z",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.patch(
            "/api/advisor/notifications/notif-01/read",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_read"] is True

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_extra_service.mark_all_notifications_as_read")
    def test_mark_all_notifications_read_success(self, mock_mark_all, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_mark_all.return_value = 3

        token = generate_jwt("advisor-a", "advisor")
        response = client.patch(
            "/api/advisor/notifications/read-all",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["updated_count"] == 3
