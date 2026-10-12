from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class FacturaBase(BaseModel):
    fecha: date
    total: Decimal
    cita_id: int


class FacturaCreate(FacturaBase):
    pass


class FacturaUpdate(BaseModel):
    total: Decimal | None = None


class FacturaResponse(FacturaBase):
    id: int

    model_config = {"from_attributes": True}
