class ResenaRepository {
    async findByVideojuegoId(videojuegoId) { throw new Error('Not implemented'); }
    async findByUserAndVideojuego(usuarioId, videojuegoId) { throw new Error('Not implemented'); }
    async save(resena) { throw new Error('Not implemented'); }
    async update(resena) { throw new Error('Not implemented'); }
    async delete(usuarioId, videojuegoId) { throw new Error('Not implemented'); }
}

module.exports = ResenaRepository;
