class BibliotecaRepository {
    async findByUserId(usuarioId) { throw new Error('Not implemented'); }
    async findByUserAndVideojuego(usuarioId, videojuegoId) { throw new Error('Not implemented'); }
    async save(bibliotecaItem) { throw new Error('Not implemented'); }
    async delete(usuarioId, videojuegoId) { throw new Error('Not implemented'); }
    async findUserActivity(usuarioId, ordenar) { throw new Error('Not implemented'); }
}

module.exports = BibliotecaRepository;
