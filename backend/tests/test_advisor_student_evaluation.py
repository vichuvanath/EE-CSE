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


class TestAdvisorStudentEvaluationAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_user_by_id")
    @patch("app.services.advisor_evaluation_service.get_team_members")
    @patch("app.services.advisor_evaluation_service.get_team_evaluation")
    @patch("app.services.advisor_evaluation_service.upsert_student_evaluation")
    def test_save_student_evaluation_success_total_calculated(
        self, mock_upsert_student, mock_get_eval, mock_members, mock_user, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_user.return_value = MagicMock(id="student-01")
        mock_members.return_value = [{"student_id": "student-01"}]
        mock_get_eval.return_value = {"id": "eval-01", "status": "IN_PROGRESS"}

        mock_upsert_student.return_value = {
            "id": "st-eval-01",
            "evaluation_id": "eval-01",
            "student_id": "student-01",
            "project_marks": 20.0,
            "presentation_marks": 18.0,
            "technical_marks": 19.0,
            "documentation_marks": 17.0,
            "contribution_marks": 20.0,
            "total_marks": 94.0,
            "remarks": "Excellent overall contribution.",
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/students/student-01/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "project_marks": 20.0,
                "presentation_marks": 18.0,
                "technical_marks": 19.0,
                "documentation_marks": 17.0,
                "contribution_marks": 20.0,
                "remarks": "Excellent overall contribution.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_marks"] == 94.0
        assert data["student_id"] == "student-01"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_user_by_id")
    @patch("app.services.advisor_evaluation_service.get_team_members")
    def test_student_not_in_team_bad_request(
        self, mock_members, mock_user, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-01")
        mock_check.return_value = True
        mock_user.return_value = MagicMock(id="student-99")
        mock_members.return_value = [{"student_id": "student-01"}] # student-99 not in team-01!

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-01/students/student-99/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "project_marks": 20.0,
                "presentation_marks": 20.0,
                "technical_marks": 20.0,
                "documentation_marks": 20.0,
                "contribution_marks": 20.0,
            },
        )

        assert response.status_code == 400
        assert "does not belong to Team" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    def test_unassigned_team_student_evaluation_forbidden(
        self, mock_check, mock_team, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team.return_value = MagicMock(id="team-03")
        # Team 03 is assigned to Advisor B!
        mock_check.return_value = False

        token = generate_jwt("advisor-a", "advisor")
        response = client.post(
            "/api/advisor/teams/team-03/students/student-03/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "project_marks": 20.0,
                "presentation_marks": 20.0,
                "technical_marks": 20.0,
                "documentation_marks": 20.0,
                "contribution_marks": 20.0,
            },
        )

        assert response.status_code == 403
        assert "not assigned to this advisor" in response.json()["detail"]
