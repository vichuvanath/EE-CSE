"""Add phone_number to students

Revision ID: a1b2c3d4e5f6
Revises: 7e07063eedca
Create Date: 2026-09-07 16:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '7e07063eedca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('students', sa.Column('phone_number', sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column('students', 'phone_number')
