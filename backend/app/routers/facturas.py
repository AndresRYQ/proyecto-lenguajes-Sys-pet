from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_roles
from app.database.session import get_db
from app.schemas.factura import FacturaCreate, FacturaResponse, FacturaUpdate
from app.services import factura_service

router = APIRouter(prefix="/facturas", tags=["facturas"])


@router.get("", response_model=list[FacturaResponse])
async def listar_facturas(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_roles("admin", "recepcionista")),
):
    sede_id = None if current_user.rol == "admin" else current_user.sede_id
    return await factura_service.listar_facturas(db, offset, limit, sede_id)


@router.post("", response_model=FacturaResponse, status_code=201)
async def crear_factura(
    data: FacturaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_roles("admin", "recepcionista")),
):
    sede_id = None if current_user.rol == "admin" else current_user.sede_id
    return await factura_service.crear_factura(db, data, sede_id)


@router.put("/{factura_id}", response_model=FacturaResponse)
async def actualizar_factura(
    factura_id: int,
    data: FacturaUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin")),
):
    return await factura_service.actualizar_factura(db, factura_id, data)


@router.delete("/{factura_id}", response_model=FacturaResponse)
async def anular_factura(
    factura_id: int,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_roles("admin")),
):
    return await factura_service.anular_factura(db, factura_id)
