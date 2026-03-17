# GameHub - Gestión de Videojuegos 🎮

Proyecto web integral para la gestión, reseña y organización de colecciones de videojuegos. Desarrollado con una arquitectura moderna que combina un backend robusto en Node.js y un frontend dinámico basado en Bootstrap.

## 🚀 Características Principales

- **Gestión Completa (CRUD)**: Añade, edita y elimina videojuegos (exclusivo para administradores).
- **Sistema de Usuarios**: Registro, inicio de sesión y perfiles personalizados con avatars dinámicos.
- **Biblioteca Personal**: Guarda los juegos que has jugado y mantén un registro de tu colección.
- **Reseñas y Calificaciones**: Comparte tu opinión con la comunidad y califica tus juegos favoritos.
- **Búsqueda Avanzada**: Filtros por género, plataforma, año y puntuación mínima.
- **Estadísticas en Tiempo Real**: Visualización global de la colección.
- **Comparador de Juegos**: Compara especificaciones y precios entre dos juegos.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 (Vanilla), Bootstrap 5, Font Awesome.
- **Backend**: Node.js, Express.
- **Base de Datos**: MySQL (utilizando `mysql2/promise`).
- **Autenticación**: JSON Web Tokens (JWT) y bcryptjs para hashing de contraseñas.

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [MySQL Server](https://www.mysql.com/) (v8.0 sugerido)

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd videojuegos_web
   ```

2. **Configurar la Base de Datos**:
   - Crea una base de datos llamada `videojuegos_db`.
   - Importa el archivo `database.sql` ubicado en la raíz del proyecto para crear las tablas e insertar los datos iniciales.

3. **Configurar el Backend**:
   - Navega a la carpeta backend: `cd backend`
   - Instala las dependencias: `npm install`
   - Configura las variables de entorno en el archivo `.env`:
     ```env
     PORT=8000
     DB_HOST=localhost
     DB_USER=tu_usuario
     DB_PASSWORD=tu_password
     DB_NAME=videojuegos_db
     DB_PORT=3306
     JWT_SECRET=tu_secreto_seguro
     ```

4. **Ejecutar la Aplicación**:
   - Inicia el servidor: `npm start` o `node server.js`
   - Abre `frontend/index.html` en tu navegador (o usa una extensión como Live Server).

## 🛡️ Acceso de Administrador

Para probar las funciones de gestión, puedes usar la cuenta de administrador predeterminada:
- **Usuario**: `admin`
- **Contraseña**: `123456`

## 📁 Estructura del Proyecto

- `/backend`: Servidor API y lógica de negocio.
- `/frontend`: Interfaz de usuario y scripts del cliente.
- `/docs`: Documentación detallada y diagramas de arquitectura.
- `database.sql`: Esquema unificado para MySQL.

---
© 2024 GameHub - Desarrollado para amantes de los videojuegos.
