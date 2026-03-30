class VideojuegoRepository {
    async findAll() { throw new Error('Not implemented'); }
    async findById(id) { throw new Error('Not implemented'); }
    async search(criterios) { throw new Error('Not implemented'); }
    async suggest(query) { throw new Error('Not implemented'); }
    async findByGenero(genero) { throw new Error('Not implemented'); }
    async findByDesarrollador(desarrollador) { throw new Error('Not implemented'); }
    async findTopRated(limite) { throw new Error('Not implemented'); }
    async findByPriceRange(min, max) { throw new Error('Not implemented'); }
    async getStats() { throw new Error('Not implemented'); }
    async save(videojuego) { throw new Error('Not implemented'); }
    async update(id, videojuego) { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
}

module.exports = VideojuegoRepository;
