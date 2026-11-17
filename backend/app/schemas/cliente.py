from pydantic import BaseModel, EmailStr, Field, field_validator


class ClienteBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    telefono: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    dni: str | None = Field(default=None, pattern=r"^\d{8}$")


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    telefono: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    dni: str | None = Field(default=None, pattern=r"^\d{8}$")


class ClienteResponse(ClienteBase):
    id: int

    model_config = {"from_attributes": True}
