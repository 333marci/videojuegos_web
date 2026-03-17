# Backend API de Videojuegos

## Descripción
Este es un servidor backend construido con **FastAPI** y **Python** que proporciona una API REST para gestionar una colección de videojuegos. El servidor está completamente documentado y listo para funcionar.

## Características
✅ API REST completa (CRUD)  
✅ Validación automática de datos con Pydantic  
✅ CORS habilitado para frontend  
✅ Documentación automática con Swagger/OpenAPI  
✅ Manejo de errores robusto  
✅ Estadísticas de videojuegos  
✅ Búsqueda por género  

## Requisitos
- Python 3.8+
- pip (gestor de paquetes de Python)

## Instalación

1. **Navega a la carpeta del backend:**
```bash
cd backend
```

2. **Instala las dependencias:**
```bash
pip install -r requirements.txt
```

## Ejecución

Para iniciar el servidor:

```bash
python main.py
```

O alternativamente:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en: **http://localhost:8000**

## Documentación Interactiva

Una vez que el servidor esté ejecutándose, puedes acceder a:

- **Swagger UI**: http://localhost:8000/docs - Interfaz interactiva para probar los endpoints
- **ReDoc**: http://localhost:8000/redoc - Documentación alternativa

## Endpoints Disponibles

### 1. Obtener todos los videojuegos
```
GET /videojuegos
```
Devuelve la lista completa de videojuegos.

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "titulo": "Elden Ring",
    "desarrollador": "FromSoftware",
    "genero": "RPG de Acción",
    "anio_lanzamiento": 2022,
    "calificacion": 9.3,
    "descripcion": "Un épico RPG de acción...",
    "precio": 59.99,
    "en_venta": true
  }
]
```

### 2. Obtener un videojuego por ID
```
GET /videojuegos/{id}
```
Obtiene un videojuego específico por su ID.

**Ejemplo:** `GET /videojuegos/1`

### 3. Crear un nuevo videojuego
```
POST /videojuegos
```
Crea un nuevo videojuego en la colección.

**Ejemplo de body:**
```json
{
  "titulo": "Starfield",
  "desarrollador": "Bethesda Game Studios",
  "genero": "RPG de Ciencia Ficción",
  "anio_lanzamiento": 2023,
  "calificacion": 8.6,
  "descripcion": "Un RPG épico de exploración espacial",
  "precio": 69.99,
  "en_venta": true
}
```

### 4. Actualizar un videojuego
```
PUT /videojuegos/{id}
```
Actualiza los datos de un videojuego existente.

**Ejemplo:** `PUT /videojuegos/1`

### 5. Eliminar un videojuego
```
DELETE /videojuegos/{id}
```
Elimina un videojuego de la colección.

**Ejemplo:** `DELETE /videojuegos/1`

### 6. Videojuegos por género
```
GET /videojuegos/genero/{genero}
```
Filtra videojuegos por su género.

**Ejemplo:** `GET /videojuegos/genero/RPG`

### 7. Estadísticas
```
GET /estadisticas
```
Obtiene estadísticas de la colección (promedio de calificaciones, precios, etc.).

## Estructura del Código

- **main.py**: Archivo principal con toda la lógica de la API
  - Modelos de datos (Pydantic)
  - Base de datos en memoria
  - Endpoints (rutas)
  - Validaciones
  - CORS

## Validaciones

El sistema valida automáticamente:
- ✅ Calificación entre 1 y 10
- ✅ Tipos de datos correctos
- ✅ Campos requeridos presentes
- ✅ ID único para cada videojuego

## Manejo de Errores

El servidor devuelve códigos HTTP apropiados:
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Próximos Pasos

Una vez que el backend está funcionando correctamente:
1. El frontend se conectará a `http://localhost:8000`
2. Se crearán páginas HTML/CSS/JavaScript para mostrar los videojuegos
3. Se implementarán formularios para crear/editar/eliminar videojuegos

## Notas Técnicas

- La base de datos es en **memoria** (se reinicia al reiniciar el servidor)
- Para producción, conectarla a PostgreSQL, MongoDB, etc.
- CORS está permitido para todos los orígenes (ajustar en producción)
- FastAPI genera documentación automática en `/docs`
