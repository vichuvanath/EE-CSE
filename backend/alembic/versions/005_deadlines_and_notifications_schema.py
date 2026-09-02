"""005_deadlines_and_notifications_schema

Revision ID: 005_deadlines_and_notifications_schema
Revises: 004_evaluations_schema
Create Date: 2026-09-02 22:24:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_deadlines_and_notifications_schema'
down_revision: Union[str, None] = '004_evaluations_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. submission_deadlines table
    op.create_table(
        'submission_deadlines',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('advisor_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), server_default='Final Project Submission Deadline', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('deadline_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_submission_deadlines_team_id', 'submission_deadlines', ['team_id'])
    op.create_index('idx_submission_deadlines_advisor_id', 'submission_deadlines', ['advisor_id'])

    # 2. notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('recipient_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_notifications_recipient_id', 'notifications', ['recipient_id'])
    op.create_index('idx_notifications_is_read', 'notifications', ['is_read'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('submission_deadlines')
