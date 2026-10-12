import asyncio
from app.database.session import AsyncSessionLocal
from app.models.sede import Sede
from app.models.usuario import Usuario, Rol
from app.services.auth_service import hash_password


async def seed():
    async with AsyncSessionLocal() as db:
        san_luis = Sede(nombre="San Luis", direccion="Av. San Luis 123, San Luis")
        surquillo = Sede(nombre="Surquillo", direccion="Av. Republica de Panama 456, Surquillo")
        db.add_all([san_luis, surquillo])
        await db.flush()

        admin = Usuario(
            nombre="Administrador",
            email="admin@veterinaria.pe",
            password_hash=hash_password("admin123"),
            rol=Rol.admin,
            sede_id=san_luis.id,
        )
        db.add(admin)
        await db.commit()
        print("Sedes y usuario admin creados correctamente")
        print("Email:    admin@veterinaria.pe")
        print("Password: admin123")


asyncio.run(seed())
