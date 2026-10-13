# ÍNDICE DEL PROYECTO FINAL — Veterinaria Oyanguren

---

## RESUMEN EJECUTIVO

El presente proyecto consiste en el diseño, desarrollo e implementación de un sistema web de gestión integral para la clínica **Veterinaria Oyanguren**, la cual opera con dos sedes ubicadas en los distritos de **San Luis** y **Surquillo** (Lima, Perú). El sistema automatiza los procesos de agendamiento de citas veterinarias, registro de clientes y mascotas, gestión de historial clínico, cola de emergencias priorizada, y control de acceso basado en roles (administrador, recepcionista, veterinario). La solución fue construida utilizando el **paradigma de Programación Orientada a Objetos (POO)** tanto en el backend (Python con FastAPI y SQLAlchemy) como en el frontend (React con componentes funcionales), con una base de datos relacional SQLite/PostgreSQL. El repositorio del código fuente se encuentra alojado en GitHub.

---

## CAPÍTULO I: MARCO ENTORNO Y DEFINICIÓN DEL PROYECTO

### 1.1. Contexto Empresarial y Problemática

#### 1.1.1. Presentación de la Empresa u Organización

**Veterinaria Oyanguren** es una clínica veterinaria con dos sedes operativas en Lima:

- **Sede San Luis:** Av. San Luis 123, San Luis.
- **Sede Surquillo:** Av. República de Panamá 456, Surquillo.

La clínica brinda servicios de medicina general, cirugía, dermatología y oftalmología para animales de compañía (perros y gatos), atendida por un equipo de 4 veterinarios especializados distribuidos entre ambas sedes.

#### 1.1.2. Planteamiento del Problema General

La gestión de citas, clientes, mascotas e historiales clínicos en Veterinaria Oyanguren se realizaba de forma manual o con herramientas no integradas, lo que generaba:

- Conflictos de agendamiento (citas superpuestas para un mismo veterinario).
- Falta de visibilidad en tiempo real sobre las citas activas entre ambas sedes.
- Dificultad para priorizar emergencias frente a citas regulares.
- Ausencia de un historial clínico centralizado y consultable por mascota.
- Falta de control de acceso diferenciado según el rol del usuario.

#### 1.1.3. Problemas Específicos

1. No existe un mecanismo automatizado que impida la creación de citas fuera del horario laboral (08:00–20:00) ni la detección de solapamientos de horario por veterinario.
2. No se valida que el veterinario asignado a una cita pertenezca a la sede correcta.
3. La cola de atención de emergencias no está priorizada de forma sistemática.
4. Los roles del personal (admin, recepcionista, veterinario) no cuentan con restricciones de acceso a los datos según su nivel de responsabilidad.
5. El historial clínico de cada mascota se encuentra fragmentado y no es consultable de forma cronológica.

### 1.2. Objetivos del Proyecto

#### 1.2.1. Objetivo General

Desarrollar un sistema web de gestión para Veterinaria Oyanguren que automatice los procesos de agendamiento de citas, registro de clientes y mascotas, historial clínico y cola de emergencias, aplicando el paradigma de Programación Orientada a Objetos (POO), con control de acceso basado en roles y soporte multi-sede.

#### 1.2.2. Objetivos Específicos

1. Implementar un módulo de **autenticación y autorización** con JWT y roles diferenciados (admin, recepcionista, veterinario).
2. Desarrollar un módulo de **gestión de citas** con validaciones de horario laboral (08:00–20:00), disponibilidad del veterinario y consistencia de sede.
3. Crear un módulo de **registro de clientes y mascotas** con búsqueda por nombre, teléfono o email.
4. Implementar un módulo de **historial clínico** que permita registrar y consultar diagnósticos y tratamientos por mascota en orden cronológico.
5. Desarrollar un módulo de **cola de emergencias** que ordene las citas activas por prioridad (alta > media > baja) y por hora de llegada.
6. Diseñar un **Dashboard** con métricas diarias (citas del día, pendientes, en atención, canceladas).
7. Construir la base de datos relacional con **9 tablas**, claves foráneas y restricciones de integridad.

### 1.3. Definición y Justificación del Paradigma

