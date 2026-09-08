import uuid
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.supabase import get_supabase_admin_client
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.advisor import Advisor

def seed_mock_users():
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

    print("--- Seeding Mock Users into Database ---")

    for u_info in mock_users_data:
        email = u_info["email"]
        raw_password = u_info["password"]
        role = u_info["role"]
        full_name = u_info["full_name"]

        # 1. Try to create / sync with Supabase Auth (if admin client is available)
        supabase_uid = None
        if supabase_admin:
            try:
                # Try creating user in Supabase auth
                sb_res = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": raw_password,
                    "email_confirm": True,
                    "user_metadata": {"full_name": full_name, "role": role}
                })
                if sb_res and sb_res.user:
                    supabase_uid = sb_res.user.id
                    print(f"[Supabase Auth] Created auth user: {email} (UID: {supabase_uid})")
            except Exception as e:
                # If already exists or other error, ignore
                print(f"[Supabase Auth] Notice for {email}: {e}")

        # 2. Check if user already exists in DB
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
            print(f"[Database] Created User: {email} with role: {role}")
        else:
            user.password_hash = hash_password(raw_password)
            user.full_name = full_name
            user.role = role
            user.is_active = True
            if supabase_uid:
                user.supabase_uid = supabase_uid
            db.flush()
            print(f"[Database] Updated existing User: {email}")

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
                print(f"[Database] Created Student profile: Roll {u_info['roll_number']}")
            else:
                student.roll_number = u_info["roll_number"]
                student.department = u_info["department"]
                student.batch = u_info["batch"]
                student.phone_number = u_info.get("phone_number")

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
                print(f"[Database] Created Advisor profile: {u_info['designation']}")
            else:
                advisor.designation = u_info["designation"]
                advisor.department = u_info["department"]

    db.commit()
    db.close()
    print("--- Seeding complete successfully! ---")

if __name__ == "__main__":
    seed_mock_users()
