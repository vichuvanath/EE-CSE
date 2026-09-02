import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.repositories.assignment_repository import (
    create_assignment,
    check_assignment,
    get_assigned_team_ids,
    remove_assignment,
)
from app.services.assignment_service import (
    create_advisor_team_assignment,
    get_advisor_assigned_team_ids,
)
from app.core.exceptions import DatabaseError, DuplicateResourceError
from app.schemas.user import UserResponse


class TestAdvisorTeamAssignment:

    @patch("app.repositories.assignment_repository.get_supabase_admin_client")
    @patch("app.repositories.assignment_repository.check_assignment")
    def test_create_assignment_success(self, mock_check, mock_admin_supabase):
        mock_check.return_value = False

        mock_res = MagicMock()
        mock_res.data = [{
            "id": "asgn-uuid-001",
            "advisor_id": "advisor-101",
            "team_id": "team-501",
            "created_at": "2026-09-02T22:00:00Z",
        }]
        mock_admin_supabase.return_value.table.return_value.insert.return_value.execute.return_value = mock_res

        assignment = create_assignment("advisor-101", "team-501")
        assert assignment.id == "asgn-uuid-001"
        assert assignment.advisor_id == "advisor-101"
        assert assignment.team_id == "team-501"

    @patch("app.repositories.assignment_repository.get_supabase_admin_client")
    @patch("app.repositories.assignment_repository.check_assignment")
    def test_create_duplicate_assignment_rejected(self, mock_check, mock_admin_supabase):
        mock_check.return_value = True

        with pytest.raises(DuplicateResourceError) as exc_info:
            create_assignment("advisor-101", "team-501")
        assert "already assigned" in str(exc_info.value.detail)


    @patch("app.repositories.assignment_repository.get_supabase_client")
    def test_check_assignment_returns_true(self, mock_supabase):
        mock_res = MagicMock()
        mock_res.data = [{"id": "asgn-1"}]
        mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_res

        assert check_assignment("adv-1", "team-1") is True

    @patch("app.repositories.assignment_repository.get_supabase_client")
    def test_get_assigned_team_ids_aggregates_junction_and_faculty_id(self, mock_supabase):
        # Junction table result
        mock_res_junc = MagicMock()
        mock_res_junc.data = [{"team_id": "team-01"}, {"team_id": "team-02"}]

        # Teams table result
        mock_res_teams = MagicMock()
        mock_res_teams.data = [{"id": "team-02"}, {"id": "team-03"}]

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == "advisor_team_assignments":
                mock_tbl.select.return_value.eq.return_value.execute.return_value = mock_res_junc
            else:
                mock_tbl.select.return_value.eq.return_value.execute.return_value = mock_res_teams
            return mock_tbl

        mock_supabase.return_value.table.side_effect = table_side_effect

        team_ids = get_assigned_team_ids("adv-100")
        assert set(team_ids) == {"team-01", "team-02", "team-03"}

    @patch("app.services.assignment_service.get_user_by_id")
    @patch("app.services.assignment_service.get_team_by_id")
    @patch("app.services.assignment_service.create_assignment")
    def test_admin_creating_assignment_success(self, mock_create, mock_get_team, mock_get_user):
        admin_user = {"id": "admin-1", "role": "admin"}
        mock_get_user.return_value = UserResponse(id="adv-10", email="adv10@college.edu", full_name="Dr. Adv", role="advisor")
        mock_get_team.return_value = MagicMock(id="team-99")

        mock_assignment = MagicMock()
        mock_assignment.model_dump.return_value = {"id": "asgn-99", "advisor_id": "adv-10", "team_id": "team-99"}
        mock_create.return_value = mock_assignment

        res = create_advisor_team_assignment(admin_user, "adv-10", "team-99")
        assert res["id"] == "asgn-99"

    def test_regular_advisor_self_assignment_denied(self):
        advisor_user = {"id": "adv-10", "role": "advisor"}
        with pytest.raises(HTTPException) as exc:
            create_advisor_team_assignment(advisor_user, "adv-10", "team-99")
        assert exc.value.status_code == 403
        assert "Only administrators or HODs can create advisor-team assignments" in exc.value.detail
