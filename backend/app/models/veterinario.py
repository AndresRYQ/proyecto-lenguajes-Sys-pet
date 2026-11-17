from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Veterinario(Base):
    __tablename__ = "veterinarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    especialidad = Column(String(100), nullable=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=False, index=True)
    activo = Column(Boolean, nullable=False, default=True, server_default="true")

    sede = relationship("Sede", back_populates="veterinarios")
    citas = relationship("Cita", back_populates="veterinario")
    historias_clinicas = relationship("HistoriaClinica", back_populates="veterinario")
