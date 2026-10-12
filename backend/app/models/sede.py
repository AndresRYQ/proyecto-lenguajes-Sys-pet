from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Sede(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)  # "San Luis" | "Surquillo"
    direccion = Column(String(200), nullable=False)

    usuarios = relationship("Usuario", back_populates="sede")
    veterinarios = relationship("Veterinario", back_populates="sede")
    citas = relationship("Cita", back_populates="sede")
