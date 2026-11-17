from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cita import Cita
from app.models.factura import Factura
from app.schemas.factura import FacturaCreate, FacturaUpdate


async def listar_facturas(
    db: AsyncSession, offset: int = 0, limit: int = 50, sede_id: int | None = None
) -> list[Factura]:
    query = select(Factura).join(Cita).order_by(Factura.fecha.desc(), Factura.id.desc())
    if sede_id is not None:
        query = query.where(Cita.sede_id == sede_id)
    result = await db.execute(
        query
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def crear_factura(
    db: AsyncSession, data: FacturaCreate, sede_id: int | None = None
) -> Factura:
    cita_result = await db.execute(select(Cita.id).where(Cita.id == data.cita_id))
    if cita_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if sede_id is not None:
        cita = await db.execute(
            select(Cita.id).where(Cita.id == data.cita_id, Cita.sede_id == sede_id)
        )
        if cita.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
    existing = await db.execute(select(Factura.id).where(Factura.cita_id == data.cita_id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="La cita ya tiene una factura")
    factura = Factura(**data.model_dump())
    db.add(factura)
    await db.commit()
    await db.refresh(factura)
    return factura


async def actualizar_factura(db: AsyncSession, factura_id: int, data: FacturaUpdate) -> Factura:
    factura = await obtener_factura(db, factura_id)
    if factura.anulada:
        raise HTTPException(status_code=409, detail="No se puede modificar una factura anulada")
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(factura, field, value)
    await db.commit()
    await db.refresh(factura)
    return factura


async def obtener_factura(db: AsyncSession, factura_id: int) -> Factura:
    result = await db.execute(select(Factura).where(Factura.id == factura_id))
    factura = result.scalar_one_or_none()
    if factura is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return factura


async def anular_factura(db: AsyncSession, factura_id: int) -> Factura:
    factura = await obtener_factura(db, factura_id)
    factura.anulada = True
    await db.commit()
    await db.refresh(factura)
    return factura
