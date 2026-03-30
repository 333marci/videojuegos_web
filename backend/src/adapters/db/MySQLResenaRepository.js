const ResenaRepository = require('../../ports/ResenaRepository');
const Resena = require('../../domain/Resena');

class MySQLResenaRepository extends ResenaRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findByVideojuegoId(videojuegoId) {
        const [rows] = await this.pool.query(`
            SELECT r.id, r.puntuacion, r.comentario, r.fecha, u.username, u.avatar_url, r.usuario_id, r.videojuego_id
            FROM resenas r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.videojuego_id = ?
            ORDER BY r.fecha DESC
        `, [videojuegoId]);
        
        return rows.map(r => new Resena(r));
    }

    async findByUserAndVideojuego(usuarioId, videojuegoId) {
        const [rows] = await this.pool.query('SELECT r.*, u.username, u.avatar_url FROM resenas r JOIN usuarios u ON r.usuario_id = u.id WHERE r.usuario_id = ? AND r.videojuego_id = ?', [usuarioId, videojuegoId]);
        if (rows.length === 0) return null;
        return new Resena(rows[0]);
    }

    async save(resena) {
        const [result] = await this.pool.query(
            'INSERT INTO resenas (usuario_id, videojuego_id, puntuacion, comentario) VALUES (?, ?, ?, ?)',
            [resena.usuario_id, resena.videojuego_id, resena.puntuacion, resena.comentario]
        );
        resena.id = result.insertId;
        return resena;
    }

    async update(resena) {
        const [result] = await this.pool.query(
            'UPDATE resenas SET puntuacion = ?, comentario = ?, fecha = CURRENT_TIMESTAMP WHERE usuario_id = ? AND videojuego_id = ?',
            [resena.puntuacion, resena.comentario, resena.usuario_id, resena.videojuego_id]
        );
        return result.affectedRows > 0;
    }

    async delete(usuarioId, videojuegoId) {
        const [result] = await this.pool.query(
            'DELETE FROM resenas WHERE usuario_id = ? AND videojuego_id = ?',
            [usuarioId, videojuegoId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MySQLResenaRepository;
