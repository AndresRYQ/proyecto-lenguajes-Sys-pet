from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field


class FacturaBase(BaseModel):
    fecha: date
    total: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    cita_id: int = Field(gt=0)


class FacturaCreate(FacturaBase):
    pass


class FacturaUpdate(BaseModel):
    total: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)


class FacturaResponse(FacturaBase):
    id: int
    anulada: bool

    model_config = {"from_attributes": True}
