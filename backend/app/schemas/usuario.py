from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.usuario import Rol


class UsuarioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    rol: Rol
    sede_id: int


class UsuarioCreate(UsuarioBase):
    password: str = Field(min_length=12, max_length=72)

    @field_validator("password")
    @classmethod
    def limit_bcrypt_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    rol: Rol | None = None
    sede_id: int | None = Field(default=None, gt=0)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        return value.lower() if value else value


class PasswordReset(BaseModel):
    password: str = Field(min_length=12, max_length=72)

    @field_validator("password")
    @classmethod
    def limit_bcrypt_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value


class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    debe_cambiar_password: bool

    model_config = {"from_attributes": True}
