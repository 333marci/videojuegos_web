class UsuarioRepository {
    async findById(id) { throw new Error('Not implemented'); }
    async findByUsernameOrEmail(username, email) { throw new Error('Not implemented'); }
    async findByUsername(username) { throw new Error('Not implemented'); }
    async save(usuario) { throw new Error('Not implemented'); }
    async update(usuario) { throw new Error('Not implemented'); }
    async getProfileStats(id) { throw new Error('Not implemented'); }
}

module.exports = UsuarioRepository;
