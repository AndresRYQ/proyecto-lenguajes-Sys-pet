import os


os.environ.update(
    {
        "HOST": "localhost",
        "DB_PORT": "5432",
        "DATABASE": "test_db",
        "USER": "test_user",
        "PASSWORD": "test-password",
        "SECRET_KEY": "test-only-secret-key-with-at-least-32-bytes",
        "ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
        "ENVIRONMENT": "testing",
        "CORS_ORIGINS": "http://localhost:5173",
    }
)
