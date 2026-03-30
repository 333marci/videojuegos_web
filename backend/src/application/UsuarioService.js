class UsuarioService {
    constructor(usuarioRepository, backupService) {
        this.usuarioRepository = usuarioRepository;
        this.backupService = backupService;
    }

    async obtenerPerfil(id) {
        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) throw new Error("Usuario no encontrado");
        return usuario;
    }

    async actualizarPerfil(id, { nombre_completo, email, biografia, avatar_url }) {
        const usuario = await this.obtenerPerfil(id);
        
        // Update fields if provided
        usuario.nombre_completo = nombre_completo !== undefined ? nombre_completo : usuario.nombre_completo;
        usuario.email = email !== undefined ? email : usuario.email;
        usuario.biografia = biografia !== undefined ? biografia : usuario.biografia;
        usuario.avatar_url = avatar_url !== undefined ? avatar_url : usuario.avatar_url;

        await this.usuarioRepository.update(usuario);
        this.backupService.runBackup();
        return usuario;
    }

    async obtenerPerfilPublico(id) {
        const stats = await this.usuarioRepository.getProfileStats(id);
        if (!stats) throw new Error("Usuario no encontrado");
        return stats; // Returns an object with { usuario, estadisticas }
    }
}

module.exports = UsuarioService;
