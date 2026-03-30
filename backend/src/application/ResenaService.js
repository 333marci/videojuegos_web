const Resena = require('../domain/Resena');

class ResenaService {
    constructor(resenaRepository, backupService) {
        this.resenaRepository = resenaRepository;
        this.backupService = backupService;
    }

    async obtenerDeVideojuego(videojuegoId) {
        return this.resenaRepository.findByVideojuegoId(videojuegoId);
    }

    async crearResena(usuarioId, videojuegoId, { puntuacion, comentario }) {
        const existente = await this.resenaRepository.findByUserAndVideojuego(usuarioId, videojuegoId);
        if (existente) {
            throw new Error("Ya has dejado una reseña para este videojuego");
        }

        const nueva = new Resena({ usuario_id: usuarioId, videojuego_id: videojuegoId, puntuacion, comentario });
        
        await this.resenaRepository.save(nueva);
        this.backupService.runBackup();
    }

    async actualizarResena(usuarioId, videojuegoId, { puntuacion, comentario }) {
        const resena = new Resena({ usuario_id: usuarioId, videojuego_id: videojuegoId, puntuacion, comentario }); // validates puntuacion
        
        const actualizado = await this.resenaRepository.update(resena);
        if (!actualizado) {
            throw new Error("No se encontró la reseña para modificar");
        }
        
        this.backupService.runBackup();
    }

    async eliminarResena(usuarioId, videojuegoId) {
        const eliminado = await this.resenaRepository.delete(usuarioId, videojuegoId);
        if (!eliminado) {
            throw new Error("No se encontró la reseña para eliminar");
        }
        
        this.backupService.runBackup();
    }
}

module.exports = ResenaService;
