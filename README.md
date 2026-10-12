# Veterinaria Oyanguren — Management System

Web system for managing appointments, patients and medical history for Veterinaria Oyanguren, which has two locations: San Luis and Surquillo.

## Technologies

Backend: Python, FastAPI, SQLAlchemy (async/aiosqlite), SQLite3. Frontend: React 18, Vite, Tailwind CSS v4. Auth: JWT with roles (admin, receptionist, veterinarian).

## Modules

The Dashboard shows a daily summary with active appointments across all dates. Appointments can be created, edited and moved through statuses (pending → confirmed → in progress → completed). Clients and Pets covers client registration along with their pets. Medical History stores clinical entries per pet (diagnosis and treatment). Emergencies manages a priority queue (high / medium / low).

## Structure

```
veterinaria-oyanguren/
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT and dependencies
│   │   ├── database/      # Async engine and session
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # FastAPI endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── main.py
│   ├── migrations/        # Alembic
│   ├── seed.py            # Creates locations and admin user
│   ├── seed_data.py       # Sample data
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/           # Fetch API wrapper
        ├── components/    # Layout and UI components
        ├── context/       # AuthContext
        └── pages/         # App pages
```

## Installation

### Prerequisites

Python 3.11+, Node.js 18+. SQLite3 viene integrado de forma nativa.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Set up environment variables
copy .env.example .env

# Crear las tablas y datos iniciales en SQLite
python database_sqlite.py

# Start the server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Test credentials

El script crea cuentas de prueba:
- Administrador: `admin@veterinaria.pe` / `admin123`
- Recepcionista: `recepcion.sl@veterinaria.pe` / `recep123`

## Environment variables

Ver `backend/.env.example`. La base de datos utiliza SQLite3 local de forma predeterminada:

```
DATABASE_URL=sqlite+aiosqlite:///./veterinaria.db
```

## Business rules

Appointments can only be created between 08:00 and 20:00. A veterinarian cannot have two appointments at the same time. The assigned veterinarian must belong to the same location as the appointment. Roles limit visibility: admins can see both locations, while other roles only see their own.
