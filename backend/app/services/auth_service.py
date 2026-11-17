import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.usuario import Usuario


def verify_password(plain: str, hashed: str) -> bool:
    encoded = plain.encode("utf-8")
    return len(encoded) <= 72 and bcrypt.checkpw(encoded, hashed.encode())


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        raise ValueError("La contraseña no puede superar 72 bytes")
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Usuario | None:
    result = await db.execute(select(Usuario).where(Usuario.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user or not user.activo or not verify_password(password, user.password_hash):
        return None
    return user
