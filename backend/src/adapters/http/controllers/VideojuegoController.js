class VideojuegoController {
    constructor(videojuegoService, backupService) {
        this.videojuegoService = videojuegoService;
        this.backupService = backupService; // in case for admin export sql
    }

    async exportarSQL(req, res) {
        try {
            await this.backupService.runBackup();
            res.json({ mensaje: "Archivo database.sql actualizado manualmente!" });
        } catch (error) {
            res.status(500).json({ detail: "Error exportando DB" });
        }
    }

    async listar(req, res) {
        try {
            const juegos = await this.videojuegoService.listarTodos();
            res.json(juegos);
        } catch (e) { res.status(500).json({ detail: "Error interno del servidor" }); }
    }

    async buscarPorId(req, res) {
        try {
            const juego = await this.videojuegoService.buscarPorId(req.params.id);
            res.json(juego);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async buscarAvanzado(req, res) {
        try {
            const r = await this.videojuegoService.busquedaAvanzada(req.query);
            res.json(r);
        } catch (e) { res.status(500).json({ detail: "Error en la búsqueda avanzada" }); }
    }

    async sugerencias(req, res) {
        try {
            const r = await this.videojuegoService.sugerencias(req.query.q);
            res.json(r);
        } catch (e) { res.status(500).json({ detail: e.message }); }
    }

    async porGenero(req, res) {
        try {
            const r = await this.videojuegoService.obtenerPorGenero(req.params.genero);
            res.json(r);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async porDesarrollador(req, res) {
        try {
            const r = await this.videojuegoService.obtenerPorDesarrollador(req.params.desarrollador);
            res.json(r);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async topCalificados(req, res) {
        try {
            const r = await this.videojuegoService.topCalificados(req.query.limite);
            res.json(r);
        } catch (e) { res.status(500).json({ detail: e.message }); }
    }

    async rangoPrecio(req, res) {
        try {
            const r = await this.videojuegoService.rangoPrecio(req.query.min_precio, req.query.max_precio);
            res.json(r);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async estadisticas(req, res) {
        try {
            const r = await this.videojuegoService.estadisticas();
            res.json(r);
        } catch (e) { res.status(500).json({ detail: "Error interno del servidor" }); }
    }

    async crear(req, res) {
        try {
            const juego = await this.videojuegoService.crearVideojuego(req.body);
            res.json(juego);
        } catch (e) { res.status(400).json({ detail: e.message }); }
    }

    async actualizar(req, res) {
        try {
            const juego = await this.videojuegoService.actualizarVideojuego(req.params.id, req.body);
            res.json(juego);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async eliminar(req, res) {
        try {
            const titulo = await this.videojuegoService.eliminarVideojuego(req.params.id);
            res.json({ mensaje: `Videojuego '${titulo}' eliminado correctamente`, id: parseInt(req.params.id) });
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }
}

module.exports = VideojuegoController;
