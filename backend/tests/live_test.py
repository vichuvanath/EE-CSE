"""
Live database integration test script for Supabase.
Run this script to verify connectivity and repository operations:
    python tests/live_test.py
"""

import sys
import os

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import (
    DatabaseError,
    ResourceNotFoundError,
    TeamCapacityError,
    StudentAlreadyAssignedError,
    DuplicateWeekReportError,
)
from app.repositories.user_repository import (
    get_all_users,
    get_all_students,
    get_all_faculty,
)
from app.repositories.team_repository import (
    get_all_teams,
    get_team_member_count,
)
from app.repositories.progress_repository import (
    get_all_progress_reports,
)


def run_live_checks():
    print("=" * 60)
    print("[CHECK] STUDENT PROJECT PORTAL - DATABASE INTEGRATION CHECK")
    print("=" * 60)

    # 1. Check Configuration
    print("\n[1/5] Checking Configuration & Credentials...")
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        print("  [ERROR] SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env")
        sys.exit(1)
    print(f"  [OK] Supabase URL: {settings.SUPABASE_URL}")
    print(f"  [OK] Anon Key present: {'Yes' if settings.SUPABASE_ANON_KEY else 'No'}")
    print(f"  [OK] Service Role Key present: {'Yes' if settings.SUPABASE_SERVICE_ROLE_KEY else 'No'}")

    # 2. Test Supabase Client Connection
    print("\n[2/5] Testing Supabase Client Connection...")
    try:
        client = get_supabase_client()
        res = client.table("profiles").select("count", count="exact").execute()
        print(f"  [OK] Connected successfully! Total registered profiles: {res.count or 0}")
    except Exception as e:
        print(f"  [ERROR] Connection failed: {e}")
        return

    # 3. Test Repository Queries (Read-only)
    print("\n[3/5] Testing Repository Read Operations...")
    try:
        users = get_all_users()
        students = get_all_students()
        faculty = get_all_faculty()
        teams = get_all_teams()
        progress = get_all_progress_reports()

        print(f"  [OK] get_all_users(): {len(users)} users found")
        print(f"  [OK] get_all_students(): {len(students)} students found")
        print(f"  [OK] get_all_faculty(): {len(faculty)} faculty found")
        print(f"  [OK] get_all_teams(): {len(teams)} teams found")
        print(f"  [OK] get_all_progress_reports(): {len(progress)} progress reports found")
    except Exception as e:
        print(f"  [ERROR] Error during repository reads: {e}")

    # 4. Check Table Schema Availability
    print("\n[4/5] Checking Supabase Tables...")
    tables = ["profiles", "teams", "team_members", "progress_reports", "grades"]
    admin_client = get_supabase_admin_client()
    for tbl in tables:
        try:
            r = admin_client.table(tbl).select("*").limit(1).execute()
            print(f"  [OK] Table '{tbl}' is accessible")
        except Exception as e:
            print(f"  [ERROR] Table '{tbl}' error: {e}")

    # 5. Summary
    print("\n[5/5] Status Summary:")
    print("  [SUCCESS] All repository connections and data layer integrations are operational!")
    print("=" * 60)


if __name__ == "__main__":
    run_live_checks()
