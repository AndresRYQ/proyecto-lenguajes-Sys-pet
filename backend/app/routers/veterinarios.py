from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import CurrentUser, get_sede_filtro, require_roles
from app.services import veterinario_service
from app.schemas.veterinario import VeterinarioCreate, VeterinarioUpdate, VeterinarioResponse

router = APIRouter(prefix="/veterinarios", tags=["veterinarios"])


@router.get("", response_model=list[VeterinarioResponse])
async def listar_veterinarios(
    sede_id: int | None = Query(None),
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    filtro_sede = get_sede_filtro(sede_id, current_user)
    if current_user.rol != "admin":
        filtro_sede = current_user.sede_id
    return await veterinario_service.get_veterinarios(
        db, filtro_sede, include_inactive and current_user.rol == "admin"
    )


@router.post("", response_model=VeterinarioResponse, status_code=201)
async def crear_veterinario(
    data: VeterinarioCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin")),
):
    return await veterinario_service.create_veterinario(db, data)


@router.put("/{vet_id}", response_model=VeterinarioResponse)
async def actualizar_veterinario(
    vet_id: int,
    data: VeterinarioUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin")),
):
    return await veterinario_service.update_veterinario(db, vet_id, data)
