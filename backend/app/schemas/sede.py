from pydantic import BaseModel, Field


class SedeBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    direccion: str = Field(min_length=4, max_length=200)


class SedeCreate(SedeBase):
    pass


class SedeUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=50)
    direccion: str | None = Field(default=None, min_length=4, max_length=200)


class SedeResponse(SedeBase):
    id: int
    activo: bool

    model_config = {"from_attributes": True}
