import pytest
from unittest.mock import MagicMock, patch
from app.core.exceptions import (
    DatabaseError,
    ResourceNotFoundError,
    DuplicateResourceError,
    TeamCapacityError,
    StudentAlreadyAssignedError,
)


class TestExceptions:
    def test_database_error(self):
        err = DatabaseError("Test error")
        assert err.message == "Test error"

    def test_resource_not_found_error(self):
        err = ResourceNotFoundError("User", "123")
        assert "User" in err.message
        assert "123" in err.message

    def test_duplicate_resource_error(self):
        err = DuplicateResourceError("User", "already exists")
        assert err.message == "User already exists"

    def test_team_capacity_error(self):
        err = TeamCapacityError("team-1", 5)
        assert "team-1" in err.message
        assert "5" in err.message

    def test_student_already_assigned_error(self):
        err = StudentAlreadyAssignedError("student-1")
        assert "student-1" in err.message


class TestUserRepository:
    @patch("app.repositories.user_repository.get_supabase_client")
    def test_get_user_by_id_found(self, mock_client):
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "user-1",
            "email": "test@example.com",
            "full_name": "Test User",
            "role": "student",
        }]
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        from app.repositories.user_repository import get_user_by_id
        result = get_user_by_id("user-1")
        assert result is not None
        assert result.id == "user-1"

    @patch("app.repositories.user_repository.get_supabase_client")
    def test_get_user_by_id_not_found(self, mock_client):
        mock_response = MagicMock()
        mock_response.data = []
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        from app.repositories.user_repository import get_user_by_id
        result = get_user_by_id("nonexistent")
        assert result is None


class TestTeamRepository:
    @patch("app.repositories.team_repository.get_supabase_client")
    def test_get_team_by_id_found(self, mock_client):
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "team-1",
            "name": "Team Alpha",
            "project_title": "Project Alpha",
            "faculty_id": "faculty-1",
        }]
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        from app.repositories.team_repository import get_team_by_id
        result = get_team_by_id("team-1")
        assert result is not None
        assert result.name == "Team Alpha"

    @patch("app.repositories.team_repository.get_supabase_client")
    def test_get_team_member_count(self, mock_client):
        mock_response = MagicMock()
        mock_response.count = 3
        mock_response.data = [{"id": "1"}, {"id": "2"}, {"id": "3"}]
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        from app.repositories.team_repository import get_team_member_count
        result = get_team_member_count("team-1")
        assert result == 3


class TestProgressRepository:
    @patch("app.repositories.progress_repository.get_supabase_client")
    def test_get_progress_by_team(self, mock_client):
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "p1", "team_id": "team-1", "week_number": 1, "title": "Week 1", "content": "Content 1"},
            {"id": "p2", "team_id": "team-1", "week_number": 2, "title": "Week 2", "content": "Content 2"},
        ]
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response

        from app.repositories.progress_repository import get_progress_by_team
        result = get_progress_by_team("team-1")
        assert len(result) == 2


class TestGradeRepository:
    @patch("app.repositories.grade_repository.get_supabase_client")
    def test_get_grade_by_id_found(self, mock_client):
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "grade-1",
            "progress_report_id": "pr-1",
            "faculty_id": "faculty-1",
            "grade": 85.5,
            "is_visible": False,
        }]
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        from app.repositories.grade_repository import get_grade_by_id
        result = get_grade_by_id("grade-1")
        assert result is not None
        assert result.grade == 85.5
