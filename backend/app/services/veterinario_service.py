from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.veterinario import Veterinario
from app.schemas.veterinario import VeterinarioCreate, VeterinarioUpdate


async def get_veterinarios(
    db: AsyncSession, sede_id: int | None = None, include_inactive: bool = False
) -> list[Veterinario]:
    q = select(Veterinario)
    if not include_inactive:
        q = q.where(Veterinario.activo.is_(True))
    if sede_id is not None:
        q = q.where(Veterinario.sede_id == sede_id)
    q = q.order_by(Veterinario.nombre)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_veterinario(db: AsyncSession, vet_id: int) -> Veterinario:
    result = await db.execute(select(Veterinario).where(Veterinario.id == vet_id))
    vet = result.scalar_one_or_none()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    return vet


async def create_veterinario(db: AsyncSession, data: VeterinarioCreate) -> Veterinario:
    vet = Veterinario(**data.model_dump())
    db.add(vet)
    await db.commit()
    await db.refresh(vet)
    return vet


async def update_veterinario(db: AsyncSession, vet_id: int, data: VeterinarioUpdate) -> Veterinario:
    vet = await get_veterinario(db, vet_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vet, field, value)
    await db.commit()
    await db.refresh(vet)
    return vet


async def pertenece_a_sede(db: AsyncSession, vet_id: int, sede_id: int) -> bool:
    result = await db.execute(
        select(Veterinario.id).where(
            Veterinario.id == vet_id,
            Veterinario.sede_id == sede_id,
            Veterinario.activo.is_(True),
        )
    )
    return result.scalar_one_or_none() is not None
