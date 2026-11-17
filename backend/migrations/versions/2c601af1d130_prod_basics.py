"""production readiness fields and query indexes

Revision ID: 2c601af1d130
Revises: 7b8ab897d5f4
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2c601af1d130"
down_revision: Union[str, Sequence[str], None] = "7b8ab897d5f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE sedes SET nombre = 'Los Olivos' "
        "WHERE nombre = 'San Luis' "
        "AND NOT EXISTS (SELECT 1 FROM sedes WHERE nombre = 'Los Olivos')"
    )
    op.execute(
        "UPDATE sedes SET nombre = 'San Miguel' "
        "WHERE nombre = 'Surquillo' "
        "AND NOT EXISTS (SELECT 1 FROM sedes WHERE nombre = 'San Miguel')"
    )
    op.add_column("clientes", sa.Column("dni", sa.String(length=8), nullable=True))
    op.create_index("ix_clientes_dni", "clientes", ["dni"], unique=True)
    op.add_column(
        "historias_clinicas", sa.Column("observaciones", sa.Text(), nullable=True)
    )
    op.add_column(
        "usuarios",
        sa.Column("activo", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.add_column(
        "usuarios",
        sa.Column(
            "debe_cambiar_password",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )
    op.add_column(
        "veterinarios",
        sa.Column("activo", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.add_column(
        "sedes",
        sa.Column("activo", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.add_column(
        "facturas",
        sa.Column("anulada", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.create_index("ix_mascotas_cliente_id", "mascotas", ["cliente_id"])
    op.create_index("ix_usuarios_sede_id", "usuarios", ["sede_id"])
    op.create_index("ix_veterinarios_sede_id", "veterinarios", ["sede_id"])
    op.create_index("ix_citas_fecha", "citas", ["fecha"])
    op.create_index("ix_citas_estado", "citas", ["estado"])
    op.create_index("ix_citas_mascota_id", "citas", ["mascota_id"])
    op.create_index("ix_citas_sede_fecha_estado", "citas", ["sede_id", "fecha", "estado"])
    op.create_index("ix_citas_veterinario_fecha_hora", "citas", ["veterinario_id", "fecha", "hora"])
    op.create_index(
        "ix_historias_mascota_fecha",
        "historias_clinicas",
        ["mascota_id", "fecha"],
    )
    op.create_index("ix_facturas_fecha", "facturas", ["fecha"])


def downgrade() -> None:
    op.execute(
        "UPDATE sedes SET nombre = 'San Luis' "
        "WHERE nombre = 'Los Olivos' "
        "AND NOT EXISTS (SELECT 1 FROM sedes WHERE nombre = 'San Luis')"
    )
    op.execute(
        "UPDATE sedes SET nombre = 'Surquillo' "
        "WHERE nombre = 'San Miguel' "
        "AND NOT EXISTS (SELECT 1 FROM sedes WHERE nombre = 'Surquillo')"
    )
    op.drop_column("historias_clinicas", "observaciones")
    op.drop_index("ix_clientes_dni", table_name="clientes")
    op.drop_column("clientes", "dni")
    op.drop_index("ix_facturas_fecha", table_name="facturas")
    op.drop_index("ix_historias_mascota_fecha", table_name="historias_clinicas")
    op.drop_index("ix_citas_veterinario_fecha_hora", table_name="citas")
    op.drop_index("ix_citas_sede_fecha_estado", table_name="citas")
    op.drop_index("ix_citas_fecha", table_name="citas")
    op.drop_index("ix_citas_estado", table_name="citas")
    op.drop_index("ix_citas_mascota_id", table_name="citas")
    op.drop_index("ix_mascotas_cliente_id", table_name="mascotas")
    op.drop_index("ix_veterinarios_sede_id", table_name="veterinarios")
    op.drop_index("ix_usuarios_sede_id", table_name="usuarios")
    op.drop_column("facturas", "anulada")
    op.drop_column("sedes", "activo")
    op.drop_column("veterinarios", "activo")
    op.drop_column("usuarios", "debe_cambiar_password")
    op.drop_column("usuarios", "activo")
