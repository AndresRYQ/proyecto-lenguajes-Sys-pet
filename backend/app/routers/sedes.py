from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import CurrentUser, get_current_user, require_admin
from app.services import sede_service
from app.schemas.sede import SedeCreate, SedeResponse, SedeUpdate

router = APIRouter(prefix="/sedes", tags=["sedes"])


@router.get("/mia", response_model=SedeResponse)
async def mi_sede(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    sede = await sede_service.get_sede(db, current_user.sede_id)
    return sede


@router.get("", response_model=list[SedeResponse])
async def listar_sedes(
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await sede_service.get_sedes(db, include_inactive=True)


@router.post("", response_model=SedeResponse, status_code=201)
async def crear_sede(
    data: SedeCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await sede_service.create_sede(db, data)


@router.put("/{sede_id}", response_model=SedeResponse)
async def actualizar_sede(
    sede_id: int,
    data: SedeUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await sede_service.update_sede(db, sede_id, data)


class EstadoSede(BaseModel):
    activo: bool


@router.patch("/{sede_id}/estado", response_model=SedeResponse)
async def cambiar_estado_sede(
    sede_id: int,
    data: EstadoSede,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await sede_service.set_sede_activa(db, sede_id, data.activo)
