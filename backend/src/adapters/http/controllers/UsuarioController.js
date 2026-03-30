class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }

    async perfil(req, res) {
        try {
            const usuario = await this.usuarioService.obtenerPerfil(req.usuario_id);
            res.json(usuario);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }

    async actualizarPerfil(req, res) {
        try {
            const usuario = await this.usuarioService.actualizarPerfil(req.usuario_id, req.body);
            res.json({ mensaje: "Perfil actualizado correctamente", usuario });
        } catch (e) { res.status(500).json({ detail: e.message }); }
    }

    async perfilPublico(req, res) {
        try {
            const id = req.params.id;
            const data = await this.usuarioService.obtenerPerfilPublico(id);
            res.json(data);
        } catch (e) { res.status(404).json({ detail: e.message }); }
    }
}

module.exports = UsuarioController;
