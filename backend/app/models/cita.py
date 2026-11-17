from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from app.database.engine import Base
import enum


class EstadoCita(str, enum.Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    en_atencion = "en_atencion"
    finalizada = "finalizada"
    cancelada = "cancelada"


class Prioridad(str, enum.Enum):
    baja = "baja"
    media = "media"
    alta = "alta"


class Cita(Base):
    __tablename__ = "citas"
    __table_args__ = (
        Index("ix_citas_sede_fecha_estado", "sede_id", "fecha", "estado"),
        Index("ix_citas_veterinario_fecha_hora", "veterinario_id", "fecha", "hora"),
    )

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    hora = Column(Time, nullable=False)
    estado = Column(
        Enum(EstadoCita), nullable=False, default=EstadoCita.pendiente, index=True
    )
    motivo = Column(String(300), nullable=True)
    prioridad = Column(Enum(Prioridad), nullable=False, default=Prioridad.media)
    mascota_id = Column(Integer, ForeignKey("mascotas.id"), nullable=False, index=True)
    veterinario_id = Column(Integer, ForeignKey("veterinarios.id"), nullable=False)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=False)

    mascota = relationship("Mascota", back_populates="citas")
    veterinario = relationship("Veterinario", back_populates="citas")
    sede = relationship("Sede", back_populates="citas")
    factura = relationship("Factura", back_populates="cita", uselist=False)
    atencion = relationship("Atencion", back_populates="cita", uselist=False)
