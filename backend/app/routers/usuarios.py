from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_admin
from app.database.session import get_db
from app.schemas.usuario import PasswordReset, UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.services import usuario_service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


class EstadoUsuario(BaseModel):
    activo: bool


@router.get("", response_model=list[UsuarioResponse])
async def listar_usuarios(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await usuario_service.listar_usuarios(db, offset, limit)


@router.post("", response_model=UsuarioResponse, status_code=201)
async def crear_usuario(
    data: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await usuario_service.crear_usuario(db, data)


@router.put("/{user_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
    user_id: int,
    data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await usuario_service.actualizar_usuario(db, user_id, data)


@router.patch("/{user_id}/estado", response_model=UsuarioResponse)
async def cambiar_estado_usuario(
    user_id: int,
    data: EstadoUsuario,
    db: AsyncSession = Depends(get_db),
    actor: CurrentUser = Depends(require_admin),
):
    return await usuario_service.cambiar_estado(db, user_id, data.activo, actor.id)


@router.delete("/{user_id}", response_model=UsuarioResponse)
async def desactivar_usuario(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    actor: CurrentUser = Depends(require_admin),
):
    return await usuario_service.cambiar_estado(db, user_id, False, actor.id)


@router.post("/{user_id}/reset-password", response_model=UsuarioResponse)
async def restablecer_password(
    user_id: int,
    data: PasswordReset,
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_admin),
):
    return await usuario_service.restablecer_password(db, user_id, data)
