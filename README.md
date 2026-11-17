# Clínica Veterinaria Huellitas Felices

Sistema de gestión veterinaria con React, FastAPI y PostgreSQL/Supabase. El repositorio incluye módulos de autenticación, clientes, mascotas, citas, veterinarios, historial clínico, emergencias, sedes, facturación y métricas.

## Tecnologías

- Frontend: React 18, Vite, Tailwind CSS v4 y React Router.
- Backend: Python 3.12+, FastAPI, SQLAlchemy asíncrono y Alembic.
- Base de datos: PostgreSQL (Supabase recomendado).
- Despliegue: Render o Docker Compose.

## Estructura

```text
backend/
  app/                 API, autenticación, modelos, schemas y servicios
  migrations/          Migraciones Alembic
  tests/               Pruebas del backend
  seed.py              Inicialización del administrador y sedes
  seed_data.py         Datos ficticios para demostración (opt-in)
frontend/
  src/                 Aplicación React
  nginx.conf           Proxy API y fallback SPA en Docker
docker-compose.yml
render.yaml
```

## Configuración local

### Backend

Requiere Python 3.12 y una base PostgreSQL. Desde `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Completa `backend/.env` con las variables de conexión de Supabase. `PASSWORD` es la contraseña de la base de datos de Supabase (no la contraseña de tu cuenta de Supabase). No compartas ni subas este archivo.
Las conexiones PostgreSQL se fuerzan a TLS (`ssl=require` para asyncpg y `sslmode=require` para Alembic/psycopg); SQLite temporal queda excluida.

```env
HOST=tu-host-de-supabase
DB_PORT=5432
DATABASE=postgres
USER=postgres.tu-project-ref
PASSWORD=contraseña-de-la-base
SECRET_KEY=una-clave-aleatoria-de-al-menos-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
DEBUG=false
```

Genera un secreto JWT aleatorio; no reutilices una contraseña ni publiques el valor:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

`backend/.env.example` contiene la lista de nombres. También se admite `DATABASE_URL` cuando el proveedor entrega una URL de PostgreSQL.

Prepara la base e inicia la API:

```powershell
alembic upgrade head
$env:INITIAL_ADMIN_PASSWORD = "una-clave-temporal-larga-y-unica"
python seed.py
uvicorn app.main:app --reload
```

El bootstrap crea las sedes `Los Olivos` y `San Miguel` si no existen, y el administrador `admin@veterinaria.pe` (o `INITIAL_ADMIN_EMAIL`). La contraseña inicial solo se lee de `INITIAL_ADMIN_PASSWORD`; el usuario debe cambiarla en su primer inicio de sesión. El bootstrap no reemplaza contraseñas de usuarios existentes.

La API local está en `http://localhost:8000`; la documentación OpenAPI está en `/docs`. `/health` verifica que el proceso responde y `/ready` comprueba además la conexión a la base de datos. Para compilar Python y ejecutar las pruebas:

```powershell
python -m compileall app
python -m pytest tests -q
```

### Frontend

Requiere Node.js 22.12 o posterior. Desde `frontend`:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Configura `VITE_API_URL` en `frontend/.env` si la API no está en `http://localhost:8000`. Antes de desplegar:

```powershell
npm run build
npm test
```

## Módulos y permisos

Los roles disponibles son `admin`, `veterinario` y `recepcionista`. El backend verifica el estado y rol actuales del usuario en la base de datos; la interfaz oculta enlaces no autorizados, pero la autorización real se hace en la API.

- Administrador: acceso a la gestión de usuarios, veterinarios, sedes, clientes, mascotas, citas, historial, emergencias y facturas.
- Veterinario: acceso operativo a clientes, mascotas, citas e historial clínico.
- Recepcionista: clientes, mascotas y citas; no puede gestionar usuarios ni acceder al historial clínico completo.

