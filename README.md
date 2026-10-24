# Clínica Veterinaria Huellitas Felices — Management System

Sistema web integral de gestión de citas, pacientes e historial clínico para Clínica Veterinaria Huellitas Felices, con sedes en los olivos y san miguel.

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

## Estructura del proyecto

```text
.
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT, dependencias y autorización
│   │   ├── database/       # Motor y sesiones de base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routers/        # Endpoints de la API
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio
│   ├── migrations/         # Migraciones de Alembic
│   ├── app/config.py       # Configuración mediante variables de entorno
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # Cliente para consumir la API
│   │   ├── components/     # Layout y componentes reutilizables
│   │   ├── context/         # Estado global de autenticación
│   │   └── pages/           # Login, dashboard y módulos principales
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── render.yaml
```

## Backend: API y organización

El backend expone una API REST con FastAPI. La aplicación principal se encuentra en
`backend/app/main.py` y registra los routers de autenticación, clientes, mascotas,
citas, veterinarios, historial clínico, emergencias y sedes.

La lógica está separada por responsabilidades:

- **Routers:** definen las rutas HTTP y sus respuestas.
- **Schemas:** validan los datos de entrada y salida con Pydantic.
- **Models:** representan las entidades persistidas con SQLAlchemy.
- **Services:** concentran las reglas de negocio y operaciones sobre los datos.
- **Auth:** genera y valida tokens JWT y protege los endpoints según el usuario autenticado.

La aplicación utiliza sesiones asíncronas con `asyncpg` para las operaciones normales y
un motor síncrono con `psycopg` para tareas compatibles con Alembic. CORS está habilitado
para permitir la comunicación entre el frontend y la API durante el desarrollo y el
despliegue.

### Endpoints principales

| Área | Prefijo o recurso | Funcionalidad |
| --- | --- | --- |
| Autenticación | `/auth` | Inicio de sesión y emisión de JWT |
| Clientes | `/clientes` | Registro, consulta y gestión de propietarios |
| Mascotas | `/mascotas` | Pacientes asociados a los clientes |
| Citas | `/citas` | Agenda y estados de atención |
| Veterinarios | `/veterinarios` | Profesionales y asignaciones |
| Historial | `/historial` | Diagnósticos y tratamientos |
| Emergencias | `/emergencias` | Priorización de atenciones urgentes |
| Sedes | `/sedes` | Gestión de las sedes de la clínica |

La documentación automática está disponible en `/docs` y `/redoc` cuando el backend está
ejecutándose.

## Frontend: aplicación web

El frontend está construido con React 18, Vite y React Router DOM. La entrada de la
aplicación está en `frontend/src/main.jsx` y el enrutamiento principal en
`frontend/src/App.jsx`.

- `AuthContext` mantiene el usuario autenticado y controla la sesión.
- `ProtectedRoute` redirige al login cuando no existe una sesión válida.
- `Layout` proporciona la estructura común de navegación de la aplicación.
- Las páginas de `src/pages` implementan dashboard, clientes, citas, historial y emergencias.
- `src/api` centraliza las solicitudes al backend.
- Tailwind CSS se utiliza para los estilos y el diseño de la interfaz.

Rutas disponibles en la interfaz:

```text
/login
/dashboard
/clientes
/citas
/historial
/emergencias
```

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

En otra terminal, desde `backend`, puedes ejecutar una comprobación básica de sintaxis con:

```bash
python -m compileall app
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
Aplicación disponible en `http://localhost:5173`.

Para generar la versión de producción y previsualizarla localmente:

```bash
npm run build
npm run preview
```

El frontend debe conocer la URL de la API mediante la variable configurada en su archivo
`.env` local. No subas archivos `.env` con contraseñas, tokens JWT o credenciales de
Supabase al repositorio.

## Flujo de datos

```text
Usuario → React/Vite → cliente API → FastAPI → Services → SQLAlchemy → PostgreSQL/Supabase
                                      ↘ JWT y autorización
```

Después de iniciar sesión, el frontend conserva el token de acceso y lo envía en las
solicitudes protegidas. El backend valida el token, aplica las reglas de autorización y
devuelve los datos solicitados.

## Despliegue

El archivo `render.yaml` define la configuración de despliegue en Render. Antes de
publicar, configura en el proveedor las variables `HOST`, `PORT`, `DATABASE`, `USER`,
`PASSWORD`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `APP_NAME` y
`DEBUG`. Las credenciales reales deben mantenerse únicamente como variables secretas del
entorno.

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
