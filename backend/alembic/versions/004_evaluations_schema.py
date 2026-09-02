"""004_evaluations_schema

Revision ID: 004_evaluations_schema
Revises: 003_reviews_schema
Create Date: 2026-09-02 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004_evaluations_schema'
down_revision: Union[str, None] = '003_reviews_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. evaluations table
    op.create_table(
        'evaluations',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('advisor_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='NOT_STARTED', nullable=False),
        sa.Column('team_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('team_remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_evaluations_team_id', 'evaluations', ['team_id'])
    op.create_index('idx_evaluations_advisor_id', 'evaluations', ['advisor_id'])
    op.create_index('idx_evaluations_status', 'evaluations', ['status'])

    # 2. student_evaluations table
    op.create_table(
        'student_evaluations',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('evaluation_id', sa.UUID(), sa.ForeignKey('evaluations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('project_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('presentation_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('technical_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('documentation_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('contribution_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('total_marks', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.UniqueConstraint('evaluation_id', 'student_id', name='uq_student_evaluation_eval_student'),
    )
    op.create_index('idx_student_evaluations_evaluation_id', 'student_evaluations', ['evaluation_id'])
    op.create_index('idx_student_evaluations_student_id', 'student_evaluations', ['student_id'])


def downgrade() -> None:
    op.drop_table('student_evaluations')
    op.drop_table('evaluations')
