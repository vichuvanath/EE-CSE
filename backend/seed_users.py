import uuid
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.core.supabase import get_supabase_admin_client
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.advisor import Advisor
from app.models.academic import (
    Class,
    ClassEnrollment,
    Team,
    TeamMember,
    TeamAssignment,
    Project,
)
from app.models.communication import Deadline, Announcement, AnnouncementTarget, Notification

def seed_mock_users():
    """
    Idempotent seeder that ensures tables exist and default development data
    (users, profiles, classes, teams, projects, deadlines) is populated.
    """
    # 1. Ensure all database tables exist
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Database Init Warning] create_all: {e}")

    db = SessionLocal()
    supabase_admin = get_supabase_admin_client()

    mock_users_data = [
        {
            "email": "student@siet.edu",
            "password": "StudentPassword@123",
            "full_name": "John Doe",
            "role": UserRole.STUDENT,
            "profile_type": "student",
            "roll_number": "23EE101",
            "department": "Electrical Engineering",
            "batch": "2022-2026",
            "phone_number": "+91 9876543210",
        },
        {
            "email": "advisor@siet.edu",
            "password": "AdvisorPassword@123",
            "full_name": "Dr. Alan Turing",
            "role": UserRole.ADVISOR,
            "profile_type": "advisor",
            "designation": "Assistant Professor",
            "department": "Electrical Engineering",
        },
        {
            "email": "admin@siet.edu",
            "password": "AdminPassword@123",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "profile_type": "admin",
        },
    ]

    print("--- [Auto-Seeder] Seeding Default Development Data ---")

    student_entity = None
    advisor_entity = None

    for u_info in mock_users_data:
        email = u_info["email"]
        raw_password = u_info["password"]
        role = u_info["role"]
        full_name = u_info["full_name"]

        # 1. Try to create / sync with Supabase Auth (if admin client configured)
        supabase_uid = None
        if supabase_admin:
            try:
                sb_res = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": raw_password,
                    "email_confirm": True,
                    "user_metadata": {"full_name": full_name, "role": role}
                })
                if sb_res and sb_res.user:
                    supabase_uid = sb_res.user.id
            except Exception:
                pass

        # 2. Check if user exists in DB
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                supabase_uid=supabase_uid,
                email=email,
                password_hash=hash_password(raw_password),
                full_name=full_name,
                role=role,
                is_active=True,
            )
            db.add(user)
            db.flush()
        else:
            user.password_hash = hash_password(raw_password)
            user.full_name = full_name
            user.role = role
            user.is_active = True
            if supabase_uid and not user.supabase_uid:
                user.supabase_uid = supabase_uid
            db.flush()

        # 3. Create role specific profile
        if u_info["profile_type"] == "student":
            student = db.query(Student).filter(Student.user_id == user.id).first()
            if not student:
                student = Student(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    roll_number=u_info["roll_number"],
                    department=u_info["department"],
                    batch=u_info["batch"],
                    phone_number=u_info.get("phone_number"),
                )
                db.add(student)
                db.flush()
            else:
                student.roll_number = u_info["roll_number"]
                student.department = u_info["department"]
                student.batch = u_info["batch"]
                student.phone_number = u_info.get("phone_number")
                db.flush()
            student_entity = student

        elif u_info["profile_type"] == "advisor":
            advisor = db.query(Advisor).filter(Advisor.user_id == user.id).first()
            if not advisor:
                advisor = Advisor(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    designation=u_info["designation"],
                    department=u_info["department"],
                )
                db.add(advisor)
                db.flush()
            else:
                advisor.designation = u_info["designation"]
                advisor.department = u_info["department"]
                db.flush()
            advisor_entity = advisor

    # 4. Seed Academic Structure (Class, Team, TeamMember, Project, Deadlines)
    try:
        academic_class = db.query(Class).filter(Class.code == "EE401").first()
        if not academic_class:
            academic_class = Class(
                id=str(uuid.uuid4()),
                name="Senior EE Capstone Project",
                code="EE401",
                academic_year="2025-2026",
                semester="Spring",
            )
            db.add(academic_class)
            db.flush()

        if student_entity:
            # Class enrollment
            enrollment = db.query(ClassEnrollment).filter(
                ClassEnrollment.class_id == academic_class.id,
                ClassEnrollment.student_id == student_entity.id,
            ).first()
            if not enrollment:
                enrollment = ClassEnrollment(
                    id=str(uuid.uuid4()),
                    class_id=academic_class.id,
                    student_id=student_entity.id,
                )
                db.add(enrollment)
                db.flush()

            # Team
            team = db.query(Team).filter(
                Team.class_id == academic_class.id,
                Team.name == "Team SmartGrid Alpha",
            ).first()
            if not team:
                team = Team(
                    id=str(uuid.uuid4()),
                    name="Team SmartGrid Alpha",
                    class_id=academic_class.id,
                )
                db.add(team)
                db.flush()

            # Team Member
            member = db.query(TeamMember).filter(
                TeamMember.team_id == team.id,
                TeamMember.student_id == student_entity.id,
            ).first()
            if not member:
                member = TeamMember(
                    id=str(uuid.uuid4()),
                    team_id=team.id,
                    student_id=student_entity.id,
                )
                db.add(member)
                db.flush()

            # Project
            project = db.query(Project).filter(Project.team_id == team.id).first()
            if not project:
                project = Project(
                    id=str(uuid.uuid4()),
                    team_id=team.id,
                    title="IoT-Based Smart Energy Monitoring & Grid Balancing",
                    description="Real-time IoT smart meter telemetry and intelligent load balancing for campus electrical distribution.",
                )
                db.add(project)
                db.flush()

            # Advisor Team Assignment
            if advisor_entity:
                assignment = db.query(TeamAssignment).filter(
                    TeamAssignment.team_id == team.id,
                    TeamAssignment.advisor_id == advisor_entity.id,
                ).first()
                if not assignment:
                    assignment = TeamAssignment(
                        id=str(uuid.uuid4()),
                        team_id=team.id,
                        advisor_id=advisor_entity.id,
                        role="guide",
                    )
                    db.add(assignment)
                    db.flush()

            # Default Deadlines
            deadline = db.query(Deadline).filter(Deadline.class_id == academic_class.id).first()
            if not deadline:
                deadline = Deadline(
                    id=str(uuid.uuid4()),
                    class_id=academic_class.id,
                    title="Phase 1: Project Proposal & System Architecture Report",
                    description="Submit system requirements, block diagrams, and hardware bill of materials.",
                    due_at=datetime.now(timezone.utc) + timedelta(days=14),
                )
                db.add(deadline)
                db.flush()

        db.commit()
        print("--- [Auto-Seeder] Seed completed successfully! ---")
    except Exception as e:
        db.rollback()
        print(f"[Auto-Seeder] Error during academic seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_mock_users()
