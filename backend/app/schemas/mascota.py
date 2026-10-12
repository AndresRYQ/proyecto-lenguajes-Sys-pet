from pydantic import BaseModel


class MascotaBase(BaseModel):
    nombre: str
    especie: str
    raza: str | None = None
    edad: int | None = None
    cliente_id: int


class MascotaCreate(MascotaBase):
    pass


class MascotaUpdate(BaseModel):
    nombre: str | None = None
    especie: str | None = None
    raza: str | None = None
    edad: int | None = None


class MascotaResponse(MascotaBase):
    id: int

    model_config = {"from_attributes": True}
