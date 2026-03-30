class BibliotecaService {
    constructor(bibliotecaRepository, backupService) {
        this.bibliotecaRepository = bibliotecaRepository;
        this.backupService = backupService;
    }

    async obtenerBiblioteca(usuarioId) {
        return this.bibliotecaRepository.findByUserId(usuarioId);
    }

    async anadirJuego(usuarioId, videojuegoId) {
        const existe = await this.bibliotecaRepository.findByUserAndVideojuego(usuarioId, videojuegoId);
        if (existe) {
            throw new Error("Este juego ya está en tu biblioteca");
        }

        await this.bibliotecaRepository.save({ usuarioId, videojuegoId });
        this.backupService.runBackup();
    }

    async eliminarJuego(usuarioId, videojuegoId) {
        await this.bibliotecaRepository.delete(usuarioId, videojuegoId);
        this.backupService.runBackup();
    }

    async actividadUsuario(usuarioId, ordenar) {
        return this.bibliotecaRepository.findUserActivity(usuarioId, ordenar);
    }
}

module.exports = BibliotecaService;
