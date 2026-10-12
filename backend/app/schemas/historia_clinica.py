from datetime import date
from pydantic import BaseModel


class HistoriaClinicaBase(BaseModel):
    fecha: date
    diagnostico: str
    tratamiento: str | None = None
    mascota_id: int
    veterinario_id: int


class HistoriaClinicaCreate(HistoriaClinicaBase):
    pass


class HistoriaClinicaUpdate(BaseModel):
    diagnostico: str | None = None
    tratamiento: str | None = None


class HistoriaClinicaResponse(HistoriaClinicaBase):
    id: int

    model_config = {"from_attributes": True}
