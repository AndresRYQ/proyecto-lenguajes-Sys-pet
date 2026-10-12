import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Cargar .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Agregar el backend al path para importar los modelos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database.engine import Base
import app.models  # importa todos los modelos para que Alembic los detecte

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Usar la URL del .env, convirtiendo asyncpg → psycopg2 para Alembic
db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