#### 1.3.1. Explicación del Paradigma de Programación Elegido

El paradigma elegido es la **Programación Orientada a Objetos (POO)**. Este paradigma organiza el software en torno a **objetos** que encapsulan datos (atributos) y comportamiento (métodos), agrupados en **clases**. Los principios fundamentales aplicados en este proyecto son:

- **Encapsulamiento:** Cada modelo (Sede, Usuario, Veterinario, Cliente, Mascota, Cita, HistoriaClinica, Atencion, Factura) encapsula sus atributos y relaciones. La lógica de negocio está encapsulada en servicios independientes (`cita_service.py`, `auth_service.py`, `cliente_service.py`, etc.).
- **Herencia:** Los esquemas Pydantic utilizan herencia de clases: `CitaCreate` hereda de `CitaBase`, `CitaResponse` hereda de `CitaBase`. Los modelos SQLAlchemy heredan de `DeclarativeBase`.
- **Polimorfismo:** Los enums (`EstadoCita`, `Prioridad`, `Rol`) heredan tanto de `str` como de `enum.Enum`, permitiendo su uso polimórfico como cadenas de texto y como tipos enumerados.
- **Abstracción:** La capa de servicios abstrae la lógica de validación y persistencia, exponiendo funciones de alto nivel (`crear_cita`, `cambiar_estado`, `obtener_cola_emergencias`) que ocultan la complejidad interna de las consultas SQL y las validaciones.

En el frontend, React utiliza el paradigma de **componentes funcionales** con hooks (`useState`, `useEffect`, `useContext`), donde cada componente es una unidad reutilizable que encapsula su estado, lógica y presentación visual.

#### 1.3.2. Justificación de la Elección del Paradigma para la Solución

La POO fue elegida por las siguientes razones:

1. **Modelado natural del dominio:** Las entidades del negocio veterinario (sedes, veterinarios, clientes, mascotas, citas, historiales) se mapean directamente a clases/objetos con relaciones claras (un cliente tiene muchas mascotas, una cita pertenece a una sede, etc.).
2. **Mantenibilidad y escalabilidad:** La separación en capas (modelos, esquemas, servicios, routers) facilita la adición de nuevos módulos sin afectar los existentes.
3. **Reutilización de código:** La herencia en los esquemas Pydantic evita la duplicación de definiciones de campos. Los componentes React reutilizables (`Btn`, `Modal`, `Card`, `Badge`, etc.) se usan en todas las páginas.
4. **Compatibilidad con el ORM:** SQLAlchemy 2.0 está diseñado nativamente para el paradigma POO, donde cada tabla es una clase Python y cada fila es una instancia de esa clase.

### 1.4. Descripción del Proceso a Automatizar

#### 1.4.1. Descripción del Flujo Actual del Proceso

Antes de la implementación del sistema, el flujo de trabajo en Veterinaria Oyanguren era:

1. El cliente llama por teléfono o llega a la sede para solicitar una cita.
2. La recepcionista revisa manualmente una agenda en papel o en una hoja de cálculo para buscar horarios disponibles.
3. Se anota el nombre del cliente, la mascota, el veterinario asignado, la fecha y hora.
4. No hay verificación automática de solapamiento de horarios ni de pertenencia del veterinario a la sede.
5. En caso de emergencia, la recepcionista debe revisar visualmente todas las citas del día para determinar el orden de atención.
6. El historial clínico se registra en fichas físicas individuales por mascota, sin posibilidad de consulta rápida ni cronológica.

#### 1.4.2. Flujo Propuesto y Diagramas de Proceso

Con el sistema implementado, el flujo automatizado es:

1. El usuario (admin/recepcionista/veterinario) inicia sesión con sus credenciales. El sistema valida el JWT y determina su rol y sede.
2. Desde el **Dashboard**, el usuario visualiza las métricas del día (citas totales, pendientes, en atención, canceladas) y las citas activas de todas las fechas.
3. Para crear una cita, el usuario selecciona la sede, el veterinario (filtrado por sede), el cliente, la mascota, la fecha, la hora y la prioridad. El sistema valida automáticamente:
   - Que la hora esté dentro del horario laboral (08:00–20:00).
   - Que el veterinario no tenga otra cita activa en la misma fecha y hora.
   - Que el veterinario pertenezca a la sede seleccionada.
