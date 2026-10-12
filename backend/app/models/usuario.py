from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database.engine import Base
import enum


class Rol(str, enum.Enum):
    admin = "admin"
    recepcionista = "recepcionista"
    veterinario = "veterinario"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(Rol), nullable=False)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=False)

    sede = relationship("Sede", back_populates="usuarios")
