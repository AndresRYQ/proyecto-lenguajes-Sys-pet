# Veterinaria Oyanguren — Management System

Sistema web integral de gestión de citas, pacientes e historial clínico para Veterinaria Oyanguren, con sedes en San Luis y Surquillo.

## Arquitectura y Tecnologías

- **Frontend:** React 18, Vite, Tailwind CSS v4, React Router DOM.
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy 2.0 (asíncrono con `asyncpg`).
- **Base de Datos:** PostgreSQL en **Supabase**.
- **Migraciones:** Alembic (driver `psycopg2-binary`).
- **Autenticación:** JWT con roles (`admin`, `recepcionista`, `veterinario`).
- **Despliegue:** Render (Blueprint `render.yaml`).

## Módulos del Sistema

- **Dashboard:** Resumen diario con citas activas, estados y métricas en tiempo real.
- **Citas:** Agendamiento, reprogramación y flujo de estados (pendiente → confirmada → en atención → finalizada / cancelada).
- **Clientes y Mascotas:** Directorio con búsqueda y registro anidado de pacientes.
- **Historial Clínico:** Registro cronológico de diagnósticos y tratamientos por mascota.
- **Cola de Emergencias:** Priorización automática (alta > media > baja) y orden por hora de llegada.

## Instalación y Configuración Local

### 1. Prerrequisitos
- Python 3.11+
- Node.js 18+
- Proyecto en Supabase (PostgreSQL)

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # En Windows
# source venv/bin/activate  # En Linux / Mac

pip install -r requirements.txt

# Configurar variables de entorno con tus credenciales de Supabase
copy .env.example .env
# Edita .env y coloca tu PASSWORD de Supabase
```

#### Comandos para Base de Datos (Supabase):

```bash
# Opción A: Crear tablas y sembrar datos iniciales automáticamente
python init_db.py

# Opción B: Ejecutar migraciones con Alembic
alembic upgrade head

# Sembrar datos de prueba manualmente (si se usó Alembic)
python seed.py
python seed_data.py

# Probar conexión y consultas contra Supabase
python test_postgres.py
```

#### Iniciar el Backend:
```bash
uvicorn app.main:app --reload
```
API activa en `http://localhost:8000` y documentación interactiva en `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
Aplicación disponible en `http://localhost:5173`.

## Credenciales de Prueba

- **Administrador:** `admin@veterinaria.pe` / `admin123`
- **Recepcionista:** `recepcion.sl@veterinaria.pe` / `recep123`

## Variables de Entorno (.env)

Puedes configurar la base de datos de dos formas en `backend/.env`:

```env
# Forma 1: Parámetros individuales de Supabase
HOST=db.kjudticyywskfteezcog.supabase.co
PORT=5432
DATABASE=postgres
USER=postgres
PASSWORD=tu_password_aqui

# Forma 2: URL completa directa o Session Pooler IPv4
# DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.kjudticyywskfteezcog.supabase.co:5432/postgres
```

## Despliegue en Render

El proyecto incluye el archivo `render.yaml` listo para despliegue automatizado:

1. Conecta tu repositorio de GitHub en [Render](https://render.com).
2. Crea un nuevo **Blueprint Instance** seleccionando este repositorio.
3. En el panel de variables de entorno de Render, añade tu `PASSWORD` de Supabase.
4. Render ejecutará automáticamente:
   - **Backend:** `pip install -r requirements.txt && alembic upgrade head` y `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - **Frontend:** `npm install && npm run build` desplegado como Static Site con redirección SPA.
