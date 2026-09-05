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


class TestAdvisorSubmissionReviewAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.repositories.submission_repository.get_checklist_raw_data")
    def test_get_submission_completeness_success(
        self, mock_raw_data, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {"id": "sub-01", "team_id": "team-01", "status": "SUBMITTED"}
        mock_check.return_value = True
        mock_raw_data.return_value = {
            "categories": ["ABSTRACT", "REPORT", "PPT", "IMAGE"],
            "project": {
                "github_url": "https://github.com/myteam/project",
                "live_demo_url": "https://project.vercel.app",
            },
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/submissions/sub-01/completeness",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["all_completed"] is True
        assert data["completion_status"] == "COMPLETE"


    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.services.advisor_submission_service.upsert_submission_review")
    def test_save_submission_review_success(
        self, mock_upsert, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {"id": "sub-01", "team_id": "team-01", "status": "SUBMITTED"}
        mock_check.return_value = True
        mock_upsert.return_value = {
            "id": "rev-01",
            "submission_id": "sub-01",
            "advisor_id": "advisor-a",
            "status": "APPROVED",
            "remarks": "Excellent project implementation!",
            "created_at": "2026-09-02T22:00:00Z",
            "updated_at": "2026-09-02T22:00:00Z",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/submissions/sub-01/review",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "APPROVED",
                "remarks": "Excellent project implementation!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "APPROVED"
        assert data["remarks"] == "Excellent project implementation!"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    def test_save_unassigned_submission_review_forbidden(
        self, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {"id": "sub-03", "team_id": "team-03", "status": "SUBMITTED"}
        # Team 03 belongs to Advisor B!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/submissions/sub-03/review",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "APPROVED",
                "remarks": "Attempting unauthorized review",
            },
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
