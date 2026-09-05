"""001_initial_student_portal_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-02 21:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. profiles table
    op.create_table(
        'profiles',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('roll_number', sa.String(length=100), nullable=True, unique=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=50), server_default='student', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_profiles_roll_number', 'profiles', ['roll_number'])

    # 2. teams table
    op.create_table(
        'teams',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('project_title', sa.String(length=255), nullable=True),
        sa.Column('faculty_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('batch', sa.String(length=50), server_default='2023-2027', nullable=True),
        sa.Column('section', sa.String(length=10), server_default='A', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )

    # 3. team_members table
    op.create_table(
        'team_members',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('added_by', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_team_members_team_id', 'team_members', ['team_id'])
    op.create_index('idx_team_members_student_id', 'team_members', ['student_id'])

    # 4. projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=True),
        sa.Column('problem_statement', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('proposed_solution', sa.Text(), nullable=True),
        sa.Column('technologies_used', sa.String(length=1000), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('live_demo_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='ongoing', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_projects_team_id', 'projects', ['team_id'])

    # 5. project_files table
    op.create_table(
        'project_files',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('project_id', sa.UUID(), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('storage_path', sa.String(length=500), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_project_files_team_id', 'project_files', ['team_id'])

    # 6. submissions table
    op.create_table(
        'submissions',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('project_id', sa.UUID(), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='SUBMITTED', nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_submissions_project_id', 'submissions', ['project_id'])


def downgrade() -> None:
    op.drop_table('submissions')
    op.drop_table('project_files')
    op.drop_table('projects')
    op.drop_table('team_members')
    op.drop_table('teams')
    op.drop_table('profiles')
