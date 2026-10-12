from pydantic import BaseModel, EmailStr


class ClienteBase(BaseModel):
    nombre: str
    telefono: str | None = None
    email: EmailStr | None = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None


class ClienteResponse(ClienteBase):
    id: int

    model_config = {"from_attributes": True}
