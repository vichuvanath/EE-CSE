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


class TestAdvisorEvaluationManagementAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_evaluation_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.update_evaluation_status")
    def test_submit_evaluation_success(
        self, mock_update_status, mock_check, mock_get_eval, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_eval.return_value = {"id": "eval-01", "team_id": "team-01", "status": "IN_PROGRESS"}
        mock_check.return_value = True
        mock_update_status.return_value = {
            "id": "eval-01",
            "team_id": "team-01",
            "advisor_id": "advisor-a",
            "status": "SUBMITTED",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/evaluations/eval-01/submit",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "SUBMITTED"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_evaluation_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.update_evaluation_status")
    def test_lock_evaluation_success(
        self, mock_update_status, mock_check, mock_get_eval, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_eval.return_value = {"id": "eval-01", "team_id": "team-01", "status": "SUBMITTED"}
        mock_check.return_value = True
        mock_update_status.return_value = {
            "id": "eval-01",
            "team_id": "team-01",
            "advisor_id": "advisor-a",
            "status": "LOCKED",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/evaluations/eval-01/lock",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "LOCKED"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_team_evaluation")
    def test_locked_evaluation_team_score_edit_rejected(
        self, mock_get_eval, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        # Status is LOCKED!
        mock_get_eval.return_value = {"id": "eval-01", "team_id": "team-01", "status": "LOCKED"}

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "team_score": 99.0,
                "team_remarks": "Attempting edit after lock",
            },
        )

        assert response.status_code == 409
        assert "LOCKED and cannot be modified" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_user_by_id")
    @patch("app.services.advisor_evaluation_service.get_team_members")
    @patch("app.services.advisor_evaluation_service.get_team_evaluation")
    def test_locked_evaluation_student_marks_edit_rejected(
        self, mock_get_eval, mock_members, mock_user, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_user.return_value = MagicMock(id="student-01")
        mock_members.return_value = [{"student_id": "student-01"}]
        # Status is LOCKED!
        mock_get_eval.return_value = {"id": "eval-01", "team_id": "team-01", "status": "LOCKED"}

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/students/student-01/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "project_marks": 20.0,
                "presentation_marks": 20.0,
                "technical_marks": 20.0,
                "documentation_marks": 20.0,
                "contribution_marks": 20.0,
            },
        )

        assert response.status_code == 409
        assert "LOCKED and cannot be modified" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_evaluation_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    def test_locked_evaluation_state_transition_rejected(
        self, mock_check, mock_get_eval, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        # Status is LOCKED!
        mock_get_eval.return_value = {"id": "eval-01", "team_id": "team-01", "status": "LOCKED"}
        mock_check.return_value = True

        token = generate_jwt("advisor-a", "advisor")
        # Attempting forbidden transition LOCKED -> IN_PROGRESS
        response = client.post(
            "/api/advisor/evaluations/eval-01/submit",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert "LOCKED and cannot be modified or transitioned" in response.json()["detail"]
