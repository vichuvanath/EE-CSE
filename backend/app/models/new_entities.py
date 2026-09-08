from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class Class(Base):
    __tablename__ = 'classes'
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    advisor_id = Column(String, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Announcement(Base):
    __tablename__ = 'announcements'
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    author_id = Column(String, ForeignKey('users.id'), nullable=False)
    target_audience = Column(String, nullable=False) # 'ALL', 'CLASS', 'DEPARTMENT'
    is_published = Column(Boolean, default=False)
    scheduled_for = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id'), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class GradingScheme(Base):
    __tablename__ = 'grading_schemes'
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    rules = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Rubric(Base):
    __tablename__ = 'rubrics'
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    criteria = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AcademicCalendar(Base):
    __tablename__ = 'academic_calendars'
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    events = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
