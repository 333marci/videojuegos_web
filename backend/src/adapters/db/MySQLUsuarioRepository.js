const UsuarioRepository = require('../../ports/UsuarioRepository');
const Usuario = require('../../domain/Usuario');

class MySQLUsuarioRepository extends UsuarioRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Usuario(rows[0]);
    }

    async findByUsernameOrEmail(username, email) {
        const [rows] = await this.pool.query('SELECT id FROM usuarios WHERE username = ? OR email = ?', [username, email]);
        return rows.length > 0;
    }

    async findByUsername(username) {
        const [rows] = await this.pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (rows.length === 0) return null;
        return new Usuario(rows[0]);
    }

    async save(usuario) {
        const [result] = await this.pool.query(
            'INSERT INTO usuarios (username, password_hash, nombre_completo, email, biografia, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario.username, usuario.password_hash, usuario.nombre_completo, usuario.email, usuario.biografia, usuario.avatar_url]
        );
        return result.insertId;
    }

    async update(usuario) {
        await this.pool.query(
            'UPDATE usuarios SET nombre_completo = ?, email = ?, biografia = ?, avatar_url = ? WHERE id = ?',
            [usuario.nombre_completo, usuario.email, usuario.biografia, usuario.avatar_url, usuario.id]
        );
    }

    async getProfileStats(id) {
        const [userRows] = await this.pool.query('SELECT id, username, nombre_completo, biografia, avatar_url, fecha_registro FROM usuarios WHERE id = ?', [id]);
        if (userRows.length === 0) return null;
        
        const [statsRows] = await this.pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM biblioteca WHERE usuario_id = ?) as juegos_jugados,
                (SELECT COUNT(*) FROM resenas WHERE usuario_id = ?) as resenas_escritas,
                (SELECT ROUND(AVG(puntuacion), 1) FROM resenas WHERE usuario_id = ?) as valoracion_media
        `, [id, id, id]);

        return {
            usuario: userRows[0],
            estadisticas: statsRows[0]
        };
    }
}

module.exports = MySQLUsuarioRepository;
