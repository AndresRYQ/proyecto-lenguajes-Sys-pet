from urllib.parse import quote_plus
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # PostgreSQL / Supabase
    host: str = Field(
        default="aws-0-us-east-1.pooler.supabase.com",
        alias="HOST"
    )

    port: int = Field(
        default=5432,
        alias="PORT"
    )

    database: str = Field(
        default="postgres",
        alias="DATABASE"
    )

    user: str = Field(
        default="postgres.kjudticyywskfteezcog",
        alias="USER"
    )

    password: str = Field(
        default="",
        alias="PASSWORD"
    )

    # JWT
    secret_key: str = Field(
        default="clave_secreta_super_segura_veterinaria_oyanguren_2026",
        alias="SECRET_KEY"
    )

    algorithm: str = Field(
        default="HS256",
        alias="ALGORITHM"
    )

    access_token_expire_minutes: int = Field(
        default=60,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    # App
    app_name: str = Field(
        default="Veterinaria Oyanguren",
        alias="APP_NAME"
    )

    debug: bool = Field(
        default=False,
        alias="DEBUG"
    )

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True
        extra = "ignore"

    @property
    def async_database_url(self) -> str:
        password = quote_plus(self.password)

        return (
            f"postgresql+asyncpg://"
            f"{self.user}:{password}"
            f"@{self.host}:{self.port}/{self.database}"
        )

    @property
    def sync_database_url(self) -> str:
        password = quote_plus(self.password)

        return (
            f"postgresql+psycopg://"
            f"{self.user}:{password}"
            f"@{self.host}:{self.port}/{self.database}"
        )


settings = Settings()