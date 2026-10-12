from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.historia_clinica import HistoriaClinica
from app.models.veterinario import Veterinario
from app.schemas.historia_clinica import HistoriaClinicaCreate


async def get_historial_by_mascota(db: AsyncSession, mascota_id: int) -> list[HistoriaClinica]:
    q = (
        select(HistoriaClinica)
        .options(selectinload(HistoriaClinica.veterinario))
        .where(HistoriaClinica.mascota_id == mascota_id)
        .order_by(HistoriaClinica.fecha.desc())
    )
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_historia(db: AsyncSession, historia_id: int) -> HistoriaClinica:
    result = await db.execute(select(HistoriaClinica).where(HistoriaClinica.id == historia_id))
    historia = result.scalar_one_or_none()
    if not historia:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    return historia


async def create_historia(db: AsyncSession, data: HistoriaClinicaCreate) -> HistoriaClinica:
    historia = HistoriaClinica(**data.model_dump())
    db.add(historia)
    await db.commit()
    await db.refresh(historia)
    return historia
