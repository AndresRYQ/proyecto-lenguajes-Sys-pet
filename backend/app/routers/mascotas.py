from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, CurrentUser
from app.services import mascota_service
from app.schemas.mascota import MascotaUpdate, MascotaResponse

router = APIRouter(prefix="/mascotas", tags=["mascotas"])


@router.get("/{mascota_id}", response_model=MascotaResponse)
async def obtener_mascota(
    mascota_id: int,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    return await mascota_service.get_mascota(db, mascota_id)


@router.put("/{mascota_id}", response_model=MascotaResponse)
async def actualizar_mascota(
    mascota_id: int,
    data: MascotaUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    return await mascota_service.update_mascota(db, mascota_id, data)