4. La cita avanza por un flujo de estados: **pendiente → confirmada → en atención → finalizada** (o **cancelada** en cualquier punto previo).
5. En el módulo de **Emergencias**, las citas activas se ordenan automáticamente por prioridad (alta > media > baja) y luego por hora. La prioridad de una cita puede ser elevada con un botón.
6. El **Historial Clínico** permite buscar un cliente, seleccionar una mascota, y consultar o agregar entradas (diagnóstico, tratamiento, veterinario, fecha) en orden cronológico descendente.

```mermaid
flowchart TD
    A["Inicio de sesión (JWT)"] --> B{"Rol del usuario"}
    B -->|Admin| C["Dashboard (ambas sedes)"]
    B -->|Recepcionista/Vet| D["Dashboard (su sede)"]
    C --> E["Gestión de Citas"]
    D --> E
    E --> F{"Crear cita"}
    F --> G["Validar horario (08:00-20:00)"]
    G --> H["Validar disponibilidad veterinario"]
    H --> I["Validar sede del veterinario"]
    I --> J["Cita creada (estado: pendiente)"]
    J --> K["pendiente → confirmada"]
    K --> L["confirmada → en atención"]
    L --> M["en atención → finalizada"]
    J --> N["Cancelar cita"]
    E --> O["Cola de Emergencias"]
    O --> P["Orden: alta > media > baja > hora"]
    E --> Q["Historial Clínico"]
    Q --> R["Buscar cliente → Mascota → Entradas"]
```

---

## CAPÍTULO II: DISEÑO LÓGICO, FÍSICO E IMPLEMENTACIÓN

### 2.1. Modelo Lógico del Sistema

#### 2.1.1. Identificación de Entidades y Atributos

| Entidad | Atributos | Restricciones |
|---|---|---|
| **Sede** | id (PK), nombre (UNIQUE), direccion | — |
| **Usuario** | id (PK), nombre, email (UNIQUE), password_hash, rol, sede_id (FK→Sede) | rol ∈ {admin, recepcionista, veterinario} |
| **Veterinario** | id (PK), nombre, especialidad, sede_id (FK→Sede) | — |
| **Cliente** | id (PK), nombre, telefono, email (UNIQUE) | — |
| **Mascota** | id (PK), nombre, especie, raza, edad, cliente_id (FK→Cliente) | ON DELETE CASCADE |
| **Cita** | id (PK), fecha, hora, estado, motivo, prioridad, mascota_id (FK→Mascota), veterinario_id (FK→Veterinario), sede_id (FK→Sede) | estado ∈ {pendiente, confirmada, en_atencion, finalizada, cancelada}; prioridad ∈ {baja, media, alta} |
| **HistoriaClinica** | id (PK), fecha, diagnostico, tratamiento, mascota_id (FK→Mascota), veterinario_id (FK→Veterinario) | — |
| **Atencion** | id (PK), fecha, observaciones, cita_id (FK→Cita, UNIQUE) | — |
| **Factura** | id (PK), fecha, total (NUMERIC 10,2), cita_id (FK→Cita, UNIQUE) | — |

#### 2.1.2. Diagrama de Clases / Objetos (UML)

