"""Initial

Revision ID: d3f2da18fe9f
Revises: 
Create Date: 2025-09-18 11:56:18.229603

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd3f2da18fe9f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    try:
        existing_enums = {enum['name'] for enum in inspector.get_enums()}
    except NotImplementedError:
        existing_enums = set()

    if 'restaurantes' not in existing_tables:
        op.create_table(
            'restaurantes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('nombre', sa.String(length=100), nullable=False),
            sa.Column('direccion', sa.String(length=200), nullable=True),
            sa.Column('telefono', sa.String(length=11), nullable=True),
            sa.Column('email_contacto', sa.String(length=100), nullable=True),
            sa.Column('activo', sa.Boolean(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        existing_tables.add('restaurantes')

    if 'margen_objetivo' not in existing_tables:
        op.create_table(
            'margen_objetivo',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('restaurante_id', sa.Integer(), nullable=False),
            sa.Column('porcentaje_min', sa.Float(), nullable=False),
            sa.Column('porcentaje_max', sa.Float(), nullable=False),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.PrimaryKeyConstraint('id')
        )
        existing_tables.add('margen_objetivo')

    if 'proveedores' not in existing_tables:
        op.create_table(
            'proveedores',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('nombre', sa.String(length=100), nullable=False),
            sa.Column('categoria', sa.String(length=100), nullable=True),
            sa.Column('direccion', sa.String(length=200), nullable=True),
            sa.Column('telefono', sa.String(length=50), nullable=True),
            sa.Column('email_contacto', sa.String(length=100), nullable=True),
            sa.Column('observaciones', sa.Text(), nullable=True),
            sa.Column('restaurante_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.PrimaryKeyConstraint('id')
        )
        existing_tables.add('proveedores')

    roles_enum = sa.Enum(
        'admin',
        'encargado',
        'chef',
        name='roles',
        create_type='roles' not in existing_enums
    )

    if 'usuarios' not in existing_tables:
        op.create_table(
            'usuarios',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('nombre', sa.String(length=100), nullable=False),
            sa.Column('email', sa.String(length=100), nullable=False),
            sa.Column('password', sa.String(length=250), nullable=False),
            sa.Column('rol', roles_enum, nullable=False),
            sa.Column('restaurante_id', sa.Integer(), nullable=True),
            sa.Column('status', sa.String(length=20), nullable=True),
            sa.Column('moneda', sa.String(length=10), nullable=True),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('email')
        )
        existing_tables.add('usuarios')

    if 'ventas' not in existing_tables:
        op.create_table(
            'ventas',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('fecha', sa.Date(), nullable=False),
            sa.Column('monto', sa.Float(), nullable=False),
            sa.Column('turno', sa.String(length=50), nullable=True),
            sa.Column('restaurante_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.PrimaryKeyConstraint('id')
        )
        existing_tables.add('ventas')

    if 'facturas_albaranes' not in existing_tables:
        op.create_table(
            'facturas_albaranes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('proveedor_id', sa.Integer(), nullable=False),
            sa.Column('restaurante_id', sa.Integer(), nullable=False),
            sa.Column('fecha', sa.Date(), nullable=False),
            sa.Column('monto', sa.Float(), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id']),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.PrimaryKeyConstraint('id')
        )
        existing_tables.add('facturas_albaranes')

    if 'gastos' not in existing_tables:
        op.create_table(
            'gastos',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('fecha', sa.Date(), nullable=False),
            sa.Column('monto', sa.Float(), nullable=False),
            sa.Column('categoria', sa.String(length=100), nullable=True),
            sa.Column('proveedor_id', sa.Integer(), nullable=False),
            sa.Column('usuario_id', sa.Integer(), nullable=False),
            sa.Column('restaurante_id', sa.Integer(), nullable=False),
            sa.Column('nota', sa.Text(), nullable=True),
            sa.Column('archivo_adjunto', sa.String(length=200), nullable=True),
            sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id']),
            sa.ForeignKeyConstraint(['restaurante_id'], ['restaurantes.id']),
            sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id']),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade():
    op.drop_table('gastos')
    op.drop_table('facturas_albaranes')
    op.drop_table('ventas')
    op.drop_table('usuarios')
    op.drop_table('proveedores')
    op.drop_table('margen_objetivo')
    op.drop_table('restaurantes')
