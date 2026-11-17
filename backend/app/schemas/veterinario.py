from pydantic import BaseModel, Field


class VeterinarioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    especialidad: str | None = Field(default=None, max_length=100)
    sede_id: int = Field(gt=0)


class VeterinarioCreate(VeterinarioBase):
    pass


class VeterinarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    especialidad: str | None = Field(default=None, max_length=100)
    sede_id: int | None = Field(default=None, gt=0)
    activo: bool | None = None


class VeterinarioResponse(VeterinarioBase):
    id: int
    activo: bool

    model_config = {"from_attributes": True}
