import pytest
import jwt
from fastapi import HTTPException
from pydantic import ValidationError
from jwt.exceptions import InvalidTokenError

from app.auth.dependencies import CurrentUser, require_roles
from app.auth.jwt import create_access_token, decode_access_token
from app.config import Settings
from app.services.auth_service import hash_password, verify_password


def build_settings(**overrides):
    values = {
        "host": "db.example.invalid",
        "port": 5432,
        "database": "clinic",
        "user": "db-user",
        "password": "p@ss:/word",
        "secret_key": "test-only-secret-key-with-at-least-32-bytes",
        "algorithm": "HS256",
        "access_token_expire_minutes": 30,
        "environment": "testing",
        "cors_origins": "https://clinic.example,http://localhost:5173",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_database_urls_encode_password_and_use_distinct_drivers():
    settings = build_settings()

    assert "p%40ss%3A%2Fword" in settings.async_database_url
    assert settings.async_database_url.startswith("postgresql+asyncpg://")
    assert settings.async_database_url.endswith("?ssl=require")
    assert settings.sync_database_url.startswith("postgresql+psycopg://")
    assert settings.sync_database_url.endswith("?sslmode=require")
    assert settings.allowed_origins == [
        "https://clinic.example",
        "http://localhost:5173",
    ]


def test_full_database_url_does_not_require_individual_credentials():
    settings = Settings(
        _env_file=None,
        database_url="sqlite:///./test.db",
        secret_key="test-only-secret-key-with-at-least-32-bytes",
        algorithm="HS256",
        access_token_expire_minutes=30,
    )

    assert settings.async_database_url == "sqlite+aiosqlite:///./test.db"
    assert settings.sync_database_url == "sqlite:///./test.db"


def test_postgres_database_url_translates_ssl_options_for_each_driver():
    settings = build_settings(
        database_url=(
            "postgresql://db-user:db-password@db.example.invalid:5432/clinic"
            "?sslmode=require"
        )
    )

    assert settings.async_database_url.startswith("postgresql+asyncpg://")
    assert settings.async_database_url.endswith("?ssl=require")
    assert settings.sync_database_url.startswith("postgresql+psycopg://")
    assert settings.sync_database_url.endswith("?sslmode=require")


def test_rejects_known_jwt_secret_and_invalid_expiry():
    with pytest.raises(ValidationError):
        build_settings(secret_key="clave_secreta_super_segura_veterinaria_oyanguren_2026")
    with pytest.raises(ValidationError):
        build_settings(access_token_expire_minutes=0)


def test_password_hashing_verifies_without_storing_plaintext():
    encoded = hash_password("strong-test-password")
    assert encoded != "strong-test-password"
    assert verify_password("strong-test-password", encoded)
    assert not verify_password("wrong-password", encoded)


def test_jwt_requires_the_configured_algorithm():
    token = create_access_token({"sub": "1"})
    assert decode_access_token(token)["sub"] == "1"

    forged_algorithm_token = jwt.encode(
        {"sub": "1"},
        "test-only-secret-key-with-at-least-48-bytes-for-hs384",
        algorithm="HS384",
    )
    with pytest.raises(InvalidTokenError):
        decode_access_token(forged_algorithm_token)


@pytest.mark.asyncio
async def test_role_guard_rejects_forbidden_roles():
    guard = require_roles("admin")
    user = CurrentUser(
        id=1,
        email="reception@example.invalid",
        nombre="Reception",
        rol="recepcionista",
        sede_id=1,
    )

    with pytest.raises(HTTPException) as error:
        await guard(user)

    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_role_guard_requires_password_change_first():
    guard = require_roles("admin")
    user = CurrentUser(
        id=1,
        email="admin@example.invalid",
        nombre="Admin",
        rol="admin",
        sede_id=1,
        debe_cambiar_password=True,
    )

    with pytest.raises(HTTPException) as error:
        await guard(user)

    assert error.value.status_code == 428
