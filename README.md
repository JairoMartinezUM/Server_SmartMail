# Server_SmartMail
# 📦 SmartMailUM - README

Este proyecto consiste en una aplicación de gestión de paquetería universitaria con una base de datos en **SQL Server** y un backend en **Node.js/Express**. A continuación se detalla la estructura del proyecto, la configuración necesaria y aspectos críticos para su correcto funcionamiento.

---

## 🗂 Estructura del Proyecto

```
SmartMailUM/
│
├── database/
│   └── SmartMailUM_DB_Script.sql   ← Script de creación de la base de datos
│
├── backend/
│   └── server.js                   ← Servidor Express con rutas y conexión a SQL
│
└── README.md
```

> **Nota:** El frontend no está incluido en esta versión, pero el backend está listo para integrarse con cualquier cliente HTTP (React, Angular, etc.).

---

## 🛠️ Configuración de la Base de Datos

### 1. **Crear la base de datos**
Ejecuta el script `SmartMailUM_DB_Script.sql` en **SQL Server Management Studio (SSMS)** o cualquier cliente compatible. Esto:

- Crea la base de datos `SmartMailUM_DB_Prueba`.
- Define las tablas necesarias (`Empleados`, `Paqueteria`, `Info_Paquete`, etc.).
- Inserta datos de ejemplo (usuarios, contenedores, paqueterías, etc.).
- Crea procedimientos almacenados y triggers.
- **Crea un login y usuario específico para la aplicación.**

### 2. ✅ **Importancia crítica del login y usuario (¡NO OMITIR!)**

El backend se conecta a la base de datos usando credenciales específicas. Para que funcione **es obligatorio** crear el login y el usuario como se indica en el script:

```sql
-- Esto debe ejecutarse EN EL SERVIDOR (master), no en la base de datos
CREATE LOGIN SmartMail WITH PASSWORD = 'SmarthMail';

-- Luego, en la base de datos
USE SmartMailUM_DB_Prueba;
CREATE USER SmartMail FROM LOGIN SmartMail;
ALTER ROLE db_owner ADD MEMBER SmartMail;
```

Este paso **es esencial** porque:

- El backend **no usa autenticación de Windows**, sino SQL Server Authentication.
- Sin este login, la conexión fallará con errores de autenticación.
- El script también otorga permisos específicos (`EXECUTE` en el procedimiento `usp_Contenido_Info_Paquete`).

> ⚠️ **Advertencia:** Si omites esta parte, el backend **NO PODRÁ CONECTARSE** a la base de datos, incluso si los datos están correctamente cargados.

---

## ⚙️ Configuración del Backend (`backend/server.js`)

### Parámetros de conexión (modificar según tu entorno)

```js
const config = {
  user: 'SmartMail',          // ← Debe coincidir con el login creado
  password: 'SmarthMail',     // ← Contraseña del login
  server: 'TU_SERVIDOR\\INSTANCIA', // Ej: 'JAIRO_PC\\JAIRO_MARTINEZ'
  database: 'SmartMailUM_DB_Prueba',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
```

> **Asegúrate de:**
> - Reemplazar `server` con el nombre de tu instancia de SQL Server.
> - Verificar que SQL Server permita conexiones SQL (no solo Windows Auth).
> - Habilitar TCP/IP en Configuración de SQL Server si es necesario.

### Endpoints disponibles

| Método | Ruta                  | Descripción                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/test`           | Prueba de conexión a la BD           |
| POST   | `/api/login`          | Autenticación (NO IMPLEMENTADA en este esquema de BD actual – solo ejemplo genérico) |
| GET    | `/api/registros`      | Ejemplo de consulta académica (no relacionada con SmartMail) |
| POST   | `/api/registros`      | Ejemplo de inserción académica       |
| POST   | `/api/regresion`      | Cálculo de regresión lineal múltiple |

> 🔍 **Nota importante:** Las rutas del backend **no están alineadas** con la estructura de la base de datos de paquetería (`SmartMailUM_DB_Prueba`). Actualmente, el backend consulta tablas como `EstadisticasAcademicas` y `Carreras`, que **no existen** en tu script.  
> **Deberás adaptar las consultas en `server.js`** para que usen las tablas reales (`Info_Paquete`, `Empleados`, etc.) según tus necesidades.

---

## ▶️ Cómo Ejecutar

1. **Base de datos:**
   - Ejecutar el script SQL completo en SSMS.
   - Verificar que el login `SmartMail` exista y tenga acceso.

2. **Backend:**
   ```bash
   cd backend
   npm install   # Asegúrate de tener express, mssql, cors, bcrypt, jsonwebtoken
   node server.js
   ```

3. **Probar conexión:**
   ```bash
   curl http://localhost:3000/api/test
   # Debe responder: {"message": "Conexión exitosa a SQL Server"}
   ```

---

## 📌 Recomendaciones

- **Nunca uses contraseñas en texto claro en producción.** Considera variables de entorno.
- El backend actual contiene lógica de otro proyecto (estadísticas académicas). **Debes reescribir las rutas** para interactuar con `Info_Paquete` y otras tablas relevantes.
- Valida y limpia los datos de entrada para evitar inyecciones SQL (aunque `mssql` con parámetros ayuda).
- Los triggers de fecha pueden tener errores lógicos (por ejemplo, `trg_Tiempo_Entrega` inserta en `Info_Paquete` dentro de un trigger de `Info_Paquete` → posible bucle). Revisa su funcionamiento.

---

✅ Con esta configuración, tendrás una base de datos funcional y un backend listo para ser adaptado a las necesidades reales de gestión de paquetería. ¡No olvides el login!
