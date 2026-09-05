import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from jose import jwt
from app.core.config import settings
from app.dependencies.auth import require_advisor, verify_advisor_team_access


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorAuthorization:

    @pytest.mark.asyncio
    async def test_require_advisor_allows_advisor_role(self):
        user_context = {"id": "adv-1", "role": "advisor", "email": "adv1@college.edu"}
        res = await require_advisor(user_context)
        assert res["id"] == "adv-1"

    @pytest.mark.asyncio
    async def test_require_advisor_allows_faculty_role(self):
        user_context = {"id": "fac-1", "role": "faculty", "email": "fac1@college.edu"}
        res = await require_advisor(user_context)
        assert res["id"] == "fac-1"

    @pytest.mark.asyncio
    async def test_require_advisor_denies_student_role(self):
        user_context = {"id": "student-1", "role": "student", "email": "student1@college.edu"}
        with pytest.raises(HTTPException) as exc_info:
            await require_advisor(user_context)
        assert exc_info.value.status_code == 403
        assert "Advisor access required" in exc_info.value.detail

    @patch("app.repositories.assignment_repository.check_assignment")
    def test_advisor_access_assigned_team_allowed(self, mock_check):
        # Advisor A assigned to Team 01
        mock_check.return_value = True
        assert verify_advisor_team_access("advisor-a", "team-01") is True
        mock_check.assert_called_once_with("advisor-a", "team-01")

    @patch("app.repositories.assignment_repository.check_assignment")
    def test_advisor_access_unassigned_team_denied(self, mock_check):
        # Advisor A trying to access Team 04 (assigned to Advisor B)
        mock_check.return_value = False
        with pytest.raises(HTTPException) as exc_info:
            verify_advisor_team_access("advisor-a", "team-04")
        assert exc_info.value.status_code == 403
        assert "Access denied: Team is not assigned to this advisor" in exc_info.value.detail

    @patch("app.repositories.assignment_repository.check_assignment")
    def test_cross_advisor_team_isolation_matrix(self, mock_check):
        """
        Matrix Test:
        Advisor A assigned to: [team-01, team-02]
        Advisor B assigned to: [team-03, team-04]
        """
        def mock_check_impl(adv_id, tm_id):
            assignments = {
                "advisor-a": ["team-01", "team-02"],
                "advisor-b": ["team-03", "team-04"],
            }
            return tm_id in assignments.get(adv_id, [])

        mock_check.side_effect = mock_check_impl

        # Advisor A accesses assigned teams
        assert verify_advisor_team_access("advisor-a", "team-01") is True
        assert verify_advisor_team_access("advisor-a", "team-02") is True

        # Advisor A accesses Advisor B's teams -> DENIED (403)
        with pytest.raises(HTTPException) as exc1:
            verify_advisor_team_access("advisor-a", "team-03")
        assert exc1.value.status_code == 403

        with pytest.raises(HTTPException) as exc2:
            verify_advisor_team_access("advisor-a", "team-04")
        assert exc2.value.status_code == 403

        # Advisor B accesses assigned teams
        assert verify_advisor_team_access("advisor-b", "team-03") is True
        assert verify_advisor_team_access("advisor-b", "team-04") is True

        # Advisor B accesses Advisor A's teams -> DENIED (403)
        with pytest.raises(HTTPException) as exc3:
            verify_advisor_team_access("advisor-b", "team-01")
        assert exc3.value.status_code == 403
