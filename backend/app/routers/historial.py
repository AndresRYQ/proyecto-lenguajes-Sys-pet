from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import date
from app.database.session import get_db
from app.auth.dependencies import CurrentUser, require_roles
from app.services import historial_service
from app.schemas.historia_clinica import HistoriaClinicaCreate, HistoriaClinicaResponse


class HistoriaFullResponse(HistoriaClinicaResponse):
    veterinario_nombre: str | None = None
    model_config = {"from_attributes": True}


router = APIRouter(prefix="/historial", tags=["historial"])


@router.get("/mascota/{mascota_id}", response_model=list[HistoriaFullResponse])
async def historial_mascota(
    mascota_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_roles("admin", "veterinario")),
):
    historias = await historial_service.get_historial_by_mascota(
        db, mascota_id, None if current_user.rol == "admin" else current_user.sede_id
    )
    result = []
    for h in historias:
        d = {c.key: getattr(h, c.key) for c in h.__table__.columns}
        d["veterinario_nombre"] = h.veterinario.nombre if h.veterinario else None
        result.append(d)
    return result


@router.post("", response_model=HistoriaClinicaResponse, status_code=201)
async def crear_historia(
    data: HistoriaClinicaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_roles("admin", "veterinario")),
):
    if current_user.rol != "admin":
        from app.services.veterinario_service import pertenece_a_sede

        if not await pertenece_a_sede(db, data.veterinario_id, current_user.sede_id):
            raise HTTPException(status_code=403, detail="No puedes registrar historias en otra sede")
    return await historial_service.create_historia(db, data)
