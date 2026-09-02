"""003_submission_and_document_reviews

Revision ID: 003_reviews_schema
Revises: 002_advisor_team_assignments
Create Date: 2026-09-02 22:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_reviews_schema'
down_revision: Union[str, None] = '002_advisor_team_assignments'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. submission_reviews table
    op.create_table(
        'submission_reviews',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('submission_id', sa.UUID(), sa.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('advisor_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='PENDING', nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_submission_reviews_submission_id', 'submission_reviews', ['submission_id'])
    op.create_index('idx_submission_reviews_advisor_id', 'submission_reviews', ['advisor_id'])

    # 2. document_reviews table
    op.create_table(
        'document_reviews',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('file_id', sa.UUID(), sa.ForeignKey('project_files.id', ondelete='CASCADE'), nullable=False),
        sa.Column('advisor_id', sa.UUID(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='PENDING', nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.UniqueConstraint('file_id', 'advisor_id', name='uq_document_review_file_advisor'),
    )
    op.create_index('idx_document_reviews_file_id', 'document_reviews', ['file_id'])
    op.create_index('idx_document_reviews_advisor_id', 'document_reviews', ['advisor_id'])


def downgrade() -> None:
    op.drop_table('document_reviews')
    op.drop_table('submission_reviews')
