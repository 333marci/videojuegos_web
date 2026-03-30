class VideojuegoService {
    constructor(videojuegoRepository, backupService) {
        this.videojuegoRepository = videojuegoRepository;
        this.backupService = backupService;
    }

    async listarTodos() {
        return this.videojuegoRepository.findAll();
    }

    async buscarPorId(id) {
        const juego = await this.videojuegoRepository.findById(id);
        if (!juego) throw new Error(`Videojuego con ID ${id} no encontrado`);
        return juego;
    }

    async busquedaAvanzada(criterios) {
        return this.videojuegoRepository.search(criterios);
    }

    async sugerencias(query) {
        if (!query) return [];
        return this.videojuegoRepository.suggest(query);
    }

    async obtenerPorGenero(genero) {
        const juegos = await this.videojuegoRepository.findByGenero(genero);
        if (juegos.length === 0) throw new Error(`No hay videojuegos del género '${genero}'`);
        return juegos;
    }

    async obtenerPorDesarrollador(desarrollador) {
        const juegos = await this.videojuegoRepository.findByDesarrollador(desarrollador);
        if (juegos.length === 0) throw new Error(`No hay videojuegos del desarrollador '${desarrollador}'`);
        return juegos;
    }

    async topCalificados(limite) {
        return this.videojuegoRepository.findTopRated(limite);
    }

    async rangoPrecio(min, max) {
        const juegos = await this.videojuegoRepository.findByPriceRange(min, max);
        if (juegos.length === 0) throw new Error(`No hay videojuegos en el rango $${min} - $${max}`);
        return juegos;
    }

    async estadisticas() {
        return this.videojuegoRepository.getStats();
    }

    async crearVideojuego(datos) {
        if (datos.calificacion < 1 || datos.calificacion > 10) {
            throw new Error("La calificación debe estar entre 1 y 10");
        }
        
        datos.plataforma = datos.plataforma || 'PC';
        datos.motor = datos.motor || 'Desconocido';
        datos.duracion = datos.duracion || 'N/A';
        datos.en_venta = datos.en_venta !== undefined ? datos.en_venta : true;
        
        const result = await this.videojuegoRepository.save(datos);
        this.backupService.runBackup();
        return result;
    }

    async actualizarVideojuego(id, datos) {
        await this.buscarPorId(id); // lanzará error si no existe
        
        if (datos.calificacion !== undefined && (datos.calificacion < 1 || datos.calificacion > 10)) {
            throw new Error("La calificación debe estar entre 1 y 10");
        }

        const actualizado = await this.videojuegoRepository.update(id, datos);
        this.backupService.runBackup();
        return actualizado;
    }

    async eliminarVideojuego(id) {
        const juego = await this.buscarPorId(id);
        await this.videojuegoRepository.delete(id);
        this.backupService.runBackup();
        return juego.titulo;
    }
}

module.exports = VideojuegoService;
