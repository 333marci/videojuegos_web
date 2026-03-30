const express = require('express');
const router = express.Router();

const { 
    authController, 
    videojuegoController, 
    usuarioController, 
    resenaController, 
    bibliotecaController 
} = require('../../../infrastructure/dependencies');

const { verificarToken, verificarAdmin } = require('../../../infrastructure/authMiddleware');

// ==================== RUTAS DE AUTENTICACIÓN ====================
router.post('/auth/registro', (req, res) => authController.registrar(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/perfil', verificarToken, (req, res) => usuarioController.perfil(req, res));
router.post('/auth/perfil/update', verificarToken, (req, res) => usuarioController.actualizarPerfil(req, res));

// ==================== RUTAS DE PERFIL PÚBLICO ====================
router.get('/usuarios/:id/perfil', (req, res) => usuarioController.perfilPublico(req, res));
router.get('/usuarios/:id/actividad', (req, res) => bibliotecaController.actividadUsuario(req, res));

// ==================== BÚSQUEDA Y LISTADO ====================
router.get('/videojuegos', (req, res) => videojuegoController.listar(req, res));
router.get('/search', (req, res) => videojuegoController.buscarAvanzado(req, res));
router.get('/suggestions', (req, res) => videojuegoController.sugerencias(req, res));
router.get('/videojuegos/genero/:genero', (req, res) => videojuegoController.porGenero(req, res));
router.get('/videojuegos/desarrollador/:desarrollador', (req, res) => videojuegoController.porDesarrollador(req, res));
router.get('/videojuegos/top/calificados', (req, res) => videojuegoController.topCalificados(req, res));
router.get('/videojuegos/rango-precio', (req, res) => videojuegoController.rangoPrecio(req, res));
router.get('/estadisticas', (req, res) => videojuegoController.estadisticas(req, res));
router.get('/videojuegos/:id', (req, res) => videojuegoController.buscarPorId(req, res));

// ==================== CRUD ADMIN VIDEOJUEGOS ====================
router.post('/videojuegos', verificarToken, verificarAdmin, (req, res) => videojuegoController.crear(req, res));
router.put('/videojuegos/:id', verificarToken, verificarAdmin, (req, res) => videojuegoController.actualizar(req, res));
router.delete('/videojuegos/:id', verificarToken, verificarAdmin, (req, res) => videojuegoController.eliminar(req, res));
router.get('/admin/export-sql', verificarToken, verificarAdmin, (req, res) => videojuegoController.exportarSQL(req, res));

// ==================== RUTAS DE RESEÑAS ====================
router.get('/videojuegos/:id/resenas', (req, res) => resenaController.listar(req, res));
router.post('/videojuegos/:id/resenas', verificarToken, (req, res) => resenaController.crear(req, res));
router.put('/videojuegos/:id/resenas', verificarToken, (req, res) => resenaController.actualizar(req, res));
router.delete('/videojuegos/:id/resenas', verificarToken, (req, res) => resenaController.eliminar(req, res));

// ==================== RUTAS DE BIBLIOTECA ====================
router.get('/auth/biblioteca', verificarToken, (req, res) => bibliotecaController.miBiblioteca(req, res));
router.post('/auth/biblioteca', verificarToken, (req, res) => bibliotecaController.anadir(req, res));
router.delete('/auth/biblioteca/:id', verificarToken, (req, res) => bibliotecaController.eliminar(req, res));

// Ruta base
router.get('/', (req, res) => {
    res.json({
        "mensaje": "Bienvenido a la API de Videojuegos (Hexagonal)",
        "version": "1.0.0"
    });
});

module.exports = router;
