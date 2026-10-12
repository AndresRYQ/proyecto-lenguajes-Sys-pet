from datetime import date
from pydantic import BaseModel


class AtencionBase(BaseModel):
    fecha: date
    observaciones: str | None = None
    cita_id: int


class AtencionCreate(AtencionBase):
    pass


class AtencionUpdate(BaseModel):
    observaciones: str | None = None


class AtencionResponse(AtencionBase):
    id: int

    model_config = {"from_attributes": True}
