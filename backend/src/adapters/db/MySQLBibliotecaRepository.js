const BibliotecaRepository = require('../../ports/BibliotecaRepository');
const Biblioteca = require('../../domain/Biblioteca');
const Videojuego = require('../../domain/Videojuego');

class MySQLBibliotecaRepository extends BibliotecaRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findByUserId(usuarioId) {
        const [rows] = await this.pool.query(`
            SELECT b.id, b.usuario_id, b.videojuego_id, b.fecha_agregado, 
                   r.puntuacion as mi_puntuacion, r.comentario as mi_comentario,
                   v.*
            FROM biblioteca b
            JOIN videojuegos v ON b.videojuego_id = v.id
            LEFT JOIN resenas r ON (r.videojuego_id = v.id AND r.usuario_id = b.usuario_id)
            WHERE b.usuario_id = ?
            ORDER BY b.fecha_agregado DESC
        `, [usuarioId]);

        return rows.map(r => {
            const videojuego = new Videojuego(r); 
            return new Biblioteca({ ...r, mi_puntuacion: r.mi_puntuacion, mi_comentario: r.mi_comentario, videojuego });
        });
    }

    async findByUserAndVideojuego(usuarioId, videojuegoId) {
        const [rows] = await this.pool.query('SELECT * FROM biblioteca WHERE usuario_id = ? AND videojuego_id = ?', [usuarioId, videojuegoId]);
        if (rows.length === 0) return null;
        return new Biblioteca(rows[0]);
    }

    async save({ usuarioId, videojuegoId }) {
        const [result] = await this.pool.query('INSERT INTO biblioteca (usuario_id, videojuego_id) VALUES (?, ?)', [usuarioId, videojuegoId]);
        return result.insertId;
    }

    async delete(usuarioId, videojuegoId) {
        await this.pool.query('DELETE FROM biblioteca WHERE usuario_id = ? AND videojuego_id = ?', [usuarioId, videojuegoId]);
    }

    async findUserActivity(usuarioId, ordenar) {
        let query = `
            SELECT 
                v.id as videojuego_id, v.titulo, v.imagen_url, v.genero,
                b.fecha_agregado,
                r.puntuacion, r.comentario, r.fecha as fecha_resena
            FROM biblioteca b
            JOIN videojuegos v ON b.videojuego_id = v.id
            LEFT JOIN resenas r ON (b.usuario_id = r.usuario_id AND b.videojuego_id = r.videojuego_id)
            WHERE b.usuario_id = ?
        `;

        if (ordenar === 'puntuacion') {
            query += " ORDER BY r.puntuacion DESC, b.fecha_agregado DESC";
        } else if (ordenar === 'nombre') {
            query += " ORDER BY v.titulo ASC";
        } else {
            query += " ORDER BY b.fecha_agregado DESC";
        }

        const [rows] = await this.pool.query(query, [usuarioId]);
        return rows;
    }
}

module.exports = MySQLBibliotecaRepository;
