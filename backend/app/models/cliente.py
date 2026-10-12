from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True, unique=True, index=True)

    mascotas = relationship("Mascota", back_populates="cliente")
