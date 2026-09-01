import pytest
from unittest.mock import MagicMock, patch
from app.schemas.user import UserCreate, UserResponse
from app.schemas.team import TeamCreate, TeamResponse
from app.schemas.progress import ProgressCreate, ProgressResponse
from app.schemas.grade import GradeCreate, GradeResponse


class TestUserSchemas:
    def test_user_create_valid(self):
        data = UserCreate(
            email="test@example.com",
            password="password123",
            full_name="Test User",
            role="student",
        )
        assert data.email == "test@example.com"
        assert data.role == "student"

    def test_user_response(self):
        data = UserResponse(
            id="test-id",
            email="test@example.com",
            full_name="Test User",
            role="student",
        )
        assert data.id == "test-id"


class TestTeamSchemas:
    def test_team_create_valid(self):
        data = TeamCreate(
            name="Team Alpha",
            project_title="Project Alpha",
            faculty_id="faculty-id",
        )
        assert data.name == "Team Alpha"
        assert data.project_title == "Project Alpha"

    def test_team_response(self):
        data = TeamResponse(
            id="team-id",
            name="Team Alpha",
            project_title="Project Alpha",
            faculty_id="faculty-id",
        )
        assert data.id == "team-id"


class TestProgressSchemas:
    def test_progress_create_valid(self):
        data = ProgressCreate(
            team_id="team-id",
            week_number=1,
            title="Week 1 Report",
            content="Progress content here",
        )
        assert data.week_number == 1
        assert data.title == "Week 1 Report"

    def test_progress_create_invalid_week(self):
        with pytest.raises(Exception):
            ProgressCreate(
                team_id="team-id",
                week_number=0,
                title="Week 0 Report",
                content="Content",
            )


class TestGradeSchemas:
    def test_grade_create_valid(self):
        data = GradeCreate(
            progress_report_id="report-id",
            grade=85.5,
            feedback="Good work",
        )
        assert data.grade == 85.5

    def test_grade_response(self):
        data = GradeResponse(
            id="grade-id",
            progress_report_id="report-id",
            faculty_id="faculty-id",
            grade=85.5,
            feedback="Good work",
            is_visible=False,
        )
        assert data.is_visible is False
