"""002_advisor_team_assignments

Revision ID: 002_advisor_team_assignments
Revises: 001_initial_schema
Create Date: 2026-09-02 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_advisor_team_assignments'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'advisor_team_assignments',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('advisor_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', sa.UUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.UniqueConstraint('advisor_id', 'team_id', name='uq_advisor_team_assignment'),
    )
    op.create_index('idx_advisor_team_assignments_advisor_id', 'advisor_team_assignments', ['advisor_id'])
    op.create_index('idx_advisor_team_assignments_team_id', 'advisor_team_assignments', ['team_id'])
    op.create_index('idx_advisor_team_assignments_composite', 'advisor_team_assignments', ['advisor_id', 'team_id'])


def downgrade() -> None:
    op.drop_table('advisor_team_assignments')
