"""initial postgresql migration

Revision ID: 2e5db5dafba1
Revises: 
Create Date: 2025-09-18 16:31:16.272711

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2e5db5dafba1'
down_revision = None
branch_labels = None
depends_on = None


# This migration duplicated the Initial schema; it now acts as a no-op so
# Alembic history stays consistent without recreating existing tables.
def upgrade():
    pass


def downgrade():
    pass
