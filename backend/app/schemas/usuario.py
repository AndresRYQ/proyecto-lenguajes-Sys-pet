from pydantic import BaseModel, EmailStr
from app.models.usuario import Rol


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: Rol
    sede_id: int


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    email: EmailStr | None = None
    rol: Rol | None = None
    sede_id: int | None = None


class UsuarioResponse(UsuarioBase):
    id: int

    model_config = {"from_attributes": True}
