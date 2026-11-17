import asyncio
import os
import random
from datetime import date, time, timedelta

from faker import Faker
from sqlalchemy import func, select

from app.config import settings
from app.database.session import AsyncSessionLocal
from app.models.cita import Cita, EstadoCita, Prioridad
from app.models.cliente import Cliente
from app.models.historia_clinica import HistoriaClinica
from app.models.mascota import Mascota
from app.models.sede import Sede
from app.models.usuario import Rol, Usuario
from app.models.veterinario import Veterinario
from app.services.auth_service import hash_password

PERUVIAN_FIRST_NAMES = [
    "María", "José", "Luis", "Carmen", "Jorge", "Rosa", "Miguel", "Ana",
    "Carlos", "Patricia", "Juan", "Lucía", "Pedro", "Gabriela", "Diego",
    "Valeria", "Fernando", "Camila", "Alberto", "Daniela",
]
PERUVIAN_SURNAMES = [
    "Quispe", "Huamán", "Flores", "Rojas", "García", "Sánchez", "Mamani",
    "Torres", "Rivera", "Castillo", "Vargas", "Paredes", "Chávez", "Díaz",
    "Medina", "Gutiérrez", "Cárdenas", "Salazar", "Cruz", "Ramos",
]


def peruvian_name() -> str:
    return " ".join(
        [
            random.choice(PERUVIAN_FIRST_NAMES),
            random.choice(PERUVIAN_SURNAMES),
            random.choice(PERUVIAN_SURNAMES),
        ]
    )


async def seed_demo_data() -> None:
    if settings.environment.lower() == "production":
        raise RuntimeError("El seeder de demostración está deshabilitado en producción")
    if os.environ.get("ALLOW_DEMO_SEED", "").lower() not in {"1", "true", "yes"}:
        raise RuntimeError("Define ALLOW_DEMO_SEED=true para confirmar la carga de datos ficticios")

    demo_password = os.environ.get("DEMO_SEED_PASSWORD", "")
    if len(demo_password) < 12 or len(demo_password.encode("utf-8")) > 72:
        raise ValueError("DEMO_SEED_PASSWORD debe tener entre 12 y 72 bytes")

    fake = Faker("es_ES")
    Faker.seed(42)
    random.seed(42)

    async with AsyncSessionLocal() as db:
        for model in (Cliente, Mascota, Veterinario, Cita, HistoriaClinica):
            existing_count = await db.execute(select(func.count(model.id)))
            if existing_count.scalar_one():
                raise RuntimeError(
                    "La base ya contiene datos de la clínica; el seeder no sobrescribe ni duplica registros"
                )

        sede_result = await db.execute(
            select(Sede)
            .where(Sede.activo.is_(True), Sede.nombre.in_(["Los Olivos", "San Miguel"]))
            .order_by(Sede.id)
        )
        sedes = list(sede_result.scalars().all())
        if len(sedes) < 2:
            raise RuntimeError("Crea primero las sedes con python seed.py")

        user_result = await db.execute(select(Usuario).order_by(Usuario.id))
        existing_users = list(user_result.scalars().all())
        admin = next((user for user in existing_users if user.rol == Rol.admin), None)
        if existing_users and (len(existing_users) != 1 or admin is None):
            raise RuntimeError("El seeder requiere una base vacía o solo el administrador inicial")

        if admin is None:
            admin = Usuario(
                nombre="Administrador de demostración",
                email="admin@veterinaria.pe",
                password_hash=hash_password(demo_password),
                rol=Rol.admin,
                sede_id=sedes[0].id,
                debe_cambiar_password=True,
            )
            db.add(admin)

        users = [admin]
        for index in range(10):
            users.append(
                Usuario(
                    nombre=peruvian_name(),
                    email=f"demo.veterinario.{index + 1:02d}@example.invalid",
                    password_hash=hash_password(demo_password),
                    rol=Rol.veterinario,
                    sede_id=sedes[index % 2].id,
                    debe_cambiar_password=True,
                )
            )
        for index in range(9):
            users.append(
                Usuario(
                    nombre=peruvian_name(),
                    email=f"demo.recepcion.{index + 1:02d}@example.invalid",
                    password_hash=hash_password(demo_password),
                    rol=Rol.recepcionista,
                    sede_id=sedes[index % 2].id,
                    debe_cambiar_password=True,
                )
            )
        db.add_all(users[1:])

        veterinarios = [
            Veterinario(
                nombre=peruvian_name(),
                especialidad=random.choice(
                    ["Cirugía", "Dermatología", "Cardiología", "Medicina interna", "Emergencias"]
                ),
                sede_id=sedes[index % 2].id,
            )
            for index in range(15)
        ]
        clientes = [
            Cliente(
                nombre=peruvian_name(),
                telefono=f"9{random.randrange(10000000, 99999999)}",
                email=f"cliente.{index + 1:03d}@example.invalid",
                dni=f"{index + 1:08d}",
            )
            for index in range(100)
        ]
        db.add_all(veterinarios + clientes)
        await db.flush()

        mascotas = [
            Mascota(
                nombre=fake.first_name(),
                especie=random.choice(["Perro", "Gato", "Conejo", "Ave"]),
                raza=fake.word().capitalize(),
                edad=random.randint(0, 18),
                cliente_id=clientes[index % len(clientes)].id,
            )
            for index in range(300)
        ]
        db.add_all(mascotas)
        await db.flush()

        estados = list(EstadoCita)
        citas = []
        sedes_vets = {
            sede.id: [vet for vet in veterinarios if vet.sede_id == sede.id]
            for sede in sedes[:2]
        }
        for index in range(500):
            sede = sedes[index % 2] if index < 100 else random.choice(sedes[:2])
            vets = sedes_vets[sede.id]
            if index < 100:
                local_index = index // 2
                fecha = date.today()
                vet = vets[local_index % len(vets)]
                hora = time(8 + (local_index // len(vets)), 0)
                prioridad = Prioridad.alta
                estado = random.choice([EstadoCita.pendiente, EstadoCita.confirmada])
            else:
                fecha = date.today() + timedelta(days=random.randint(-30, 60))
                vet = random.choice(vets)
                hora = time(random.randint(8, 19), random.choice([0, 30]))
                prioridad = random.choice(list(Prioridad))
                estado = random.choice(estados)
            citas.append(
                Cita(
                    fecha=fecha,
                    hora=hora,
                    estado=estado,
                    motivo=fake.sentence(nb_words=5),
                    prioridad=prioridad,
                    mascota_id=random.choice(mascotas).id,
                    veterinario_id=vet.id,
                    sede_id=sede.id,
                )
            )
        db.add_all(citas)
        await db.flush()

        historias = [
            HistoriaClinica(
                fecha=cita.fecha,
                diagnostico=fake.sentence(nb_words=8),
                tratamiento=fake.sentence(nb_words=7),
                observaciones=fake.sentence(nb_words=10),
                mascota_id=cita.mascota_id,
                veterinario_id=cita.veterinario_id,
            )
            for cita in random.sample(citas, 500)
        ]
        db.add_all(historias)
        await db.commit()

    print(
        "Datos ficticios cargados: 20 usuarios, 2 sedes, 15 veterinarios, "
        "100 clientes, 300 mascotas, 500 citas (100 de prioridad alta) y "
        "500 historias clínicas. Contraseñas no mostradas."
    )


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