Las rutas de la aplicación incluyen `/dashboard`, `/clientes`, `/citas`, `/historial`, `/emergencias` y `/administracion`. Los endpoints están documentados en `/docs`; las listas que admiten paginación usan `offset` y `limit`.

## Migraciones y Supabase

Usa Alembic para cambios de esquema:

```powershell
alembic upgrade head
```

La migración `2c601af1d130` agrega campos e índices y puede renombrar las sedes existentes `San Luis` y `Surquillo` a `Los Olivos` y `San Miguel`. **Haz un respaldo y revisa esos datos en Supabase antes de aplicarla.**

## Datos ficticios de demostración

El seeder crea datos ficticios relacionados entre sí; no es una carga para producción. Solo ejecútalo contra una base de staging vacía y migrada. Los scripts leen `backend/.env` (las variables del proceso tienen precedencia); no publiques ese archivo. `seed.py` asegura las sedes aunque el administrador ya exista. En PowerShell:

```powershell
$env:ENVIRONMENT = "development"
$env:INITIAL_ADMIN_PASSWORD = "clave-temporal-larga"
python seed.py
$env:ALLOW_DEMO_SEED = "true"
$env:DEMO_SEED_PASSWORD = "otra-clave-de-demo-larga"
python seed_data.py
```

Genera 20 usuarios, 15 veterinarios, 100 clientes, 300 mascotas, 500 citas y 500 historias clínicas. Las primeras 100 citas del día alimentan la cola de emergencias con prioridades alta, media y baja; las otras citas no se programan para ese día. La cola las ordena por prioridad. Las contraseñas de demostración se suministran por entorno, todos los usuarios de demostración las comparten y deben cambiarlas al iniciar sesión. El seeder rechaza explícitamente `ENVIRONMENT=production` y bases que ya contengan datos clínicos. No conectes el seeder de demostración a Supabase de producción.

## Docker Compose

Configura `backend/.env` con una base PostgreSQL alcanzable desde Docker y ejecuta desde la raíz:

```powershell
docker compose up --build
```

El backend aplica migraciones antes de iniciar; el frontend se sirve por Nginx en `http://localhost:8080` y reenvía `/api` al backend. Compose no incluye un contenedor PostgreSQL local.

## Render

`render.yaml` declara el backend FastAPI y el frontend estático. Configura los secretos `HOST`, `USER`, `PASSWORD` y `SECRET_KEY` en Render, además de las variables no secretas definidas en el Blueprint. `CORS_ORIGINS` debe contener el dominio exacto del frontend. Las migraciones se ejecutan como parte del comando de inicio del backend antes de Uvicorn.

Después del primer despliegue, inicializa el administrador una sola vez desde un shell/release command del backend con `INITIAL_ADMIN_PASSWORD` y ejecuta `python seed.py`. No configures ni ejecutes `seed_data.py` en producción. Antes de desplegar cambios de esquema, respalda la base y revisa las migraciones.

## Consideraciones de producción pendientes

- No se ha probado una conexión o migración contra el proyecto Supabase real; el acceso y los datos deben validarse en el entorno del propietario.
- Docker no estaba disponible en el entorno de desarrollo, por lo que `docker compose up --build` no se pudo ejecutar.
- El conjunto de pruebas es inicial y no acredita el objetivo de cobertura del 80%.
- Las pantallas nuevas de administración y el flujo de facturación requieren pruebas funcionales con una base de staging.
- `pip-audit` no reportó vulnerabilidades en los requisitos de producción del backend. `npm audit --omit=dev` tampoco reportó vulnerabilidades, pero la auditoría completa detectó GHSA-fc5q-39xc-vjpf en `picomatch@4.0.7` del árbol de desarrollo/build; no hay una versión upstream corregida disponible en npm al momento de esta revisión.
- Antes de abrir el sistema al público, añade limitación de intentos de inicio de sesión y completa pruebas de permisos, paginación, auditoría de cambios y recuperación de contraseña.
