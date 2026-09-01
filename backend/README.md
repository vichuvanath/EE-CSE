# Student Project Management Portal - Database Access Layer

## Overview

This module provides a clean, reusable database access layer for the Student Project Management Portal. It connects FastAPI with Supabase/PostgreSQL and follows the repository pattern.

## Architecture

```
FastAPI Routes
    ↓
Service / Business Logic
    ↓
Repository Layer (THIS MODULE)
    ↓
Supabase Client
    ↓
PostgreSQL + RLS + Triggers
```

## Project Structure

```
app/
├── core/
│   ├── config.py          # Environment settings
│   ├── supabase.py        # Supabase client setup
│   └── exceptions.py      # Custom database exceptions
│
├── repositories/
│   ├── user_repository.py      # User/profile CRUD
│   ├── team_repository.py      # Team & membership CRUD
│   ├── progress_repository.py  # Progress reports CRUD
│   └── grade_repository.py     # Grades CRUD
│
├── schemas/
│   ├── user.py           # User Pydantic models
│   ├── team.py           # Team Pydantic models
│   ├── progress.py       # Progress report Pydantic models
│   └── grade.py          # Grade Pydantic models
│
└── main.py               # FastAPI app entry point
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

3. Run the app:
```bash
uvicorn app.main:app --reload
```

## Usage

### Importing Repositories

```python
from app.repositories.user_repository import get_user_by_id, get_all_students
from app.repositories.team_repository import create_team, add_student_to_team
from app.repositories.progress_repository import create_progress_report
from app.repositories.grade_repository import create_grade
```

### Example: Creating a Team

```python
from app.repositories.team_repository import create_team
from app.schemas.team import TeamCreate

data = TeamCreate(
    name="Team Alpha",
    project_title="AI Research Project",
    faculty_id="faculty-uuid",
)
team = create_team(data)
```

### Example: Adding a Student to a Team

```python
from app.repositories.team_repository import add_student_to_team

member = add_student_to_team(
    team_id="team-uuid",
    student_id="student-uuid",
    added_by="faculty-uuid",
)
```

### Example: Creating a Progress Report

```python
from app.repositories.progress_repository import create_progress_report
from app.schemas.progress import ProgressCreate

data = ProgressCreate(
    team_id="team-uuid",
    week_number=1,
    title="Week 1 Report",
    content="We completed the initial setup...",
)
report = create_progress_report(data, submitted_by="student-uuid")
```

### Example: Grading a Progress Report

```python
from app.repositories.grade_repository import create_grade
from app.schemas.grade import GradeCreate

data = GradeCreate(
    progress_report_id="report-uuid",
    grade=85.5,
    feedback="Good progress this week.",
)
grade = create_grade(data, faculty_id="faculty-uuid")
```

## Error Handling

Repositories raise custom exceptions instead of HTTP exceptions:

```python
from app.core.exceptions import (
    DatabaseError,
    ResourceNotFoundError,
    DuplicateResourceError,
    TeamCapacityError,
    StudentAlreadyAssignedError,
)

try:
    team = create_team(data)
except DuplicateResourceError as e:
    # Handle duplicate
    pass
except DatabaseError as e:
    # Handle general DB error
    pass
```

## Key Behaviors

| Feature | Behavior |
|---------|----------|
| Max 5 students per team | Enforced by database constraint |
| One team per student | Enforced by database constraint |
| One grade per progress report | Enforced by database constraint |
| Grades hidden by default | `is_visible = false` |
| Profile auto-created on signup | Supabase trigger handles this |

## Running Tests

```bash
pytest tests/ -v
```
