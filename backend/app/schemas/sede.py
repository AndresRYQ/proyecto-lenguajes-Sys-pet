from pydantic import BaseModel


class SedeBase(BaseModel):
    nombre: str
    direccion: str


class SedeCreate(SedeBase):
    pass


class SedeUpdate(BaseModel):
    nombre: str | None = None
    direccion: str | None = None


class SedeResponse(SedeBase):
    id: int

    model_config = {"from_attributes": True}
