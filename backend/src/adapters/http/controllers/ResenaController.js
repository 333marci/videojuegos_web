class ResenaController {
    constructor(resenaService) {
        this.resenaService = resenaService;
    }

    async listar(req, res) {
        try {
            const r = await this.resenaService.obtenerDeVideojuego(req.params.id);
            res.json(r);
        } catch (e) { res.status(500).json({ detail: "Error al obtener reseñas" }); }
    }

    async crear(req, res) {
        try {
            await this.resenaService.crearResena(req.usuario_id, req.params.id, req.body);
            res.status(201).json({ mensaje: "Reseña añadida correctamente" });
        } catch (e) { res.status(400).json({ detail: e.message }); }
    }

    async actualizar(req, res) {
        try {
            await this.resenaService.actualizarResena(req.usuario_id, req.params.id, req.body);
            res.json({ mensaje: "Reseña actualizada correctamente" });
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async eliminar(req, res) {
        try {
            await this.resenaService.eliminarResena(req.usuario_id, req.params.id);
            res.json({ mensaje: "Reseña eliminada correctamente" });
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }
}

module.exports = ResenaController;
