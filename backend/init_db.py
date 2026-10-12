"""
Script para inicializar la base de datos SQLite con todas las tablas del sistema
y opcionalmente sembrar los datos iniciales de prueba.
"""
import asyncio
from app.database.engine import engine, Base
import app.models  # Importa todos los modelos para registrarlos en Base.metadata
from app.database.session import AsyncSessionLocal
from app.models.sede import Sede
from app.models.usuario import Usuario, Rol
from app.models.veterinario import Veterinario
from app.models.cliente import Cliente
from app.models.mascota import Mascota
from app.models.cita import Cita, EstadoCita, Prioridad
from app.services.auth_service import hash_password
from datetime import date, time
from sqlalchemy import select


async def init_tables():
    print("Creando tablas en la base de datos SQLite...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tablas creadas con éxito.")


async def seed_data():
    async with AsyncSessionLocal() as db:
        # Verificar si ya existen sedes
        result = await db.execute(select(Sede))
        if result.scalars().first():
            print("! La base de datos ya contiene datos. Omitiendo seed inicial.")
            return

        print("Insertando datos iniciales (sedes, usuarios, veterinarios, clientes, mascotas)...")

        # 1. Sedes
        san_luis = Sede(nombre="San Luis", direccion="Av. San Luis 123, San Luis")
        surquillo = Sede(nombre="Surquillo", direccion="Av. Republica de Panama 456, Surquillo")
        db.add_all([san_luis, surquillo])
        await db.flush()

        # 2. Usuarios
        admin = Usuario(
            nombre="Administrador",
            email="admin@veterinaria.pe",
            password_hash=hash_password("admin123"),
            rol=Rol.admin,
            sede_id=san_luis.id,
        )
        recepcionista = Usuario(
            nombre="Recepcionista San Luis",
            email="recepcion.sl@veterinaria.pe",
            password_hash=hash_password("recep123"),
            rol=Rol.recepcionista,
            sede_id=san_luis.id,
        )
        db.add_all([admin, recepcionista])

        # 3. Veterinarios
        vets = [
            Veterinario(nombre="Dr. Carlos Ramírez", especialidad="Medicina General", sede_id=san_luis.id),
            Veterinario(nombre="Dra. María García", especialidad="Cirugía", sede_id=san_luis.id),
            Veterinario(nombre="Dr. Luis Torres", especialidad="Dermatología", sede_id=surquillo.id),
            Veterinario(nombre="Dra. Ana Quispe", especialidad="Oftalmología", sede_id=surquillo.id),
        ]
        db.add_all(vets)
        await db.flush()

        # 4. Clientes
        c1 = Cliente(nombre="Juan Pérez", telefono="987654321", email="juan@gmail.com")
        c2 = Cliente(nombre="Ana Torres", telefono="912345678", email="ana@gmail.com")
        c3 = Cliente(nombre="Roberto Silva", telefono="956781234", email="roberto@gmail.com")
        db.add_all([c1, c2, c3])
        await db.flush()

        # 5. Mascotas
        m1 = Mascota(nombre="Rex", especie="Perro", raza="Labrador", edad=3, cliente_id=c1.id)
        m2 = Mascota(nombre="Michi", especie="Gato", raza="Siamés", edad=2, cliente_id=c1.id)
        m3 = Mascota(nombre="Toby", especie="Perro", raza="Beagle", edad=5, cliente_id=c2.id)
        m4 = Mascota(nombre="Luna", especie="Gato", raza="Persa", edad=1, cliente_id=c3.id)
        db.add_all([m1, m2, m3, m4])
        await db.flush()

        # 6. Citas de prueba
        hoy = date.today()
        citas = [
            Cita(
                fecha=hoy,
                hora=time(9, 0),
                estado=EstadoCita.pendiente,
                motivo="Vacunación anual",
                prioridad=Prioridad.media,
                mascota_id=m1.id,
                veterinario_id=vets[0].id,
                sede_id=san_luis.id,
            ),
            Cita(
                fecha=hoy,
                hora=time(10, 30),
                estado=EstadoCita.confirmada,
                motivo="Revisión general y desparasitación",
                prioridad=Prioridad.baja,
                mascota_id=m3.id,
                veterinario_id=vets[1].id,
                sede_id=san_luis.id,
            ),
            Cita(
                fecha=hoy,
                hora=time(11, 0),
                estado=EstadoCita.pendiente,
                motivo="Dificultad respiratoria súbita",
                prioridad=Prioridad.alta,
                mascota_id=m2.id,
                veterinario_id=vets[0].id,
                sede_id=san_luis.id,
            ),
        ]
        db.add_all(citas)

        await db.commit()
        print("✓ Datos iniciales insertados correctamente.")
        print("  - Admin: admin@veterinaria.pe / admin123")
        print("  - Recepcionista: recepcion.sl@veterinaria.pe / recep123")
        print("  - 2 sedes, 4 veterinarios, 3 clientes, 4 mascotas y 3 citas.")


async def main():
    await init_tables()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())

