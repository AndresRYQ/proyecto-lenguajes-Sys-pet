from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database.session import get_db
from app.auth.dependencies import get_current_user, CurrentUser, get_sede_filtro
from app.services import cita_service
from app.schemas.cita import CitaCreate, CitaUpdate, CitaResponse
from app.models.cita import EstadoCita

router = APIRouter(prefix="/citas", tags=["citas"])


class CitaFullResponse(CitaResponse):
    mascota_nombre: str | None = None
    veterinario_nombre: str | None = None
    sede_nombre: str | None = None
    cliente_nombre: str | None = None
    cliente_id: int | None = None

    model_config = {"from_attributes": True}


def _enriquecer(cita) -> dict:
    d = {c.key: getattr(cita, c.key) for c in cita.__table__.columns}
    if cita.mascota:
        d["mascota_nombre"] = cita.mascota.nombre
        if cita.mascota.cliente:
            d["cliente_nombre"] = cita.mascota.cliente.nombre
            d["cliente_id"] = cita.mascota.cliente.id
    if cita.veterinario:
        d["veterinario_nombre"] = cita.veterinario.nombre
    if cita.sede:
        d["sede_nombre"] = cita.sede.nombre
    return d


@router.get("", response_model=list[CitaFullResponse])
async def listar_citas(
    sede_id: int | None = Query(None),
    fecha: date | None = Query(None),
    estado: str | None = Query(None),
    veterinario_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    filtro_sede = get_sede_filtro(sede_id, current_user)
    citas = await cita_service.get_citas(db, filtro_sede, fecha, estado, veterinario_id)
    return [_enriquecer(c) for c in citas]


@router.post("", response_model=CitaFullResponse, status_code=201)
async def crear_cita(
    data: CitaCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    cita = await cita_service.create_cita(db, data)
    return _enriquecer(cita)


@router.get("/{cita_id}", response_model=CitaFullResponse)
async def obtener_cita(
    cita_id: int,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    cita = await cita_service.get_cita(db, cita_id)
    return _enriquecer(cita)


@router.put("/{cita_id}", response_model=CitaFullResponse)
async def actualizar_cita(
    cita_id: int,
    data: CitaUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    cita = await cita_service.update_cita(db, cita_id, data)
    return _enriquecer(cita)


class EstadoBody(BaseModel):
    estado: EstadoCita


@router.patch("/{cita_id}/estado", response_model=CitaFullResponse)
async def cambiar_estado(
    cita_id: int,
    body: EstadoBody,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    cita = await cita_service.cambiar_estado(db, cita_id, body.estado)
    return _enriquecer(cita)
