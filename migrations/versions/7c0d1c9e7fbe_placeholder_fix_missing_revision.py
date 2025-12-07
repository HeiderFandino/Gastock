"""Placeholder migration to restore missing revision

Revision ID: 7c0d1c9e7fbe
Revises: 8ff1b4620e21
Create Date: 2025-12-05

Esta migración es un no-op (no hace nada) y solo existe
para que Alembic pueda localizar la revisión que ya está
registrada en la base de datos.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c0d1c9e7fbe'
down_revision = '8ff1b4620e21'
branch_labels = None
depends_on = None


def upgrade():
    # No se realizan cambios de esquema aquí.
    pass


def downgrade():
    # No se realizan cambios de esquema aquí.
    pass

