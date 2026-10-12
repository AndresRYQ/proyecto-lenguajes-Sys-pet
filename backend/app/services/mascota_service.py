from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.mascota import Mascota
from app.schemas.mascota import MascotaCreate, MascotaUpdate


async def get_mascotas_by_cliente(db: AsyncSession, cliente_id: int) -> list[Mascota]:
    result = await db.execute(
        select(Mascota).where(Mascota.cliente_id == cliente_id).order_by(Mascota.nombre)
    )
    return list(result.scalars().all())


async def get_mascota(db: AsyncSession, mascota_id: int) -> Mascota:
    result = await db.execute(select(Mascota).where(Mascota.id == mascota_id))
    mascota = result.scalar_one_or_none()
    if not mascota:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return mascota


async def create_mascota(db: AsyncSession, data: MascotaCreate) -> Mascota:
    mascota = Mascota(**data.model_dump())
    db.add(mascota)
    await db.commit()
    await db.refresh(mascota)
    return mascota


async def update_mascota(db: AsyncSession, mascota_id: int, data: MascotaUpdate) -> Mascota:
    mascota = await get_mascota(db, mascota_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(mascota, field, value)
    await db.commit()
    await db.refresh(mascota)
    return mascota
