from pathlib import Path
from urllib.parse import quote_plus

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    host: str = Field(default="", alias="HOST")
    port: int = Field(default=5432, validation_alias=AliasChoices("DB_PORT", "PORT"))
    database: str = Field(default="postgres", alias="DATABASE")
    user: str = Field(default="", alias="USER")
    password: str = Field(default="", alias="PASSWORD")
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    secret_key: str = Field(min_length=32, alias="SECRET_KEY")
    algorithm: str = Field(alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        ge=5, le=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    environment: str = Field(default="development", alias="ENVIRONMENT")
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    app_name: str = Field(default="Clínica Veterinaria Huellitas Felices", alias="APP_NAME")
    debug: bool = Field(default=False, alias="DEBUG")

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @model_validator(mode="after")
    def require_database_connection(self):
        if self.database_url:
            drivername = make_url(self.database_url).drivername
            if drivername not in {
                "sqlite",
                "sqlite+aiosqlite",
                "postgres",
                "postgresql",
                "postgresql+asyncpg",
                "postgresql+psycopg",
            }:
                raise ValueError("DATABASE_URL debe apuntar a PostgreSQL o SQLite")
            return self
        if not self.host.strip() or not self.user.strip() or not self.password:
            raise ValueError(
                "Configura DATABASE_URL o bien HOST, USER y PASSWORD para la base de datos"
            )
        return self

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            return value.lower() in (
                "true",
                "1",
                "yes",
                "on"
            )

        return bool(value)

    @field_validator("secret_key")
    @classmethod
    def reject_example_secret(cls, value: str) -> str:
        normalized = value.strip()
        if normalized.lower() in {
            "secret",
            "changeme",
            "change-me",
            "your-secret-key",
            "clave_secreta_super_segura_veterinaria_oyanguren_2026",
        }:
            raise ValueError("SECRET_KEY debe ser una clave aleatoria y privada")
        return normalized

    @field_validator("algorithm")
    @classmethod
    def restrict_algorithm(cls, value: str) -> str:
        if value != "HS256":
            raise ValueError("ALGORITHM debe ser HS256")
        return value

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        if self.database_url:
            url = self.database_url
        else:
            password = quote_plus(self.password)
            user = quote_plus(self.user)
            url = f"postgresql+asyncpg://{user}:{password}@{self.host}:{self.port}/{self.database}"
        return self._database_url_for_driver(url, asynchronous=True)

    @property
    def sync_database_url(self) -> str:
        if self.database_url:
            url = self.database_url
        else:
            password = quote_plus(self.password)
            user = quote_plus(self.user)
            url = f"postgresql+psycopg://{user}:{password}@{self.host}:{self.port}/{self.database}"
        return self._database_url_for_driver(url, asynchronous=False)

    @staticmethod
    def _database_url_for_driver(url: str, asynchronous: bool) -> str:
        parsed = make_url(url)
        if parsed.drivername.startswith("sqlite"):
            drivername = "sqlite+aiosqlite" if asynchronous else "sqlite"
            return parsed.set(drivername=drivername).render_as_string(hide_password=False)

        query = dict(parsed.query)
        sslmode = query.pop("sslmode", None)
        ssl = query.pop("ssl", None)
        if asynchronous:
            query["ssl"] = ssl or sslmode or "require"
            drivername = "postgresql+asyncpg"
        else:
            query["sslmode"] = sslmode or ssl or "require"
            drivername = "postgresql+psycopg"
        return parsed.set(drivername=drivername, query=query).render_as_string(
            hide_password=False
        )


settings = Settings()