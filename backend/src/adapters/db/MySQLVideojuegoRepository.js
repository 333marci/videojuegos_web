const VideojuegoRepository = require('../../ports/VideojuegoRepository');
const Videojuego = require('../../domain/Videojuego');

class MySQLVideojuegoRepository extends VideojuegoRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findAll() {
        const [rows] = await this.pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real, COUNT(r.id) as total_resenas
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            GROUP BY v.id
        `);
        return rows.map(r => new Videojuego(r));
    }

    async findById(id) {
        const [rows] = await this.pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real, COUNT(r.id) as total_resenas
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            WHERE v.id = ?
            GROUP BY v.id
        `, [id]);
        if (rows.length === 0) return null;
        return new Videojuego(rows[0]);
    }

    async search({ nombre, genero, plataforma, anio, precio_min, precio_max, puntuacion_min, ordenar, limit, offset }) {
        let query = `
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real, COUNT(r.id) as total_resenas
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            WHERE 1=1
        `;
        const params = [];

        if (nombre) {
            query += ` AND (LOWER(v.titulo) LIKE LOWER(?) OR LOWER(v.desarrollador) LIKE LOWER(?))`;
            params.push(`%${nombre}%`, `%${nombre}%`);
        }
        if (genero) {
            query += ` AND v.genero = ?`; params.push(genero);
        }
        if (plataforma) {
            query += ` AND v.plataforma LIKE ?`; params.push(`%${plataforma}%`);
        }
        if (anio) {
            query += ` AND v.anio_lanzamiento = ?`; params.push(anio);
        }
        if (precio_min !== undefined) {
            query += ` AND v.precio >= ?`; params.push(precio_min);
        }
        if (precio_max !== undefined) {
            query += ` AND v.precio <= ?`; params.push(precio_max);
        }
        if (puntuacion_min) {
            query += ` AND (SELECT COALESCE(AVG(puntuacion), v.calificacion) FROM resenas WHERE videojuego_id = v.id) >= ?`;
            params.push(puntuacion_min);
        }

        query += " GROUP BY v.id";

        switch (ordenar) {
            case 'puntuacion': query += " ORDER BY calificacion_real DESC"; break;
            case 'fecha': query += " ORDER BY v.anio_lanzamiento DESC"; break;
            case 'popularidad': query += " ORDER BY v.popularidad DESC, total_resenas DESC"; break;
            case 'alfabetico': query += " ORDER BY v.titulo ASC"; break;
            default: query += " ORDER BY v.titulo ASC";
        }

        const [totalRows] = await this.pool.query(`SELECT COUNT(*) as count FROM (${query}) as sub`, params);
        const l = parseInt(limit) || 12;
        const o = parseInt(offset) || 0;
        
        query += " LIMIT ? OFFSET ?";
        params.push(l, o);

        const [rows] = await this.pool.query(query, params);
        return {
            total: totalRows[0].count,
            limit: l,
            offset: o,
            resultados: rows.map(r => new Videojuego(r))
        };
    }

    async suggest(query) {
        const [rows] = await this.pool.query(
            "SELECT id, titulo, genero, imagen_url FROM videojuegos WHERE LOWER(titulo) LIKE ? LIMIT 5",
            [`%${query.toLowerCase()}%`]
        );
        return rows;
    }

    async findByGenero(genero) {
        const [rows] = await this.pool.query('SELECT * FROM videojuegos WHERE LOWER(genero) LIKE ?', [`%${genero.toLowerCase()}%`]);
        return rows.map(r => new Videojuego(r));
    }

    async findByDesarrollador(desarrollador) {
        const [rows] = await this.pool.query('SELECT * FROM videojuegos WHERE LOWER(desarrollador) LIKE ?', [`%${desarrollador.toLowerCase()}%`]);
        return rows.map(r => new Videojuego(r));
    }

    async findTopRated(limite) {
        let lim = parseInt(limite) || 5;
        lim = Math.min(lim, 5);
        const [rows] = await this.pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            GROUP BY v.id
            ORDER BY calificacion_real DESC 
            LIMIT ?
        `, [lim]);
        return rows.map(r => new Videojuego(r));
    }

    async findByPriceRange(min, max) {
        const [rows] = await this.pool.query('SELECT * FROM videojuegos WHERE precio >= ? AND precio <= ?', [min, max]);
        return rows.map(r => new Videojuego(r));
    }

    async getStats() {
        const [rows] = await this.pool.query(`
            SELECT 
                COUNT(DISTINCT v.id) as total_videojuegos,
                AVG(COALESCE(rs.avg_puntos, v.calificacion)) as calificacion_promedio,
                AVG(v.precio) as precio_promedio,
                MAX(v.precio) as precio_maximo,
                MIN(v.precio) as precio_minimo,
                SUM(CASE WHEN v.en_venta = TRUE THEN 1 ELSE 0 END) as juegos_en_venta
            FROM videojuegos v
            LEFT JOIN (
                SELECT videojuego_id, AVG(puntuacion) as avg_puntos 
                FROM resenas 
                GROUP BY videojuego_id
            ) rs ON v.id = rs.videojuego_id
        `);
        
        const s = rows[0];
        return {
            total_videojuegos: parseInt(s.total_videojuegos) || 0,
            calificacion_promedio: s.calificacion_promedio ? Number(parseFloat(s.calificacion_promedio).toFixed(2)) : 0,
            precio_promedio: s.precio_promedio ? parseFloat(s.precio_promedio) : 0,
            precio_maximo: s.precio_maximo ? parseFloat(s.precio_maximo) : 0,
            precio_minimo: s.precio_minimo ? parseFloat(s.precio_minimo) : 0,
            juegos_en_venta: s.juegos_en_venta ? parseInt(s.juegos_en_venta) : 0
        };
    }

    async save(videojuego) {
        const [result] = await this.pool.query(
            'INSERT INTO videojuegos (titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [videojuego.titulo, videojuego.desarrollador, videojuego.genero, videojuego.anio_lanzamiento, videojuego.calificacion, videojuego.descripcion, videojuego.precio, videojuego.en_venta ? 1 : 0, videojuego.imagen_url || '', videojuego.enlace_compra || '', videojuego.plataforma || 'PC', videojuego.motor || 'Desconocido', videojuego.duracion || 'N/A', videojuego.popularidad || 0]
        );
        return { id: result.insertId, ...videojuego };
    }

    async update(id, videojuego) {
        await this.pool.query(
            'UPDATE videojuegos SET titulo=?, desarrollador=?, genero=?, anio_lanzamiento=?, calificacion=?, descripcion=?, precio=?, en_venta=?, imagen_url=?, enlace_compra=?, plataforma=?, motor=?, duracion=?, popularidad=? WHERE id=?',
            [videojuego.titulo, videojuego.desarrollador, videojuego.genero, videojuego.anio_lanzamiento, videojuego.calificacion, videojuego.descripcion, videojuego.precio, videojuego.en_venta ? 1 : 0, videojuego.imagen_url || '', videojuego.enlace_compra || '', videojuego.plataforma || 'PC', videojuego.motor || 'Desconocido', videojuego.duracion || 'N/A', videojuego.popularidad || 0, id]
        );
        return { id: parseInt(id), ...videojuego };
    }

    async delete(id) {
        await this.pool.query('DELETE FROM videojuegos WHERE id = ?', [id]);
    }
}

module.exports = MySQLVideojuegoRepository;
