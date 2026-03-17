# Frontend - Tienda de Videojuegos (GameHub)

## Descripción
Frontend moderno y responsivo para la tienda de videojuegos GameHub, construido con HTML5, CSS3 y JavaScript vanilla. Se conecta a la API REST del backend de FastAPI para gestionar la colección de videojuegos.

## Características principales
✅ Interfaz moderna y responsive  
✅ Visualización de videojuegos en tabla  
✅ Crear, leer, actualizar y eliminar videojuegos (CRUD)  
✅ Búsqueda y filtrado por género  
✅ Panel de estadísticas en tiempo real  
✅ Modal para ver detalles de juegos  
✅ Notificaciones visuales (Toast)  
✅ Validación de formularios  
✅ Diseño atractivo con gradientes y animaciones  

## Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- El backend debe estar ejecutándose en `http://localhost:8000`

## Instalación y Ejecución

### Opción 1: Abrir directamente en el navegador
1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Abre el archivo `index.html` en tu navegador:
   - Haz doble clic en `index.html`, o
   - Click derecho → "Abrir con" → Tu navegador preferido

### Opción 2: Usar un servidor local (Recomendado)
Si tienes Python instalado:
```bash
python -m http.server 3000
```

Luego abre en tu navegador: **http://localhost:3000**

### Opción 3: Usar Live Server en VS Code
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

## Funcionalidades

### 1. Ver Todos los Videojuegos
- La página carga automáticamente los videojuegos del backend
- Se muestran en una tabla con toda la información relevante
- Cada fila incluye botones de acción

### 2. Crear Nuevo Videojuego
- Click en el botón **"Agregar Nuevo Juego"** en la parte superior
- Se abre un modal con un formulario completo
- Rellena todos los campos requeridos:
  - Título
  - Desarrollador
  - Género
  - Año de lanzamiento
  - Calificación (1-10)
  - Precio
  - Descripción
  - Estado de disponibilidad
- Click en **"Guardar"** para crear el videojuego

### 3. Ver Detalles
- Click en el botón **"Ver"** en la tabla
- Se abre un modal con la información completa del videojuego

### 4. Editar Videojuego
- Click en el botón **"Editar"** en la tabla
- El formulario se llena automáticamente con los datos actuales
- Realiza los cambios necesarios
- Click en **"Guardar"** para actualizar

### 5. Eliminar Videojuego
- Click en el botón **"Eliminar"** en la tabla
- Se pedirá confirmación
- Al confirmar, el videojuego se elimina del backend

### 6. Buscar y Filtrar
- **Búsqueda por texto**: Usa el campo "Buscar por título o desarrollador"
  - Busca en tiempo real mientras escribes
- **Filtro por género**: Usa el selectbox de géneros
  - Filtra automáticamente los resultados

### 7. Estadísticas
- Se muestran en la parte superior después del encabezado
- Actualiza automáticamente al crear/editar/eliminar videojuegos
- Muestra:
  - Total de videojuegos
  - Calificación promedio
  - Precio promedio
  - Cantidad de juegos en venta

## Estructura del Código

### index.html
Estructura HTML completa:
- **Navbar**: Barra de navegación con links
- **Hero Section**: Sección principal con CTA
- **Estadísticas**: Tarjetas con datos agregados
- **Filtros**: Búsqueda y filtrado
- **Tabla**: Listado de videojuegos
- **Modales**: Formulario y detalles
- **Toast**: Notificaciones

### styles.css
Estilos organizados por secciones:
- Variables CSS para colores y transiciones
- Estilos de navbar y hero
- Diseño de tarjetas y tablas
- Estilos responsivos
- Animaciones suaves

### script.js
Lógica JavaScript dividida en funciones claras:
- **Inicialización**: Carga de datos al abrir la página
- **Carga**: `cargarVideojuegos()` y `cargarEstadisticas()`
- **Visualización**: `mostrarVideojuegos()`, `verDetalles()`
- **Formulario**: `guardarVideojuego()`, `editarVideojuego()`
- **Filtrado**: `filtrarJuegos()`
- **Notificaciones**: `mostrarNotificacion()`
- **Eliminación**: `eliminarVideojuego()` con confirmación

## Conexión con la API

El frontend se conecta a la API REST del backend en `http://localhost:8000`

### Variables clave en script.js
```javascript
const API_URL = 'http://localhost:8000';
```

### Endpoints que consume
- `GET /videojuegos` - Obtener todos los videojuegos
- `GET /estadisticas` - Obtener estadísticas
- `POST /videojuegos` - Crear nuevo videojuego
- `PUT /videojuegos/{id}` - Actualizar videojuego
- `DELETE /videojuegos/{id}` - Eliminar videojuego

## Manejo de Errores

El frontend incluye manejo robusto de errores:
- Si el backend no está disponible, se muestra un mensaje de error
- Validación de formularios antes de enviar
- Confirmación antes de eliminar
- Mensajes toast informativos tras cada acción

## Notificaciones

Las notificaciones toast se muestran en la esquina superior derecha:
- **Verde (success)**: Operación completada exitosamente
- **Rojo (error)**: Ha ocurrido un error
- **Azul (info)**: Información general

## Estilos y Diseño

### Colores principales
- Púrpura (#7c3aed): Color primario
- Rosa (#ec4899): Color secundario
- Blanco y gris: Fondos y textos

### Características visuales
- Gradientes modernos
- Animaciones suaves
- Efectos hover en botones y tarjetas
- Diseño responsivo para móviles y tablets
- Bootstrap 5 para componentes base
- Font Awesome para iconos

## Validaciones

El formulario valida automáticamente:
- ✅ Campos requeridos presentes
- ✅ Calificación entre 1 y 10
- ✅ Precio positivo
- ✅ Año válido

## Información del Navegador

Se requiere un navegador con soporte para:
- ES6+ JavaScript
- Fetch API
- Bootstrap 5
- CSS Grid y Flexbox

## Troubleshooting

### "No se puede conectar a la API"
1. Verifica que el backend está ejecutándose en `http://localhost:8000`
2. Intenta acceder a `http://localhost:8000/docs` en tu navegador
3. Si ves el Swagger de FastAPI, el backend funciona correctamente

### Los datos no se cargan
1. Abre la consola del navegador (F12)
2. Mira los mensajes de error
3. Verifica que la API URL es correcta

### El modal no se abre
1. Asegúrate de tener JavaScript habilitado
2. Verifica que Bootstrap se cargó correctamente (abre DevTools)

## Próximas mejoras posibles
- Agregar autenticación de usuarios
- Perseguir datos en una base de datos real
- Implementar carrito de compras
- Agregar sistema de reseñas
- Integración con pasarelas de pago

## Archivos incluidos
```
frontend/
├── index.html     (Estructura HTML)
├── styles.css     (Estilos CSS)
├── script.js      (Lógica JavaScript)
└── README.md      (Este archivo)
```

## Autor
Creado como proyecto educativo de tienda de videojuegos.

## Dependencias externas
- Bootstrap 5.3.0 (CDN)
- Font Awesome 6.4.0 (CDN)

Nota: Se utilizan CDN para simplificar la instalación, sin requerir npm o dependencias locales.
