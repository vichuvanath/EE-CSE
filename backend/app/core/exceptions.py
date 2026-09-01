class DatabaseError(Exception):
    def __init__(self, message: str = "A database error occurred", detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)


class ResourceNotFoundError(DatabaseError):
    def __init__(self, resource: str, resource_id: str):
        self.message = f"{resource} with id '{resource_id}' not found"
        super().__init__(self.message)


class DuplicateResourceError(DatabaseError):
    def __init__(self, resource: str, detail: str | None = None):
        self.message = f"{resource} already exists"
        self.detail = detail
        super().__init__(self.message)


class TeamCapacityError(DatabaseError):
    def __init__(self, team_id: str, max_capacity: int = 5):
        self.message = f"Team '{team_id}' has reached maximum capacity of {max_capacity} members"
        super().__init__(self.message)


class StudentAlreadyAssignedError(DatabaseError):
    def __init__(self, student_id: str):
        self.message = f"Student '{student_id}' is already assigned to a team"
        super().__init__(self.message)


class StudentNotAssignedError(DatabaseError):
    def __init__(self, student_id: str):
        self.message = f"Student '{student_id}' is not assigned to any team"
        super().__init__(self.message)


class SupabaseConnectionError(DatabaseError):
    def __init__(self, detail: str | None = None):
        self.message = "Failed to connect to Supabase"
        self.detail = detail
        super().__init__(self.message)


class InvalidRoleError(DatabaseError):
    def __init__(self, role: str):
        self.message = f"Invalid role: '{role}'. Must be one of: admin, faculty, student"
        super().__init__(self.message)


class GradePermissionError(DatabaseError):
    def __init__(self):
        self.message = "Only the mentoring faculty can grade this team's progress"
        super().__init__(self.message)


class DuplicateWeekReportError(DatabaseError):
    def __init__(self, team_id: str, week_number: int):
        self.message = f"Team '{team_id}' already has a progress report for week {week_number}"
        super().__init__(self.message)
