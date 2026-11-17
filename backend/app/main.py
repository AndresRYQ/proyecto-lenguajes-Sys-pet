import logging

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database.session import get_db
from app.routers import citas, clientes, mascotas, veterinarios, historial, emergencias, sedes
from app.routers import auth, usuarios, facturas, dashboard

app = FastAPI(title=settings.app_name, debug=settings.debug)
logger = logging.getLogger("app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(clientes.router)
app.include_router(mascotas.router)
app.include_router(citas.router)
app.include_router(veterinarios.router)
app.include_router(historial.router)
app.include_router(emergencias.router)
app.include_router(sedes.router)
app.include_router(facturas.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": f"API {settings.app_name} activa"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
async def readiness(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logger.warning("database readiness failed: %s", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ready"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled request error method=%s path=%s",
        request.method,
        request.url.path,
    )
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})
