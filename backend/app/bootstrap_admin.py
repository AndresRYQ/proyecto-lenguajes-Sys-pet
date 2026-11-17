import asyncio
import os

from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.sede import Sede
from app.models.usuario import Rol, Usuario
from app.services.auth_service import hash_password


async def bootstrap() -> None:
    password = os.environ.get("INITIAL_ADMIN_PASSWORD", "")
    email = os.environ.get("INITIAL_ADMIN_EMAIL", "admin@veterinaria.pe").strip().lower()
    if len(password) < 12 or len(password.encode("utf-8")) > 72:
        raise ValueError("INITIAL_ADMIN_PASSWORD debe tener entre 12 y 72 bytes")

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Usuario.id).where(Usuario.email == email))
        if existing.scalar_one_or_none():
            print("El usuario administrador ya existe; no se realizaron cambios.")
            return

        locations = {
            "Los Olivos": "Dirección pendiente de configurar",
            "San Miguel": "Dirección pendiente de configurar",
        }
        for name, address in locations.items():
            result = await db.execute(select(Sede.id).where(Sede.nombre == name))
            if result.scalar_one_or_none() is None:
                db.add(Sede(nombre=name, direccion=address))
        await db.flush()
        result = await db.execute(
            select(Sede)
            .where(Sede.nombre == "Los Olivos", Sede.activo.is_(True))
            .order_by(Sede.id)
        )
        sede = result.scalars().first()
        if sede is None:
            raise RuntimeError("No se pudo preparar la sede inicial Los Olivos")

        db.add(
            Usuario(
                nombre="Administrador",
                email=email,
                password_hash=hash_password(password),
                rol=Rol.admin,
                sede_id=sede.id,
                activo=True,
                debe_cambiar_password=True,
            )
        )
        await db.commit()
    print("Administrador inicial creado; deberá cambiar su contraseña al ingresar.")


if __name__ == "__main__":
    asyncio.run(bootstrap())
