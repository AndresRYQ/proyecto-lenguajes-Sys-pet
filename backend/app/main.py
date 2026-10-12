from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, citas, clientes, mascotas, veterinarios, historial, emergencias, sedes

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(mascotas.router)
app.include_router(citas.router)
app.include_router(veterinarios.router)
app.include_router(historial.router)
app.include_router(emergencias.router)
app.include_router(sedes.router)


@app.get("/")
async def root():
    return {"message": f"API {settings.app_name} activa"}
