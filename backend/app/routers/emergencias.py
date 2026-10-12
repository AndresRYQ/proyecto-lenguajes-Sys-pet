from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, CurrentUser, get_sede_filtro
from app.services import cita_service
from app.routers.citas import CitaFullResponse, _enriquecer

router = APIRouter(prefix="/emergencias", tags=["emergencias"])


@router.get("/cola", response_model=list[CitaFullResponse])
async def cola_emergencias(
    sede_id: int | None = Query(None),
    fecha: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    filtro_sede = get_sede_filtro(sede_id, current_user)
    if filtro_sede is None:
        filtro_sede = current_user.sede_id
    fecha_consulta = fecha or date.today()
    citas = await cita_service.get_cola_emergencias(db, filtro_sede, fecha_consulta)
    return [_enriquecer(c) for c in citas]
