from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, CurrentUser
from app.services.sede_service import get_sedes
from app.schemas.sede import SedeResponse

router = APIRouter(prefix="/sedes", tags=["sedes"])


@router.get("", response_model=list[SedeResponse])
async def listar_sedes(
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
):
    return await get_sedes(db)
