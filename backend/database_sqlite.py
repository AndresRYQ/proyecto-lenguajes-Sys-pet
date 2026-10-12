"""
Módulo de Base de Datos SQLite3 para Veterinaria Oyanguren.
Contiene la creación d
e tablas, relaciones (Foreign Keys), restricciones y
las funciones de negocio del sistema (citas, emergencias, clientes, mascotas, historial, etc.)
utilizando la biblioteca estándar sqlite3 de Python.
"""

import sqlite3
import hashlib
import os
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "veterinaria.db")

HORA_INICIO = time(8, 0)
HORA_FIN = time(20, 0)


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    """Retorna una conexión a SQLite con soporte de claves foráneas y filas como diccionarios."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def hash_password(password: str) -> str:
    """Genera un hash seguro SHA-256 con salt para contraseñas usando la biblioteca estándar."""
    salt = "veterinaria_salt_2026"
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña coincide con el hash."""
    return hash_password(plain_password) == hashed_password


# ==============================================================================
# CREACIÓN DE TABLAS (DDL)
# ==============================================================================

def crear_tablas(db_path: str = DB_PATH) -> None:
    """Crea todas las tablas del sistema veterinario en SQLite con sus restricciones."""
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # 1. Sedes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sedes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        direccion TEXT NOT NULL
    );
    """)

    # 2. Usuarios
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('admin', 'recepcionista', 'veterinario')),
        sede_id INTEGER NOT NULL,
        FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
    );
    """)

    # 3. Veterinarios
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS veterinarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especialidad TEXT,
        sede_id INTEGER NOT NULL,
        FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
    );
    """)

    # 4. Clientes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT UNIQUE
    );
    """)

    # 5. Mascotas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mascotas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especie TEXT NOT NULL,
        raza TEXT,
        edad INTEGER,
        cliente_id INTEGER NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
    """)

    # 6. Citas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS citas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL, -- Formato 'YYYY-MM-DD'
        hora TEXT NOT NULL,  -- Formato 'HH:MM:SS' o 'HH:MM'
        estado TEXT NOT NULL DEFAULT 'pendiente' 
            CHECK(estado IN ('pendiente', 'confirmada', 'en_atencion', 'finalizada', 'cancelada')),
        motivo TEXT,
        prioridad TEXT NOT NULL DEFAULT 'media' 
            CHECK(prioridad IN ('baja', 'media', 'alta')),
        mascota_id INTEGER NOT NULL,
        veterinario_id INTEGER NOT NULL,
        sede_id INTEGER NOT NULL,
        FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE RESTRICT,
        FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id) ON DELETE RESTRICT,
        FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
    );
    """)

    # 7. Historias Clínicas
    cursor.execute("""
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
    """)

    # 8. Atenciones
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS atenciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        observaciones TEXT,
        cita_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
    );
    """)

    # 9. Facturas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        total REAL NOT NULL,
        cita_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
    );
    """)

    # Índices para optimización de consultas
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_citas_sede ON citas(sede_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_citas_vet ON citas(veterinario_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas(cliente_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_historial_mascota ON historias_clinicas(mascota_id);")

    conn.commit()
    conn.close()
    print("[OK] Tablas e indices creados exitosamente en SQLite.")


# ==============================================================================
# FUNCIONES DE NEGOCIO Y OPERACIONES
# ==============================================================================

def sembrar_datos_iniciales(db_path: str = DB_PATH) -> None:
    """Inserta sedes, administrador, recepcionista, veterinarios, clientes, mascotas y citas iniciales."""
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM sedes;")
    if cursor.fetchone()[0] > 0:
        print("! La base de datos ya contiene datos.")
        conn.close()
        return

    # Sedes
    cursor.execute("INSERT INTO sedes (nombre, direccion) VALUES (?, ?);", ("San Luis", "Av. San Luis 123, San Luis"))
    san_luis_id = cursor.lastrowid
    cursor.execute("INSERT INTO sedes (nombre, direccion) VALUES (?, ?);", ("Surquillo", "Av. Republica de Panama 456, Surquillo"))
    surquillo_id = cursor.lastrowid

    # Usuarios
    cursor.execute("""
    INSERT INTO usuarios (nombre, email, password_hash, rol, sede_id)
    VALUES (?, ?, ?, ?, ?);
    """, ("Administrador", "admin@veterinaria.pe", hash_password("admin123"), "admin", san_luis_id))

    cursor.execute("""
    INSERT INTO usuarios (nombre, email, password_hash, rol, sede_id)
    VALUES (?, ?, ?, ?, ?);
    """, ("Recepcionista San Luis", "recepcion.sl@veterinaria.pe", hash_password("recep123"), "recepcionista", san_luis_id))

    # Veterinarios
    vets_data = [
        ("Dr. Carlos Ramírez", "Medicina General", san_luis_id),
        ("Dra. María García", "Cirugía", san_luis_id),
        ("Dr. Luis Torres", "Dermatología", surquillo_id),
        ("Dra. Ana Quispe", "Oftalmología", surquillo_id),
    ]
    cursor.executemany("INSERT INTO veterinarios (nombre, especialidad, sede_id) VALUES (?, ?, ?);", vets_data)

    # Clientes
    clientes_data = [
        ("Juan Pérez", "987654321", "juan@gmail.com"),
        ("Ana Torres", "912345678", "ana@gmail.com"),
        ("Roberto Silva", "956781234", "roberto@gmail.com"),
    ]
    cursor.executemany("INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?);", clientes_data)

    # Mascotas
    mascotas_data = [
        ("Rex", "Perro", "Labrador", 3, 1),
        ("Michi", "Gato", "Siamés", 2, 1),
        ("Toby", "Perro", "Beagle", 5, 2),
        ("Luna", "Gato", "Persa", 1, 3),
    ]
    cursor.executemany("INSERT INTO mascotas (nombre, especie, raza, edad, cliente_id) VALUES (?, ?, ?, ?, ?);", mascotas_data)

    # Citas
    hoy_str = date.today().isoformat()
    citas_data = [
        (hoy_str, "09:00", "pendiente", "Vacunación anual", "media", 1, 1, san_luis_id),
        (hoy_str, "10:30", "confirmada", "Revisión general y desparasitación", "baja", 3, 2, san_luis_id),
        (hoy_str, "11:00", "pendiente", "Dificultad respiratoria súbita", "alta", 2, 1, san_luis_id),
    ]
    cursor.executemany("""
    INSERT INTO citas (fecha, hora, estado, motivo, prioridad, mascota_id, veterinario_id, sede_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, citas_data)

    conn.commit()
    conn.close()
    print("[OK] Datos iniciales sembrados con exito.")


# --- VALIDACIONES DE REGLAS DE NEGOCIO ---

def validar_horario(hora_str: str) -> bool:
    """Verifica que la hora de la cita esté dentro del horario laboral (08:00 - 20:00)."""
    h_parts = [int(p) for p in hora_str.split(":")[:2]]
    t = time(h_parts[0], h_parts[1])
    return HORA_INICIO <= t <= HORA_FIN


def validar_disponibilidad(vet_id: int, fecha: str, hora: str, exclude_id: Optional[int] = None, db_path: str = DB_PATH) -> bool:
    """Verifica que el veterinario no tenga otra cita activa en esa misma fecha y hora."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = """
    SELECT id FROM citas 
    WHERE veterinario_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
    """
    params = [vet_id, fecha, hora]
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    cursor.execute(query, params)
    conflict = cursor.fetchone()
    conn.close()
    return conflict is None


def validar_sede_veterinario(vet_id: int, sede_id: int, db_path: str = DB_PATH) -> bool:
    """Verifica que el veterinario pertenezca a la sede especificada."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT sede_id FROM veterinarios WHERE id = ?;", (vet_id,))
    row = cursor.fetchone()
    conn.close()
    return row is not None and row["sede_id"] == sede_id


# --- GESTIÓN DE CITAS ---

def crear_cita(fecha: str, hora: str, motivo: str, prioridad: str, mascota_id: int, veterinario_id: int, sede_id: int, db_path: str = DB_PATH) -> int:
    """Crea una cita validando horario, disponibilidad y sede del veterinario."""
    if not validar_horario(hora):
        raise ValueError("La cita debe estar dentro del horario laboral (08:00 - 20:00).")
    if not validar_sede_veterinario(veterinario_id, sede_id, db_path):
        raise ValueError("El veterinario no pertenece a la sede indicada.")
    if not validar_disponibilidad(veterinario_id, fecha, hora, db_path=db_path):
        raise ValueError("El veterinario ya tiene una cita asignada en ese horario.")

    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO citas (fecha, hora, estado, motivo, prioridad, mascota_id, veterinario_id, sede_id)
    VALUES (?, ?, 'pendiente', ?, ?, ?, ?, ?);
    """, (fecha, hora, motivo, prioridad, mascota_id, veterinario_id, sede_id))
    cita_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return cita_id


def listar_citas(sede_id: Optional[int] = None, fecha: Optional[str] = None, estado: Optional[str] = None, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Lista las citas con información combinada de mascota, cliente, veterinario y sede."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = """
    SELECT 
        c.id, c.fecha, c.hora, c.estado, c.motivo, c.prioridad,
        m.nombre AS mascota_nombre, m.especie AS mascota_especie,
        cl.nombre AS cliente_nombre, cl.telefono AS cliente_telefono,
        v.nombre AS veterinario_nombre,
        s.nombre AS sede_nombre
    FROM citas c
    JOIN mascotas m ON c.mascota_id = m.id
    JOIN clientes cl ON m.cliente_id = cl.id
    JOIN veterinarios v ON c.veterinario_id = v.id
    JOIN sedes s ON c.sede_id = s.id
    WHERE 1=1
    """
    params = []
    if sede_id is not None:
        query += " AND c.sede_id = ?"
        params.append(sede_id)
    if fecha is not None:
        query += " AND c.fecha = ?"
        params.append(fecha)
    if estado is not None:
        query += " AND c.estado = ?"
        params.append(estado)

    query += " ORDER BY c.fecha, c.hora;"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def cambiar_estado_cita(cita_id: int, nuevo_estado: str, db_path: str = DB_PATH) -> bool:
    """Actualiza el estado de una cita ('pendiente', 'confirmada', 'en_atencion', 'finalizada', 'cancelada')."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("UPDATE citas SET estado = ? WHERE id = ?;", (nuevo_estado, cita_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected


def obtener_cola_emergencias(sede_id: int, fecha: str, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """
    Retorna la cola de atención ordenada por prioridad (alta > media > baja) y luego por hora.
    Solo incluye citas activas (no canceladas ni finalizadas).
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = """
    SELECT 
        c.id, c.fecha, c.hora, c.estado, c.motivo, c.prioridad,
        m.nombre AS mascota_nombre, m.especie AS mascota_especie,
        cl.nombre AS cliente_nombre, cl.telefono AS cliente_telefono,
        v.nombre AS veterinario_nombre
    FROM citas c
    JOIN mascotas m ON c.mascota_id = m.id
    JOIN clientes cl ON m.cliente_id = cl.id
    JOIN veterinarios v ON c.veterinario_id = v.id
    WHERE c.sede_id = ? AND c.fecha = ? AND c.estado NOT IN ('cancelada', 'finalizada')
    ORDER BY 
        CASE c.prioridad
            WHEN 'alta' THEN 1
            WHEN 'media' THEN 2
            WHEN 'baja' THEN 3
            ELSE 4
        END,
        c.hora ASC;
    """
    cursor.execute(query, (sede_id, fecha))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


# --- GESTIÓN DE CLIENTES Y MASCOTAS ---

def crear_cliente(nombre: str, telefono: str, email: str, db_path: str = DB_PATH) -> int:
    """Registra un nuevo cliente."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?);", (nombre, telefono, email))
    cliente_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return cliente_id


def crear_mascota(nombre: str, especie: str, raza: str, edad: int, cliente_id: int, db_path: str = DB_PATH) -> int:
    """Registra una mascota asignada a un cliente."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO mascotas (nombre, especie, raza, edad, cliente_id)
    VALUES (?, ?, ?, ?, ?);
    """, (nombre, especie, raza, edad, cliente_id))
    mascota_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return mascota_id


def listar_clientes_con_mascotas(search: str = "", db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Lista clientes con búsqueda opcional por nombre, teléfono o email."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = "SELECT * FROM clientes WHERE nombre LIKE ? OR email LIKE ? OR telefono LIKE ? ORDER BY nombre;"
    term = f"%{search}%"
    cursor.execute(query, (term, term, term))
    clientes = [dict(r) for r in cursor.fetchall()]

    for cliente in clientes:
        cursor.execute("SELECT * FROM mascotas WHERE cliente_id = ?;", (cliente["id"],))
        cliente["mascotas"] = [dict(m) for m in cursor.fetchall()]

    conn.close()
    return clientes


# --- HISTORIAL CLÍNICO ---

def registrar_historia_clinica(fecha: str, diagnostico: str, tratamiento: str, mascota_id: int, veterinario_id: int, db_path: str = DB_PATH) -> int:
    """Agrega una entrada al historial clínico de una mascota."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO historias_clinicas (fecha, diagnostico, tratamiento, mascota_id, veterinario_id)
    VALUES (?, ?, ?, ?, ?);
    """, (fecha, diagnostico, tratamiento, mascota_id, veterinario_id))
    historia_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return historia_id


def obtener_historial_mascota(mascota_id: int, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Obtiene el historial clínico completo de una mascota en orden cronológico descendente."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = """
    SELECT h.id, h.fecha, h.diagnostico, h.tratamiento, v.nombre AS veterinario_nombre
    FROM historias_clinicas h
    JOIN veterinarios v ON h.veterinario_id = v.id
    WHERE h.mascota_id = ?
    ORDER BY h.fecha DESC, h.id DESC;
    """
    cursor.execute(query, (mascota_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


# --- AUTENTICACIÓN ---

def autenticar_usuario(email: str, password_plana: str, db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
    """Verifica credenciales de usuario."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, email, password_hash, rol, sede_id FROM usuarios WHERE email = ?;", (email,))
    user = cursor.fetchone()
    conn.close()
    if user and verify_password(password_plana, user["password_hash"]):
        user_dict = dict(user)
        del user_dict["password_hash"]
        return user_dict
    return None


if __name__ == "__main__":
    print(f"--- Inicializando SQLite en {DB_PATH} ---")
    crear_tablas()
    sembrar_datos_iniciales()
    print("\n--- Verificación de citas registradas ---")
    citas = listar_citas()
    for c in citas:
        print(f"[{c['hora']}] ({c['estado'].upper()}) Mascota: {c['mascota_nombre']} | Dueño: {c['cliente_nombre']} | Vet: {c['veterinario_nombre']} | Prioridad: {c['prioridad']}")
    
    print("\n--- Verificación de Cola de Emergencias (Sede San Luis) ---")
    hoy = date.today().isoformat()
    cola = obtener_cola_emergencias(sede_id=1, fecha=hoy)
    for pos, c in enumerate(cola, 1):
        print(f"#{pos} [Prioridad: {c['prioridad'].upper()}] {c['hora']} - {c['mascota_nombre']} ({c['motivo']})")
