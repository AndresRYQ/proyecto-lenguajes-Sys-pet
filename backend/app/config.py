from urllib.parse import quote_plus
from typing import Any
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    # Parámetros individuales de Supabase / PostgreSQL
    host: str = Field(default="db.kjudticyywskfteezcog.supabase.co", alias="HOST")
    port: int = Field(default=5432, alias="PORT")
    database: str = Field(default="postgres", alias="DATABASE")
    user: str = Field(default="postgres", alias="USER")
    password: str = Field(default="", alias="PASSWORD")

    # URL directa opcional (e.g. Session Pooler de Supabase o proveída por Render)
    database_url: str | None = Field(default=None, alias="DATABASE_URL")

    # JWT
    secret_key: str = "clave_secreta_super_segura_veterinaria_oyanguren_2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # App
    app_name: str = "Veterinaria Oyanguren"
    debug: bool = False

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.strip().lower() in ("true", "1", "yes", "on", "debug")
        return bool(v)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        populate_by_name = True

    @property
    def async_database_url(self) -> str:
        """URL asíncrona compatible con asyncpg para FastAPI y SQLAlchemy."""
        if self.database_url:
            url = self.database_url
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif not url.startswith("postgresql+asyncpg://"):
                url = f"postgresql+asyncpg://{url.split('://', 1)[-1]}"
            return url
        pwd = quote_plus(self.password)
        return f"postgresql+asyncpg://{self.user}:{pwd}@{self.host}:{self.port}/{self.database}"

    @property
    def sync_database_url(self) -> str:
        """URL síncrona para Alembic y psycopg2."""
        if self.database_url:
            url = self.database_url
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        pwd = quote_plus(self.password)
        return f"postgresql://{self.user}:{pwd}@{self.host}:{self.port}/{self.database}"


settings = Settings()
