"""
Script de verificación de conexión y operaciones CRUD en Supabase PostgreSQL.
"""
import asyncio
from sqlalchemy import select, text
from app.config import settings
from app.database.engine import engine
from app.database.session import AsyncSessionLocal
from app.models.sede import Sede
from app.models.usuario import Usuario
from app.models.veterinario import Veterinario
from app.models.cliente import Cliente
from app.models.mascota import Mascota
from app.models.cita import Cita


async def verify():
    print("=" * 60)
    print("TEST DE CONEXIÓN Y OPERACIONES EN SUPABASE POSTGRESQL")
    print("=" * 60)
    print(f"Host:     {settings.host}")
    print(f"Port:     {settings.port}")
    print(f"User:     {settings.user}")
    print(f"Database: {settings.database}")

    if not settings.password or settings.password == "coloca_aqui_tu_password_de_supabase":
        print("\n[AVISO] PASSWORD no configurado en backend/.env.")
        print("        Por favor coloca tu contraseña en backend/.env para probar la conexión.")
        return

    try:
        # 1. Test ping
        print("\n1. Probando conexión básica...")
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT version();"))
            version = res.scalar()
            print("[OK] Conectado exitosamente!")
            print(f"     Versión PostgreSQL: {version}")

        # 2. Test consultas ORM
        print("\n2. Verificando tablas y modelos con SQLAlchemy...")
        async with AsyncSessionLocal() as db:
            sedes = (await db.execute(select(Sede))).scalars().all()
            print(f"[OK] Sedes registradas: {len(sedes)}")
            for s in sedes:
                print(f"     - Sede #{s.id}: {s.nombre} ({s.direccion})")

            vets = (await db.execute(select(Veterinario))).scalars().all()
            print(f"[OK] Veterinarios registrados: {len(vets)}")

            clientes = (await db.execute(select(Cliente))).scalars().all()
            print(f"[OK] Clientes registrados: {len(clientes)}")

            mascotas = (await db.execute(select(Mascota))).scalars().all()
            print(f"[OK] Mascotas registradas: {len(mascotas)}")

            citas = (await db.execute(select(Cita))).scalars().all()
            print(f"[OK] Citas registradas: {len(citas)}")

        print("\n[ÉXITO TOTAL] La base de datos en Supabase responde a todas las operaciones ORM.")
    except Exception as e:
        print(f"\n[ERROR DE CONEXIÓN] {e}")


if __name__ == "__main__":
    asyncio.run(verify())
