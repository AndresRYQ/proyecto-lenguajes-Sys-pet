from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt import decode_access_token
from app.database.session import get_db
from app.models.usuario import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class CurrentUser(BaseModel):
    id: int
    email: str
    nombre: str
    rol: str
    sede_id: int
    activo: bool = True
    debe_cambiar_password: bool = False


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
        result = await db.execute(select(Usuario).where(Usuario.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.activo:
            raise exc
        return CurrentUser(
            id=user.id,
            email=user.email,
            nombre=user.nombre,
            rol=user.rol.value,
            sede_id=user.sede_id,
            activo=user.activo,
            debe_cambiar_password=user.debe_cambiar_password,
        )
    except (InvalidTokenError, KeyError, ValueError):
        raise exc


def require_roles(*roles: str):
    async def role_guard(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if current_user.debe_cambiar_password:
            raise HTTPException(
                status_code=428,
                detail="Debes cambiar tu contraseña antes de continuar",
                headers={"X-Password-Change-Required": "true"},
            )
        if current_user.rol not in roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta operación")
        return current_user

    return role_guard


require_admin = require_roles("admin")


def get_sede_filtro(sede_id: int | None, current_user: CurrentUser) -> int | None:
    if current_user.rol == "admin":
        return sede_id
    return current_user.sede_id
