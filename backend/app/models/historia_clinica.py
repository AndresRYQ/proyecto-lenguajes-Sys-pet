from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.engine import Base


class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    diagnostico = Column(Text, nullable=False)
    tratamiento = Column(Text, nullable=True)
    mascota_id = Column(Integer, ForeignKey("mascotas.id"), nullable=False)
    veterinario_id = Column(Integer, ForeignKey("veterinarios.id"), nullable=False)

    mascota = relationship("Mascota", back_populates="historias_clinicas")
    veterinario = relationship("Veterinario", back_populates="historias_clinicas")