```mermaid
classDiagram
    class Sede {
        +int id
        +str nombre
        +str direccion
    }
    class Usuario {
        +int id
        +str nombre
        +str email
        +str password_hash
        +Rol rol
        +int sede_id
    }
    class Veterinario {
        +int id
        +str nombre
        +str especialidad
        +int sede_id
    }
    class Cliente {
        +int id
        +str nombre
        +str telefono
        +str email
    }
    class Mascota {
        +int id
        +str nombre
        +str especie
        +str raza
        +int edad
        +int cliente_id
    }
    class Cita {
        +int id
        +date fecha
        +time hora
        +EstadoCita estado
        +str motivo
        +Prioridad prioridad
        +int mascota_id
        +int veterinario_id
        +int sede_id
    }
    class HistoriaClinica {
        +int id
        +date fecha
        +str diagnostico
        +str tratamiento
        +int mascota_id
        +int veterinario_id
    }
    class Atencion {
        +int id
        +date fecha
        +str observaciones
        +int cita_id
    }
    class Factura {
        +int id
        +date fecha
        +float total
        +int cita_id
    }

    Sede "1" --o "*" Usuario : tiene
    Sede "1" --o "*" Veterinario : tiene
    Sede "1" --o "*" Cita : tiene
    Cliente "1" --o "*" Mascota : tiene
    Mascota "1" --o "*" Cita : tiene
    Mascota "1" --o "*" HistoriaClinica : tiene
    Veterinario "1" --o "*" Cita : atiende
    Veterinario "1" --o "*" HistoriaClinica : registra
    Cita "1" --o "0..1" Atencion : genera
    Cita "1" --o "0..1" Factura : genera
```

#### 2.1.3. Explicación de Relaciones entre Clases y Paradigma

Las relaciones implementadas reflejan directamente el dominio del negocio veterinario:

- **Sede → Usuario (1:N):** Cada usuario del sistema pertenece a una sede. Los administradores ven ambas sedes; los demás roles solo ven la suya.
- **Sede → Veterinario (1:N):** Cada veterinario está asignado a una sede específica. Se valida que las citas solo se asignen a veterinarios de la sede correspondiente.
- **Cliente → Mascota (1:N con CASCADE):** Un cliente puede tener múltiples mascotas. Si se elimina un cliente, sus mascotas se eliminan en cascada.
- **Mascota → Cita (1:N):** Una mascota puede tener múltiples citas programadas.
- **Mascota → HistoriaClinica (1:N):** Cada mascota acumula entradas de historial clínico con diagnósticos y tratamientos.
- **Cita → Atencion (1:1):** Una cita puede generar un registro de atención con observaciones.
- **Cita → Factura (1:1):** Una cita puede generar una factura asociada.

Estas relaciones se implementan mediante:
- **SQLAlchemy ORM (backend):** `ForeignKey` y `relationship()` con `back_populates` para navegación bidireccional.
- **SQLite (módulo nativo):** `FOREIGN KEY` con `PRAGMA foreign_keys = ON`.

### 2.2. Modelo Físico y Base de Datos en la Nube

#### 2.2.1. Selección y Arquitectura del Servicio Cloud (Base de Datos)

El sistema fue diseñado con una arquitectura **dual de base de datos**:

- **Desarrollo local:** SQLite 3.49.1 mediante el driver asíncrono `aiosqlite`. No requiere servidor externo ni configuración de red. El archivo de base de datos (`veterinaria.db`) se genera en el directorio del backend.
- **Producción/Nube:** PostgreSQL alojado en **Supabase** (servicio BaaS con PostgreSQL gestionado), accedido a través del driver asíncrono `asyncpg` mediante Session Pooler (IPv4-compatible).

La selección del motor se configura en la variable de entorno `DATABASE_URL`:

```
# SQLite local:
DATABASE_URL=sqlite+aiosqlite:///./veterinaria.db

# PostgreSQL (Supabase):
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
```

El archivo `engine.py` detecta automáticamente el motor y ajusta los parámetros de conexión.

#### 2.2.2. Script DDL / Creación de Tablas y Relaciones Físicas

**Script DDL en SQLite (archivo `database_sqlite.py`):**

