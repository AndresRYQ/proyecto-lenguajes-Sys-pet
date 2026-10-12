from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sede import Sede


async def get_sedes(db: AsyncSession) -> list[Sede]:
    result = await db.execute(select(Sede).order_by(Sede.nombre))
    return list(result.scalars().all())
