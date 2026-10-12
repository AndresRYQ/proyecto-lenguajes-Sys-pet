from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, CurrentUser, get_sede_filtro
from app.services import veterinario_service
from app.schemas.veterinario import VeterinarioCreate, VeterinarioUpdate, VeterinarioResponse

router = APIRouter(prefix="/veterinarios", tags=["veterinarios"])


@router.get("", response_model=list[VeterinarioResponse])
async def listar_veterinarios(
    sede_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    filtro_sede = get_sede_filtro(sede_id, current_user)
    return await veterinario_service.get_veterinarios(db, filtro_sede)


@router.post("", response_model=VeterinarioResponse, status_code=201)
async def crear_veterinario(
    data: VeterinarioCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    return await veterinario_service.create_veterinario(db, data)


@router.put("/{vet_id}", response_model=VeterinarioResponse)
async def actualizar_veterinario(
    vet_id: int,
    data: VeterinarioUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    return await veterinario_service.update_veterinario(db, vet_id, data)
