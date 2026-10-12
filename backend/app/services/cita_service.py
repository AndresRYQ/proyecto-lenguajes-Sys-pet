from datetime import time, date
from sqlalchemy import select, and_, case
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.cita import Cita, EstadoCita, Prioridad
from app.models.veterinario import Veterinario
from app.models.mascota import Mascota
from app.schemas.cita import CitaCreate, CitaUpdate

HORA_INICIO = time(8, 0)
HORA_FIN = time(20, 0)


def _opciones_carga():
    return [
        selectinload(Cita.mascota).selectinload(Mascota.cliente),
        selectinload(Cita.veterinario),
        selectinload(Cita.sede),
    ]


async def get_citas(
    db: AsyncSession,
    sede_id: int | None = None,
    fecha: date | None = None,
    estado: str | None = None,
    veterinario_id: int | None = None,
) -> list[Cita]:
    q = select(Cita).options(*_opciones_carga())
    filtros = []
    if sede_id is not None:
        filtros.append(Cita.sede_id == sede_id)
    if fecha is not None:
        filtros.append(Cita.fecha == fecha)
    if estado is not None:
        filtros.append(Cita.estado == estado)
    if veterinario_id is not None:
        filtros.append(Cita.veterinario_id == veterinario_id)
    if filtros:
        q = q.where(and_(*filtros))
    q = q.order_by(Cita.fecha, Cita.hora)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_cita(db: AsyncSession, cita_id: int) -> Cita:
    q = select(Cita).options(*_opciones_carga()).where(Cita.id == cita_id)
    result = await db.execute(q)
    cita = result.scalar_one_or_none()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita


async def _validar_horario(hora: time) -> None:
    if not (HORA_INICIO <= hora <= HORA_FIN):
        raise HTTPException(
            status_code=400,
            detail="La cita debe estar dentro del horario laboral (08:00 - 20:00)",
        )


async def _validar_disponibilidad(
    db: AsyncSession,
    vet_id: int,
    fecha: date,
    hora: time,
    exclude_id: int | None = None,
) -> None:
    q = select(Cita).where(
        Cita.veterinario_id == vet_id,
        Cita.fecha == fecha,
        Cita.hora == hora,
        Cita.estado != EstadoCita.cancelada,
    )
    if exclude_id:
        q = q.where(Cita.id != exclude_id)
    result = await db.execute(q)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El veterinario ya tiene una cita en ese horario")


async def _validar_sede_veterinario(db: AsyncSession, vet_id: int, sede_id: int) -> None:
    result = await db.execute(select(Veterinario).where(Veterinario.id == vet_id))
    vet = result.scalar_one_or_none()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    if vet.sede_id != sede_id:
        raise HTTPException(status_code=400, detail="El veterinario no pertenece a la sede indicada")


async def create_cita(db: AsyncSession, data: CitaCreate) -> Cita:
    await _validar_horario(data.hora)
    await _validar_disponibilidad(db, data.veterinario_id, data.fecha, data.hora)
    await _validar_sede_veterinario(db, data.veterinario_id, data.sede_id)
    cita = Cita(**data.model_dump())
    db.add(cita)
    await db.commit()
    await db.refresh(cita)
    return await get_cita(db, cita.id)


async def update_cita(db: AsyncSession, cita_id: int, data: CitaUpdate) -> Cita:
    cita = await get_cita(db, cita_id)
    update_data = data.model_dump(exclude_unset=True)
    nueva_hora = update_data.get("hora", cita.hora)
    nueva_fecha = update_data.get("fecha", cita.fecha)
    nuevo_vet = update_data.get("veterinario_id", cita.veterinario_id)
    if "hora" in update_data or "fecha" in update_data:
        await _validar_horario(nueva_hora)
    if "hora" in update_data or "fecha" in update_data or "veterinario_id" in update_data:
        await _validar_disponibilidad(db, nuevo_vet, nueva_fecha, nueva_hora, exclude_id=cita_id)
    for field, value in update_data.items():
        setattr(cita, field, value)
    await db.commit()
    return await get_cita(db, cita_id)


async def cambiar_estado(db: AsyncSession, cita_id: int, estado: EstadoCita) -> Cita:
    cita = await get_cita(db, cita_id)
    cita.estado = estado
    await db.commit()
    return await get_cita(db, cita_id)


async def get_cola_emergencias(db: AsyncSession, sede_id: int, fecha: date) -> list[Cita]:
    priority_order = case(
        (Cita.prioridad == Prioridad.alta, 1),
        (Cita.prioridad == Prioridad.media, 2),
        (Cita.prioridad == Prioridad.baja, 3),
        else_=4,
    )
    q = (
        select(Cita)
        .options(*_opciones_carga())
        .where(
            Cita.sede_id == sede_id,
            Cita.fecha == fecha,
            Cita.estado != EstadoCita.cancelada,
            Cita.estado != EstadoCita.finalizada,
        )
        .order_by(priority_order, Cita.hora)
    )
    result = await db.execute(q)
    return list(result.scalars().all())