```sql
-- 1. Sedes
CREATE TABLE IF NOT EXISTS sedes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    direccion TEXT NOT NULL
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('admin', 'recepcionista', 'veterinario')),
    sede_id INTEGER NOT NULL,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
);

-- 3. Veterinarios
CREATE TABLE IF NOT EXISTS veterinarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especialidad TEXT,
    sede_id INTEGER NOT NULL,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
);

-- 4. Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT UNIQUE
);

-- 5. Mascotas
CREATE TABLE IF NOT EXISTS mascotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especie TEXT NOT NULL,
    raza TEXT,
    edad INTEGER,
    cliente_id INTEGER NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 6. Citas
CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK(estado IN ('pendiente','confirmada','en_atencion','finalizada','cancelada')),
    motivo TEXT,
    prioridad TEXT NOT NULL DEFAULT 'media'
        CHECK(prioridad IN ('baja','media','alta')),
    mascota_id INTEGER NOT NULL,
    veterinario_id INTEGER NOT NULL,
    sede_id INTEGER NOT NULL,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE RESTRICT,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
);

-- 7. Historias Clínicas
CREATE TABLE IF NOT EXISTS historias_clinicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT,
    mascota_id INTEGER NOT NULL,
    veterinario_id INTEGER NOT NULL,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id) ON DELETE RESTRICT
);

-- 8. Atenciones
CREATE TABLE IF NOT EXISTS atenciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    observaciones TEXT,
    cita_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
);

-- 9. Facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    total REAL NOT NULL,
    cita_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_sede ON citas(sede_id);
CREATE INDEX IF NOT EXISTS idx_citas_vet ON citas(veterinario_id);
CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historial_mascota ON historias_clinicas(mascota_id);
```

#### 2.2.3. Evidencias de Conexión y Despliegue en la Nube

