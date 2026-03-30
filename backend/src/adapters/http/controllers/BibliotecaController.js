class BibliotecaController {
    constructor(bibliotecaService) {
        this.bibliotecaService = bibliotecaService;
    }

    async miBiblioteca(req, res) {
        try {
            const r = await this.bibliotecaService.obtenerBiblioteca(req.usuario_id);
            const resultados = r.map(b => ({
                ...b.videojuego,
                mi_puntuacion: b.mi_puntuacion,
                mi_comentario: b.mi_comentario
            }));
            res.json(resultados);
        } catch (e) { res.status(500).json({ detail: "Error al obtener tu biblioteca" }); }
    }

    async anadir(req, res) {
        try {
            if (!req.body.videojuego_id) throw new Error("ID de videojuego requerido");
            await this.bibliotecaService.anadirJuego(req.usuario_id, req.body.videojuego_id);
            res.status(201).json({ mensaje: "Juego añadido a tu biblioteca" });
        } catch (e) { res.status(400).json({ detail: e.message }); }
    }

    async eliminar(req, res) {
        try {
            await this.bibliotecaService.eliminarJuego(req.usuario_id, req.params.id);
            res.json({ mensaje: "Juego eliminado de tu biblioteca" });
        } catch (e) { res.status(500).json({ detail: "Error al eliminar de la biblioteca" }); }
    }

    async actividadUsuario(req, res) {
        try {
            const r = await this.bibliotecaService.actividadUsuario(req.params.id, req.query.ordenar);
            res.json(r);
        } catch (e) { res.status(500).json({ detail: "Error al obtener actividad del usuario" }); }
    }
}

module.exports = BibliotecaController;
