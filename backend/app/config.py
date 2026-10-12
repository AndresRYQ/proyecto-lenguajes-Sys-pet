from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base de datos
    database_url: str = "sqlite+aiosqlite:///./veterinaria.db"

    # JWT
    secret_key: str = "clave_secreta_super_segura_veterinaria_oyanguren_2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # App
    app_name: str = "Veterinaria Oyanguren"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
