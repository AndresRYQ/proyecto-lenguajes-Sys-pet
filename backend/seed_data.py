import asyncio
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.sede import Sede
from app.models.veterinario import Veterinario
from app.models.cliente import Cliente
from app.models.mascota import Mascota


async def seed():
    async with AsyncSessionLocal() as db:
        r = await db.execute(select(Sede).order_by(Sede.id))
        sedes = r.scalars().all()
        if len(sedes) < 2:
            print("Error: primero corre seed.py para crear las sedes")
            return

        san_luis = sedes[0]
        surquillo = sedes[1]

        vets = [
            Veterinario(nombre="Dr. Carlos Ramírez", especialidad="Medicina General", sede_id=san_luis.id),
            Veterinario(nombre="Dra. María García", especialidad="Cirugía", sede_id=san_luis.id),
            Veterinario(nombre="Dr. Luis Torres", especialidad="Dermatología", sede_id=surquillo.id),
            Veterinario(nombre="Dra. Ana Quispe", especialidad="Oftalmología", sede_id=surquillo.id),
        ]
        db.add_all(vets)

        clientes = [
            Cliente(nombre="Juan Pérez", telefono="987654321", email="juan@gmail.com"),
            Cliente(nombre="Ana Torres", telefono="912345678", email="ana@gmail.com"),
            Cliente(nombre="Roberto Silva", telefono="956781234", email="roberto@gmail.com"),
        ]
        db.add_all(clientes)
        await db.flush()

        mascotas = [
            Mascota(nombre="Rex", especie="Perro", raza="Labrador", edad=3, cliente_id=clientes[0].id),
            Mascota(nombre="Michi", especie="Gato", raza="Siamés", edad=2, cliente_id=clientes[0].id),
            Mascota(nombre="Toby", especie="Perro", raza="Beagle", edad=5, cliente_id=clientes[1].id),
            Mascota(nombre="Luna", especie="Gato", raza="Persa", edad=1, cliente_id=clientes[2].id),
        ]
        db.add_all(mascotas)
        await db.commit()
        print("Datos de prueba creados:")
        print("  4 veterinarios (2 por sede)")
        print("  3 clientes con 4 mascotas")


asyncio.run(seed())
