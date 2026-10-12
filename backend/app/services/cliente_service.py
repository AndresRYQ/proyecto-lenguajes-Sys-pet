from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.cliente import Cliente
from app.models.mascota import Mascota
from app.schemas.cliente import ClienteCreate, ClienteUpdate


async def get_clientes(db: AsyncSession, search: str | None = None) -> list[Cliente]:
    q = select(Cliente)
    if search:
        term = f"%{search}%"
        q = q.where(or_(Cliente.nombre.ilike(term), Cliente.telefono.ilike(term), Cliente.email.ilike(term)))
    q = q.order_by(Cliente.nombre)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_cliente(db: AsyncSession, cliente_id: int) -> Cliente:
    q = select(Cliente).options(selectinload(Cliente.mascotas)).where(Cliente.id == cliente_id)
    result = await db.execute(q)
    cliente = result.scalar_one_or_none()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


async def create_cliente(db: AsyncSession, data: ClienteCreate) -> Cliente:
    if data.email:
        existing = await db.execute(select(Cliente).where(Cliente.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un cliente con ese email")
    cliente = Cliente(**data.model_dump())
    db.add(cliente)
    await db.commit()
    await db.refresh(cliente)
    return cliente


async def update_cliente(db: AsyncSession, cliente_id: int, data: ClienteUpdate) -> Cliente:
    cliente = await get_cliente(db, cliente_id)
    update_data = data.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        existing = await db.execute(
            select(Cliente).where(Cliente.email == update_data["email"], Cliente.id != cliente_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un cliente con ese email")
    for field, value in update_data.items():
        setattr(cliente, field, value)
    await db.commit()
    await db.refresh(cliente)
    return cliente
