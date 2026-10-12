from pydantic import BaseModel


class VeterinarioBase(BaseModel):
    nombre: str
    especialidad: str | None = None
    sede_id: int


class VeterinarioCreate(VeterinarioBase):
    pass


class VeterinarioUpdate(BaseModel):
    nombre: str | None = None
    especialidad: str | None = None
    sede_id: int | None = None


class VeterinarioResponse(VeterinarioBase):
    id: int

    model_config = {"from_attributes": True}
