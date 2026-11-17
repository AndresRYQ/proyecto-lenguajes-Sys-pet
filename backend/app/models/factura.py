from sqlalchemy import Boolean, Column, Integer, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Factura(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    total = Column(Numeric(10, 2), nullable=False)
    cita_id = Column(Integer, ForeignKey("citas.id"), nullable=False, unique=True)
    anulada = Column(Boolean, nullable=False, default=False, server_default="false")

    cita = relationship("Cita", back_populates="factura")