- **Archivo `.env`:** Configura la cadena de conexión a la base de datos (SQLite local o PostgreSQL/Supabase en producción).
- **Archivo `engine.py`:** Detecta automáticamente si se usa SQLite (activa `PRAGMA foreign_keys = ON` y `check_same_thread=False`) o PostgreSQL (activa `pool_size=5`, `max_overflow=10`, `pool_pre_ping=True`).
- **Repositorio GitHub:** [https://github.com/AndresRYQ/proyecto-lenguajes-Sys-pet.git](https://github.com/AndresRYQ/proyecto-lenguajes-Sys-pet.git)
- **Ejecución exitosa del script `database_sqlite.py`** generando `veterinaria.db` (90 KB) con las 9 tablas, datos semilla y verificación de consultas.

### 2.3. Estructura del Código Fuente

#### 2.3.1. Arquitectura y Organización de Directorios/Módulos

```
veterinaria-oyanguren/
├── backend/
│   ├── app/
│   │   ├── auth/              # Autenticación JWT
│   │   │   ├── jwt.py         # Creación y decodificación de tokens
│   │   │   └── dependencies.py # Dependencias FastAPI (CurrentUser, roles)
│   │   ├── database/          # Conexión a base de datos
│   │   │   ├── engine.py      # Motor async (SQLite/PostgreSQL)
│   │   │   └── session.py     # Sesión async y generador get_db
│   │   ├── models/            # Modelos SQLAlchemy (ORM)
│   │   │   ├── sede.py, usuario.py, veterinario.py
│   │   │   ├── cliente.py, mascota.py, cita.py
│   │   │   ├── historia_clinica.py, atencion.py, factura.py
│   │   │   └── __init__.py    # Re-exporta todos los modelos
│   │   ├── schemas/           # Esquemas Pydantic (validación I/O)
│   │   │   ├── cita.py, cliente.py, mascota.py, veterinario.py
│   │   │   ├── sede.py, usuario.py, historia_clinica.py
│   │   │   ├── atencion.py, factura.py
│   │   │   └── __init__.py
│   │   ├── services/          # Lógica de negocio
│   │   │   ├── cita_service.py     # Validaciones de citas y emergencias
│   │   │   ├── auth_service.py     # Hash y verificación de contraseñas
│   │   │   ├── cliente_service.py, mascota_service.py
│   │   │   ├── historial_service.py, veterinario_service.py
│   │   │   ├── sede_service.py
│   │   │   └── __init__.py
│   │   ├── routers/           # Endpoints REST (FastAPI)
│   │   │   ├── auth.py, citas.py, clientes.py, mascotas.py
│   │   │   ├── veterinarios.py, historial.py, emergencias.py, sedes.py
│   │   │   └── __init__.py
│   │   ├── config.py          # Configuración (Pydantic Settings)
│   │   └── main.py            # Punto de entrada FastAPI
│   ├── migrations/            # Migraciones Alembic
│   ├── database_sqlite.py     # Módulo SQLite3 nativo (DDL + funciones)
│   ├── init_db.py             # Inicialización de tablas vía SQLAlchemy
│   ├── test_sqlite.py         # Suite de pruebas automatizadas
│   ├── seed.py                # Seed: sedes + admin
│   ├── seed_data.py           # Seed: datos de prueba
│   ├── requirements.txt       # Dependencias Python
│   ├── alembic.ini            # Configuración Alembic
│   ├── .env.example           # Plantilla de variables de entorno
│   └── veterinaria.db         # Base de datos SQLite generada
├── frontend/
│   └── src/
│       ├── api/
│       │   └── index.js       # Wrapper de fetch con JWT automático
│       ├── components/
│       │   ├── Layout.jsx     # Sidebar + navegación + usuario
│       │   └── ui.jsx         # Componentes reutilizables (Btn, Modal, Card, Badge, etc.)
│       ├── context/
│       │   └── AuthContext.jsx # Contexto de autenticación global
│       ├── pages/
│       │   ├── Login.jsx      # Pantalla de inicio de sesión
│       │   ├── Dashboard.jsx  # Resumen diario y tabla de citas activas
│       │   ├── Citas.jsx      # CRUD completo de citas con filtros
│       │   ├── Clientes.jsx   # Gestión de clientes y mascotas
│       │   ├── Historial.jsx  # Consulta y registro de historial clínico
│       │   └── Emergencias.jsx # Cola de emergencias priorizada
│       ├── App.jsx            # Router principal con rutas protegidas
│       ├── main.jsx           # Punto de entrada React
│       └── index.css          # Estilos globales (Tailwind)
│   ├── package.json           # Dependencias Node.js
│   ├── vite.config.js         # Configuración Vite + proxy API
│   └── index.html             # HTML base
├── docker-compose.yml         # Despliegue con Docker
├── .gitignore                 # Exclusiones de Git
└── README.md                  # Documentación del proyecto
```

#### 2.3.2. Guía de Estándares de Código y Buenas Prácticas Aplicadas

| Práctica | Implementación |
|---|---|
| **Arquitectura por capas** | Separación estricta: Models → Schemas → Services → Routers |
| **Inyección de dependencias** | FastAPI `Depends()` para sesión de BD (`get_db`) y usuario actual (`get_current_user`) |
| **Validación de entrada/salida** | Pydantic v2 con `model_config = {"from_attributes": True}` |
| **Operaciones asíncronas** | Todos los endpoints y servicios usan `async/await` con `AsyncSession` |
| **Enums tipados** | `EstadoCita`, `Prioridad`, `Rol` heredan de `str` + `enum.Enum` |
| **Rutas protegidas** | Frontend: `ProtectedRoute` con `Navigate`. Backend: `get_current_user` en cada router |
| **Filtrado por rol** | `get_sede_filtro()`: admin ve todas las sedes, otros roles solo la suya |
| **Componentes reutilizables** | `Btn`, `Modal`, `Card`, `Badge`, `Input`, `Select`, `PageHeader`, `EmptyState` |
| **Proxy en desarrollo** | Vite redirige `/api` → `http://localhost:8000` (elimina problemas de CORS) |
| **Variables de entorno** | `.env` nunca se sube al repositorio (`.gitignore`); se proporciona `.env.example` |

#### 2.3.3. Enlace al Repositorio de Código Fuente

**Repositorio GitHub:** [https://github.com/AndresRYQ/proyecto-lenguajes-Sys-pet.git](https://github.com/AndresRYQ/proyecto-lenguajes-Sys-pet.git)

- **Rama principal:** `main`
- **Último commit:** `feat(db): configuracion de conexion y creacion de base de datos sqlite`

---

## CAPÍTULO III: RESULTADOS, AUTOMATIZACIÓN Y CONCLUSIONES

### 3.1. Evidencia de la Automatización del Sistema

#### 3.1.1. Demostración del Flujo del Sistema (Capturas de Pantalla)

*(Agregar capturas de pantalla de: Login, Dashboard, Citas, Clientes/Mascotas, Historial Clínico, Cola de Emergencias)*

#### 3.1.2. Casos de Prueba Ejecutados y Resultados Obtenidos

Se ejecutó la suite de pruebas automatizadas (`test_sqlite.py`) con los siguientes resultados:

| # | Caso de Prueba | Resultado |
|---|---|---|
| 1 | Autenticación con credenciales correctas (admin@veterinaria.pe / admin123) | ✅ PASS |
| 2 | Rechazo de contraseña incorrecta | ✅ PASS |
| 3 | Registro de nuevo cliente y mascota | ✅ PASS |
| 4 | Rechazo de cita fuera de horario laboral (06:00) | ✅ PASS |
| 5 | Rechazo de veterinario asignado a sede incorrecta | ✅ PASS |
| 6 | Creación exitosa de cita válida (16:00, San Luis) | ✅ PASS |
| 7 | Rechazo de cita solapada (mismo vet, misma fecha/hora) | ✅ PASS |
| 8 | Flujo de estados: pendiente → en_atencion → finalizada | ✅ PASS |
| 9 | Registro y consulta de historial clínico por mascota | ✅ PASS |
| 10 | Búsqueda de clientes con mascotas anidadas | ✅ PASS |

**Resultado global: 10/10 pruebas pasaron exitosamente (100% OK).**

#### 3.1.3. Enlace al Video Demo o Despliegue del Sistema Ejecutándose

*(Agregar enlace al video de demostración o URL de despliegue)*

### 3.2. Conclusiones

#### 3.2.1. Hallazgos y Cumplimiento de Objetivos

Todos los objetivos planteados fueron cumplidos satisfactoriamente:

1. **Autenticación JWT con roles:** Implementado con `python-jose`, `bcrypt`, y dependencias FastAPI. Los tokens incluyen el rol y la sede del usuario.
2. **Gestión de citas con validaciones:** Las tres reglas de negocio críticas (horario, disponibilidad, consistencia de sede) fueron implementadas y verificadas con pruebas automatizadas.
3. **Registro de clientes y mascotas:** CRUD completo con búsqueda por nombre, teléfono y email.
4. **Historial clínico:** Registro cronológico descendente con diagnóstico, tratamiento y veterinario asociado.
5. **Cola de emergencias:** Ordenamiento automático por prioridad (alta > media > baja) y hora, con capacidad de elevar prioridad en tiempo real.
6. **Dashboard:** Métricas diarias calculadas en el frontend con tarjetas estadísticas y tabla de citas activas.
7. **Base de datos:** 9 tablas con claves foráneas, restricciones CHECK, índices de optimización y soporte dual SQLite/PostgreSQL.

#### 3.2.2. Aprendizajes Técnicos del Paradigma y Herramientas Utilizadas

| Tecnología | Versión | Aprendizaje clave |
|---|---|---|
| **Python** | 3.12 | Tipado moderno con `int \| None`, `async/await` nativo |
| **FastAPI** | 0.143+ | Inyección de dependencias, validación automática con Pydantic, documentación OpenAPI |
| **SQLAlchemy** | 2.1+ | ORM asíncrono, `selectinload` para evitar N+1 queries, `DeclarativeBase` |
| **Pydantic** | 2.14+ | Esquemas tipados, herencia de modelos, `model_dump(exclude_unset=True)` |
| **SQLite** | 3.49 | `PRAGMA foreign_keys`, restricciones CHECK para enums, portabilidad total |
| **React** | 18.3 | Hooks (`useState`, `useEffect`, `useContext`), componentes funcionales |
| **Vite** | 5.3 | Hot Module Replacement, proxy de API en desarrollo |
| **Tailwind CSS** | 4.3 | Utilidades para diseño responsive, plugin Vite nativo |
| **JWT** | — | Autenticación stateless, expiración de tokens, roles embebidos |

### 3.3. Recomendaciones y Trabajos Futuros

#### 3.3.1. Oportunidades de Mejora y Escalabilidad del Sistema

1. **Notificaciones en tiempo real:** Implementar WebSockets para notificar al Dashboard cuando se crea o modifica una cita desde otra sesión.
2. **Módulo de facturación completo:** Extender la tabla `facturas` con detalle de servicios, productos y métodos de pago.
3. **Reportes y estadísticas:** Dashboard con gráficos mensuales de citas por sede, veterinario más solicitado, especies más atendidas.
4. **Gestión de horarios por veterinario:** Definir horarios individuales por día de la semana en lugar del rango fijo 08:00–20:00.
5. **Sistema de recordatorios:** Envío de emails o SMS al cliente para recordar la cita (integración con SendGrid, Twilio).
6. **Aplicación móvil:** Crear una app en React Native o Flutter para que los clientes reserven citas desde su teléfono.
7. **Auditoría de cambios:** Registrar quién creó, modificó o canceló cada cita con timestamp.
8. **Despliegue en producción:** Containerización completa con Docker Compose para backend + frontend + PostgreSQL.
9. **Pruebas de integración end-to-end:** Implementar pruebas automatizadas con Playwright o Cypress.
10. **Módulo de inventario:** Control de medicamentos, insumos y vacunas con alertas de stock bajo.

---

## REFERENCIAS BIBLIOGRÁFICAS

*(Formato APA)*

- FastAPI. (2024). *FastAPI documentation*. https://fastapi.tiangolo.com/
- SQLAlchemy. (2024). *SQLAlchemy 2.0 documentation*. https://docs.sqlalchemy.org/en/20/
- Pydantic. (2024). *Pydantic v2 documentation*. https://docs.pydantic.dev/latest/
- React. (2024). *React documentation*. https://react.dev/
- Vite. (2024). *Vite next generation frontend tooling*. https://vitejs.dev/
- Tailwind CSS. (2024). *Tailwind CSS documentation*. https://tailwindcss.com/docs
- SQLite. (2024). *SQLite documentation*. https://www.sqlite.org/docs.html
- Supabase. (2024). *Supabase documentation*. https://supabase.com/docs
- Auth0. (2024). *Introduction to JSON Web Tokens*. https://jwt.io/introduction

---

## ANEXOS

### Anexo A: Manual de Instalación o Despliegue Rápido

**Requisitos previos:** Python 3.11+, Node.js 18+.

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # Configurar DATABASE_URL y SECRET_KEY
python database_sqlite.py      # Crear tablas SQLite + datos iniciales
uvicorn app.main:app --reload  # Servidor en http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                    # Interfaz en http://localhost:5173
```

**Credenciales de prueba:**
- Admin: `admin@veterinaria.pe` / `admin123`
- Recepcionista: `recepcion.sl@veterinaria.pe` / `recep123`

### Anexo B: Matriz de Trazabilidad de Requerimientos vs. Código

| Requerimiento | Archivo(s) de Implementación | Validación |
|---|---|---|
| Autenticación JWT con roles | `auth_service.py`, `jwt.py`, `dependencies.py`, `auth.py` | `test_sqlite.py` #1, #2 |
| CRUD de clientes | `cliente_service.py`, `clientes.py`, `Clientes.jsx` | `test_sqlite.py` #3 |
| CRUD de mascotas | `mascota_service.py`, `mascotas.py`, `Clientes.jsx` | `test_sqlite.py` #3 |
| Validación horario 08:00–20:00 | `cita_service.py` líneas 56-61 | `test_sqlite.py` #4 |
| Validación sede del veterinario | `cita_service.py` líneas 84-90 | `test_sqlite.py` #5 |
| Creación de citas | `cita_service.py`, `citas.py`, `Citas.jsx` | `test_sqlite.py` #6 |
| Prevención de solapamiento | `cita_service.py` líneas 64-81 | `test_sqlite.py` #7 |
| Flujo de estados de cita | `cita_service.py` líneas 120-124, `Citas.jsx` | `test_sqlite.py` #8 |
| Historial clínico | `historial_service.py`, `historial.py`, `Historial.jsx` | `test_sqlite.py` #9 |
| Cola de emergencias | `cita_service.py` líneas 127-146, `Emergencias.jsx` | Ejecución en consola |
| Dashboard con métricas | `Dashboard.jsx` | Visual (frontend) |
| Filtrado por rol/sede | `dependencies.py` líneas 43-46 | Visual (frontend) |
| Base de datos 9 tablas | `database_sqlite.py`, modelos en `models/` | `test_sqlite.py` completo |
