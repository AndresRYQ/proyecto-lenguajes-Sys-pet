from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Mascota(Base):
    __tablename__ = "mascotas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    especie = Column(String(50), nullable=False)
    raza = Column(String(100), nullable=True)
    edad = Column(Integer, nullable=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="mascotas")
    citas = relationship("Cita", back_populates="mascota")
    historias_clinicas = relationship("HistoriaClinica", back_populates="mascota")
