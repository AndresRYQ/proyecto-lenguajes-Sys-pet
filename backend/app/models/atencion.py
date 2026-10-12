from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.engine import Base


class Atencion(Base):
    __tablename__ = "atenciones"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    observaciones = Column(Text, nullable=True)
    cita_id = Column(Integer, ForeignKey("citas.id"), nullable=False, unique=True)

    cita = relationship("Cita", back_populates="atencion")
