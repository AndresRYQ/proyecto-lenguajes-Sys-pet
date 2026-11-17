from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_roles
from app.database.session import get_db
from app.models.cita import Cita, EstadoCita, Prioridad
from app.models.cliente import Cliente
from app.models.mascota import Mascota
from app.models.veterinario import Veterinario

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/resumen")
async def resumen(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(
        require_roles("admin", "recepcionista", "veterinario")
    ),
):
    citas_hoy = select(func.count(Cita.id)).where(Cita.fecha == date.today())
    citas_activas = select(func.count(Cita.id)).where(
        Cita.fecha == date.today(),
        Cita.estado.notin_([EstadoCita.finalizada, EstadoCita.cancelada]),
    )
    citas_finalizadas = select(func.count(Cita.id)).where(
        Cita.fecha == date.today(), Cita.estado == EstadoCita.finalizada
    )
    emergencias = select(func.count(Cita.id)).where(
        Cita.fecha == date.today(),
        Cita.prioridad == Prioridad.alta,
        Cita.estado.notin_([EstadoCita.finalizada, EstadoCita.cancelada]),
    )
    if current_user.rol != "admin":
        sede_id = current_user.sede_id
        citas_hoy = citas_hoy.where(Cita.sede_id == sede_id)
        citas_activas = citas_activas.where(Cita.sede_id == sede_id)
        citas_finalizadas = citas_finalizadas.where(Cita.sede_id == sede_id)
        emergencias = emergencias.where(Cita.sede_id == sede_id)

    counts = {}
    for key, query in (
        ("citas_hoy", citas_hoy),
        ("citas_activas", citas_activas),
        ("citas_finalizadas", citas_finalizadas),
        ("emergencias_pendientes", emergencias),
    ):
        result = await db.execute(query)
        counts[key] = result.scalar_one()

    if current_user.rol == "admin":
        for key, model in (("clientes", Cliente), ("mascotas", Mascota)):
            result = await db.execute(select(func.count(model.id)))
            counts[key] = result.scalar_one()
    else:
        result = await db.execute(
            select(func.count(distinct(Mascota.cliente_id)))
            .join(Cita, Cita.mascota_id == Mascota.id)
            .where(Cita.sede_id == current_user.sede_id)
        )
        counts["clientes"] = result.scalar_one()
        result = await db.execute(
            select(func.count(distinct(Cita.mascota_id))).where(
                Cita.sede_id == current_user.sede_id
            )
        )
        counts["mascotas"] = result.scalar_one()

    vets_query = select(func.count(Veterinario.id)).where(Veterinario.activo.is_(True))
    if current_user.rol != "admin":
        vets_query = vets_query.where(Veterinario.sede_id == current_user.sede_id)
    result = await db.execute(vets_query)
    counts["veterinarios_activos"] = result.scalar_one()
    return counts
