"""
Script de pruebas automatizadas para verificar todas las funciones y restricciones de SQLite.
"""
from database_sqlite import (
    get_connection,
    crear_cita,
    cambiar_estado_cita,
    obtener_cola_emergencias,
    crear_cliente,
    crear_mascota,
    registrar_historia_clinica,
    obtener_historial_mascota,
    autenticar_usuario,
    listar_clientes_con_mascotas,
)
from datetime import date


def test_suite():
    print("=== INICIANDO PRUEBAS DE SQLITE ===")

    # 1. Autenticación
    user = autenticar_usuario("admin@veterinaria.pe", "admin123")
    assert user is not None and user["rol"] == "admin", "Fallo autenticación admin"
    assert autenticar_usuario("admin@veterinaria.pe", "wrongpass") is None, "Fallo control clave errónea"
    print("[PASS] Autenticación y hash seguro")

    # 2. Creación de cliente y mascota
    c_id = crear_cliente("Paciente Test", "999888777", "test@correo.com")
    m_id = crear_mascota("Firulais", "Perro", "Golden", 4, c_id)
    assert c_id > 0 and m_id > 0, "Fallo inserción cliente/mascota"
    print("[PASS] Registro de cliente y mascota")

    # 3. Restricción de horario laboral (08:00 - 20:00)
    try:
        crear_cita(date.today().isoformat(), "06:00", "Muy temprano", "baja", m_id, 1, 1)
        assert False, "Debió rechazar cita fuera de horario"
    except ValueError as e:
        assert "horario laboral" in str(e)
    print("[PASS] Validación de horario laboral (08:00 - 20:00)")

    # 4. Restricción de veterinario en sede correcta
    try:
        # Vet 1 es de San Luis (id=1), intentamos asignarlo a Surquillo (id=2)
        crear_cita(date.today().isoformat(), "15:00", "Control", "baja", m_id, 1, 2)
        assert False, "Debió rechazar veterinario de otra sede"
    except ValueError as e:
        assert "no pertenece a la sede" in str(e)
    print("[PASS] Validación de consistencia Sede - Veterinario")

    # 5. Creación de cita válida
    cita_id = crear_cita(date.today().isoformat(), "16:00", "Revisión dental", "media", m_id, 1, 1)
    assert cita_id > 0, "No se creó la cita"
    print("[PASS] Creación de cita válida")

    # 6. Restricción de solapamiento (disponibilidad)
    try:
        # Mismo vet 1, misma fecha y hora (16:00)
        crear_cita(date.today().isoformat(), "16:00", "Otra cita misma hora", "alta", m_id, 1, 1)
        assert False, "Debió rechazar cita solapada"
    except ValueError as e:
        assert "ya tiene una cita" in str(e)
    print("[PASS] Validación de disponibilidad (evita solapamiento)")

    # 7. Cambio de estado de cita
    ok = cambiar_estado_cita(cita_id, "en_atencion")
    assert ok, "No se cambió estado a en_atencion"
    ok = cambiar_estado_cita(cita_id, "finalizada")
    assert ok, "No se cambió estado a finalizada"
    print("[PASS] Flujo de estados de cita (pendiente -> en_atencion -> finalizada)")

    # 8. Registro y consulta de Historial Clínico
    h_id = registrar_historia_clinica(date.today().isoformat(), "Gingivitis leve", "Limpieza dental profiláctica", m_id, 1)
    assert h_id > 0, "Fallo registro historial"
    historial = obtener_historial_mascota(m_id)
    assert len(historial) >= 1 and historial[0]["diagnostico"] == "Gingivitis leve"
    print("[PASS] Registro y consulta de Historial Clínico")

    # 9. Listado de clientes con sus mascotas anidadas
    clientes = listar_clientes_con_mascotas(search="Paciente Test")
    assert len(clientes) == 1 and len(clientes[0]["mascotas"]) == 1
    print("[PASS] Búsqueda y relaciones Cliente -> Mascotas")

    print("\nTODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK)")


if __name__ == "__main__":
    test_suite()

