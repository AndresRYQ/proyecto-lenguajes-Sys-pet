from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import BaseModel
from app.auth.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class CurrentUser(BaseModel):
    id: int
    email: str
    nombre: str
    rol: str
    sede_id: int


async def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        return CurrentUser(
            id=int(payload["sub"]),
            email=payload["email"],
            nombre=payload["nombre"],
            rol=payload["rol"],
            sede_id=int(payload["sede_id"]),
        )
    except (JWTError, KeyError, ValueError):
        raise exc


def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso restringido a administradores")
    return current_user


def get_sede_filtro(sede_id: int | None, current_user: CurrentUser) -> int | None:
    if current_user.rol == "admin":
        return sede_id
    return current_user.sede_id
