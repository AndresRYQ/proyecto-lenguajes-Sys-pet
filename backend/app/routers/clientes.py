from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import CurrentUser, require_roles
from app.services import cliente_service, mascota_service
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.schemas.mascota import MascotaCreate, MascotaResponse

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("", response_model=list[ClienteResponse])
async def listar_clientes(
    search: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    return await cliente_service.get_clientes(db, search=search, offset=offset, limit=limit)


@router.post("", response_model=ClienteResponse, status_code=201)
async def crear_cliente(
    data: ClienteCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    return await cliente_service.create_cliente(db, data)


@router.get("/{cliente_id}", response_model=ClienteResponse)
async def obtener_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    return await cliente_service.get_cliente(db, cliente_id)


@router.put("/{cliente_id}", response_model=ClienteResponse)
async def actualizar_cliente(
    cliente_id: int,
    data: ClienteUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    return await cliente_service.update_cliente(db, cliente_id, data)


@router.get("/{cliente_id}/mascotas", response_model=list[MascotaResponse])
async def mascotas_de_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    return await mascota_service.get_mascotas_by_cliente(db, cliente_id)


@router.post("/{cliente_id}/mascotas", response_model=MascotaResponse, status_code=201)
async def agregar_mascota(
    cliente_id: int,
    data: MascotaCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin", "recepcionista", "veterinario")),
):
    data.cliente_id = cliente_id
    return await mascota_service.create_mascota(db, data)
