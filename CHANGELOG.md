# Changelog

Los cambios importantes de este proyecto se registran aquí.

## [Unreleased]

### Seguridad
- Se eliminaron los valores JWT predeterminados y se requiere configuración por entorno.
- Se reemplazó `python-jose` por PyJWT usando validación explícita de HS256, retirando dependencias con advisories sin parche disponible.
- Se endureció la validación del token y se verifica el estado y rol actual de cada usuario.
- Se añadió RBAC en endpoints, cambio obligatorio de contraseña y gestión de activación/restablecimiento de credenciales.
- Se dejó de versionar `frontend/.env`; se añadió una plantilla sin credenciales.

### Funcionalidades
- Se agregó administración de usuarios y endpoints de gestión de veterinarios, sedes y facturas.
- Se añadieron métricas para el dashboard y el campo DNI de clientes.
- Se agregó un bootstrap de administrador y un generador opt-in de datos ficticios protegido contra uso en producción.

### Base de datos y despliegue
- Se agregó la migración `2c601af1d130_prod_basics` con campos e índices para producción.
- Se agregaron Dockerfiles, proxy Nginx, health checks y configuración de Render.
- Se configuró la ejecución de migraciones antes de iniciar el backend.
- Los health checks de despliegue comprueban también la conexión a la base de datos.

### Pruebas
- Se agregaron pruebas iniciales para configuración, autenticación/autorización y estado de cambio de contraseña.
- Se verificaron la compilación frontend, las pruebas existentes y las migraciones sobre SQLite temporal. No se verificó Supabase ni Docker.

### Pendiente
- Ampliar pruebas de API y alcanzar/medir el objetivo de cobertura.
- Completar limitación de intentos de login, auditoría general de cambios y pruebas de flujo funcional.
- Volver a evaluar advisories en dependencias de desarrollo/build.

