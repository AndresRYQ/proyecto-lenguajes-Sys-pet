from datetime import date, time
from pydantic import BaseModel
from app.models.cita import EstadoCita, Prioridad


class CitaBase(BaseModel):
    fecha: date
    hora: time
    motivo: str | None = None
    prioridad: Prioridad = Prioridad.media
    mascota_id: int
    veterinario_id: int
    sede_id: int


class CitaCreate(CitaBase):
    pass


class CitaUpdate(BaseModel):
    fecha: date | None = None
    hora: time | None = None
    motivo: str | None = None
    estado: EstadoCita | None = None
    prioridad: Prioridad | None = None
    veterinario_id: int | None = None


class CitaResponse(CitaBase):
    id: int
    estado: EstadoCita

    model_config = {"from_attributes": True}
