"""merge alembic heads for render

Revision ID: 22c30a722d3a
Revises: 2e5db5dafba1, d3f2da18fe9f, 7b25a2a2abae
Create Date: 2025-09-18 19:01:20.065779

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '22c30a722d3a'
down_revision = ('2e5db5dafba1', 'd3f2da18fe9f', '7b25a2a2abae')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
