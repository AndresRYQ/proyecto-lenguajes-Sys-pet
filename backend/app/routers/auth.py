from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database.session import get_db
from app.services.auth_service import authenticate_user
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    nombre: str
    rol: str
    sede_id: int


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "nombre": user.nombre,
        "rol": user.rol.value,
        "sede_id": str(user.sede_id),
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        nombre=user.nombre,
        rol=user.rol.value,
        sede_id=user.sede_id,
    )
