from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import Rol, Usuario
from app.schemas.usuario import PasswordReset, UsuarioCreate, UsuarioUpdate
from app.services.auth_service import hash_password


async def listar_usuarios(db: AsyncSession, offset: int = 0, limit: int = 50) -> list[Usuario]:
    result = await db.execute(
        select(Usuario).order_by(Usuario.nombre).offset(offset).limit(limit)
    )
    return list(result.scalars().all())


async def crear_usuario(db: AsyncSession, data: UsuarioCreate) -> Usuario:
    email = data.email.lower()
    exists = await db.execute(select(Usuario.id).where(Usuario.email == email))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo")
    user = Usuario(
        nombre=data.nombre.strip(),
        email=email,
        password_hash=hash_password(data.password),
        rol=data.rol,
        sede_id=data.sede_id,
        debe_cambiar_password=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def actualizar_usuario(db: AsyncSession, user_id: int, data: UsuarioUpdate) -> Usuario:
    user = await obtener_usuario(db, user_id)
    updates = data.model_dump(exclude_unset=True)
    email = updates.get("email")
    if email and email.lower() != user.email:
        exists = await db.execute(
            select(Usuario.id).where(Usuario.email == email.lower(), Usuario.id != user_id)
        )
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo")
        updates["email"] = email.lower()
    for field, value in updates.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def obtener_usuario(db: AsyncSession, user_id: int) -> Usuario:
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


async def cambiar_estado(
    db: AsyncSession, user_id: int, activo: bool, actor_id: int
) -> Usuario:
    user = await obtener_usuario(db, user_id)
    if user.id == actor_id and not activo:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    if user.rol == Rol.admin and user.activo and not activo:
        result = await db.execute(
            select(func.count(Usuario.id)).where(
                Usuario.rol == Rol.admin, Usuario.activo.is_(True)
            )
        )
        if result.scalar_one() <= 1:
            raise HTTPException(status_code=400, detail="No puedes desactivar al último administrador")
    user.activo = activo
    await db.commit()
    await db.refresh(user)
    return user


async def restablecer_password(
    db: AsyncSession, user_id: int, data: PasswordReset
) -> Usuario:
    user = await obtener_usuario(db, user_id)
    user.password_hash = hash_password(data.password)
    user.debe_cambiar_password = True
    await db.commit()
    await db.refresh(user)
    return user
