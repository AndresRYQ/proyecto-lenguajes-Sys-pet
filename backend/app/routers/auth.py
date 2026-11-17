from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field, field_validator
from app.database.session import get_db
from app.services.auth_service import authenticate_user, hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.dependencies import CurrentUser, get_current_user
from app.models.usuario import Usuario
from sqlalchemy import select
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("app.auth")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    nombre: str
    rol: str
    sede_id: int
    debe_cambiar_password: bool


class PasswordChange(BaseModel):
    current_password: str = Field(default="", max_length=72)
    new_password: str = Field(min_length=12, max_length=72)

    @field_validator("current_password", "new_password")
    @classmethod
    def limit_bcrypt_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form.username, form.password)
    if not user:
        logger.warning("auth.login.failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.id)})
    logger.info("auth.login.success user_id=%s", user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        nombre=user.nombre,
        rol=user.rol.value,
        sede_id=user.sede_id,
        debe_cambiar_password=user.debe_cambiar_password,
    )


@router.get("/me")
async def me(current_user: CurrentUser = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.id == current_user.id))
    user = result.scalar_one()
    if not user.debe_cambiar_password and not verify_password(
        data.current_password, user.password_hash
    ):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe ser diferente")
    user.password_hash = hash_password(data.new_password)
    user.debe_cambiar_password = False
    await db.commit()
    return {"message": "Contraseña actualizada"}
