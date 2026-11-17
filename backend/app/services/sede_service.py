from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.sede import Sede
from app.schemas.sede import SedeCreate, SedeUpdate


async def get_sedes(db: AsyncSession, include_inactive: bool = False) -> list[Sede]:
    q = select(Sede)
    if not include_inactive:
        q = q.where(Sede.activo.is_(True))
    result = await db.execute(q.order_by(Sede.nombre))
    return list(result.scalars().all())


async def get_sede(db: AsyncSession, sede_id: int) -> Sede:
    result = await db.execute(
        select(Sede).where(Sede.id == sede_id, Sede.activo.is_(True))
    )
    sede = result.scalar_one_or_none()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    return sede


async def create_sede(db: AsyncSession, data: SedeCreate) -> Sede:
    existing = await db.execute(select(Sede.id).where(Sede.nombre == data.nombre.strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe una sede con ese nombre")
    sede = Sede(nombre=data.nombre.strip(), direccion=data.direccion.strip())
    db.add(sede)
    await db.commit()
    await db.refresh(sede)
    return sede


async def update_sede(db: AsyncSession, sede_id: int, data: SedeUpdate) -> Sede:
    result = await db.execute(select(Sede).where(Sede.id == sede_id))
    sede = result.scalar_one_or_none()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    updates = data.model_dump(exclude_unset=True)
    if updates.get("nombre") and updates["nombre"].strip() != sede.nombre:
        duplicate = await db.execute(
            select(Sede.id).where(Sede.nombre == updates["nombre"].strip(), Sede.id != sede_id)
        )
        if duplicate.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ya existe una sede con ese nombre")
    for field, value in updates.items():
        if value is not None:
            setattr(sede, field, value.strip())
    await db.commit()
    await db.refresh(sede)
    return sede


async def set_sede_activa(db: AsyncSession, sede_id: int, activo: bool) -> Sede:
    result = await db.execute(select(Sede).where(Sede.id == sede_id))
    sede = result.scalar_one_or_none()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    sede.activo = activo
    await db.commit()
    await db.refresh(sede)
    return sede
