const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'misupersecretoclave123';

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== MIDDLEWARE AUTENTICACIÓN ====================
const verificarToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ detail: "No se proporcionó token" });

    const token = header.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ detail: "Token inválido o expirado" });
        req.usuario_id = decoded.id;
        next();
    });
};

const verificarAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT es_admin FROM usuarios WHERE id = ?', [req.usuario_id]);
        if (rows.length === 0 || rows[0].es_admin !== 1 && rows[0].es_admin !== true) {
            return res.status(403).json({ detail: "Acceso denegado: Se requieren permisos de administrador" });
        }
        next();
    } catch (error) {
        res.status(500).json({ detail: "Error al verificar permisos" });
    }
};

// ==================== EXPORTACIÓN Y PERSISTENCIA AUTOMÁTICA ====================
const syncDatabaseToFile = async () => {
    try {
        const [videojuegos] = await pool.query('SELECT * FROM videojuegos ORDER BY id ASC');
        const [usuarios] = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
        const [resenas] = await pool.query('SELECT * FROM resenas ORDER BY id ASC');
        const [biblioteca] = await pool.query('SELECT * FROM biblioteca ORDER BY id ASC');
        
        let sql = `-- Script de respaldo automático GameHub\n`;
        sql += `CREATE DATABASE IF NOT EXISTS videojuegos_db;\nUSE videojuegos_db;\n\n`;
        sql += `SET FOREIGN_KEY_CHECKS = 0;\nDROP TABLE IF EXISTS biblioteca;\nDROP TABLE IF EXISTS resenas;\nDROP TABLE IF EXISTS usuarios;\nDROP TABLE IF EXISTS videojuegos;\nSET FOREIGN_KEY_CHECKS = 1;\n\n`;
        
        // Tabla Videojuegos
        sql += `CREATE TABLE videojuegos (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  titulo VARCHAR(255) NOT NULL,\n  desarrollador VARCHAR(255),\n  genero VARCHAR(100),\n  anio_lanzamiento INT,\n  calificacion DECIMAL(3,1),\n  descripcion TEXT,\n  precio DECIMAL(10,2),\n  en_venta BOOLEAN DEFAULT TRUE,\n  imagen_url TEXT,\n  enlace_compra TEXT,\n  plataforma VARCHAR(255),\n  motor VARCHAR(255),\n  duracion VARCHAR(100),\n  popularidad INT DEFAULT 0\n);\n\n`;
        
        if (videojuegos.length > 0) {
            sql += `INSERT INTO videojuegos (id, titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad) VALUES \n`;
            sql += videojuegos.map(r => {
                const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                return `(${r.id}, ${escape(r.titulo)}, ${escape(r.desarrollador)}, ${escape(r.genero)}, ${r.anio_lanzamiento}, ${r.calificacion}, ${escape(r.descripcion)}, ${r.precio}, ${r.en_venta ? 1 : 0}, ${escape(r.imagen_url)}, ${escape(r.enlace_compra)}, ${escape(r.plataforma)}, ${escape(r.motor)}, ${escape(r.duracion)}, ${r.popularidad || 0})`;
            }).join(',\n') + ';\n\n';
        }

        // Tabla Usuarios
        sql += `CREATE TABLE usuarios (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE, password_hash VARCHAR(255), nombre_completo VARCHAR(100), email VARCHAR(100) UNIQUE, biografia TEXT, avatar_url VARCHAR(255), es_admin BOOLEAN DEFAULT FALSE, fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP);\n`;
        if (usuarios.length > 0) {
            sql += `INSERT INTO usuarios (id, username, password_hash, nombre_completo, email, biografia, avatar_url, es_admin, fecha_registro) VALUES \n`;
            sql += usuarios.map(u => {
                const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                return `(${u.id}, ${escape(u.username)}, ${escape(u.password_hash)}, ${escape(u.nombre_completo)}, ${escape(u.email)}, ${escape(u.biografia)}, ${escape(u.avatar_url)}, ${u.es_admin ? 1 : 0}, '${new Date(u.fecha_registro).toISOString().slice(0, 19).replace('T', ' ')}')`;
            }).join(',\n') + ';\n\n';
        }

        // Tabla Reseñas
        sql += `CREATE TABLE resenas (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, puntuacion INT, comentario TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);\n`;
        if (resenas.length > 0) {
            sql += `INSERT INTO resenas (id, usuario_id, videojuego_id, puntuacion, comentario, fecha) VALUES \n`;
            sql += resenas.map(r => {
                const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                return `(${r.id}, ${r.usuario_id}, ${r.videojuego_id}, ${r.puntuacion}, ${escape(r.comentario)}, '${new Date(r.fecha).toISOString().slice(0, 19).replace('T', ' ')}')`;
            }).join(',\n') + ';\n\n';
        }

        // Tabla Biblioteca
        sql += `CREATE TABLE biblioteca (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);\n`;
        if (biblioteca.length > 0) {
            sql += `INSERT INTO biblioteca (id, usuario_id, videojuego_id, fecha_agregado) VALUES \n`;
            sql += biblioteca.map(b => {
                return `(${b.id}, ${b.usuario_id}, ${b.videojuego_id}, '${new Date(b.fecha_agregado).toISOString().slice(0, 19).replace('T', ' ')}')`;
            }).join(',\n') + ';\n';
        }

        const sqlPath = path.join(__dirname, '../database.sql');
        fs.writeFileSync(sqlPath, sql);
        console.log('✅ database.sql sincronizado correctamente.');
    } catch (error) {
        console.error('❌ Error sincronizando database.sql:', error);
    }
};

app.get('/admin/export-sql', verificarToken, verificarAdmin, async (req, res) => {
    await syncDatabaseToFile();
    res.json({ mensaje: "Archivo database.sql actualizado manualmente!" });
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

app.post('/auth/registro', async (req, res) => {
    try {
        const { username, password, nombre_completo, email, biografia, avatar_url } = req.body;
        if (!username || !password || !nombre_completo || !email) {
            return res.status(400).json({ detail: "Todos los campos obligatorios (Usuario, Contraseña, Nombre, Email)" });
        }

        // Verificar existencia
        const [existeRows] = await pool.query('SELECT id FROM usuarios WHERE username = ? OR email = ?', [username, email]);
        if (existeRows.length > 0) return res.status(400).json({ detail: "El nombre de usuario o email ya está registrado" });

        // Hashear password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const avatar = avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;

        const [result] = await pool.query(
            'INSERT INTO usuarios (username, password_hash, nombre_completo, email, biografia, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password_hash, nombre_completo, email, biografia || '', avatar]
        );

        res.status(201).json({ mensaje: "Usuario registrado correctamente", id: result.insertId });
        syncDatabaseToFile(); // Respaldo asíncrono
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al registrar usuario" });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ detail: "Usuario no encontrado" });

        const usuario = rows[0];

        // Verificar hash
        const esCorrecto = await bcrypt.compare(password, usuario.password_hash);
        if (!esCorrecto) return res.status(401).json({ detail: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario.id, username: usuario.username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                biografia: usuario.biografia,
                avatar_url: usuario.avatar_url,
                es_admin: usuario.es_admin === 1 || usuario.es_admin === true
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al iniciar sesión" });
    }
});

// GET Perfil de usuario (Protegido)
app.get('/auth/perfil', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, nombre_completo, email, biografia, avatar_url FROM usuarios WHERE id = ?', [req.usuario_id]);
        if (rows.length === 0) return res.status(404).json({ detail: "Usuario no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ detail: "Error al obtener perfil del usuario" });
    }
});

// UPDATE Perfil de usuario (Protegido)
app.post('/auth/perfil/update', verificarToken, async (req, res) => {
    try {
        const { nombre_completo, email, biografia, avatar_url } = req.body;
        const usuario_id = req.usuario_id;

        await pool.query(
            'UPDATE usuarios SET nombre_completo = ?, email = ?, biografia = ?, avatar_url = ? WHERE id = ?',
            [nombre_completo, email, biografia, avatar_url, usuario_id]
        );

        const [rows] = await pool.query('SELECT id, username, nombre_completo, email, biografia, avatar_url FROM usuarios WHERE id = ?', [usuario_id]);
        res.json({ mensaje: "Perfil actualizado correctamente", usuario: rows[0] });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al actualizar perfil" });
    }
});

// ==================== RUTAS DE PERFIL PÚBLICO Y ACTIVIDAD ====================

app.get('/usuarios/:id/perfil', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Datos básicos
        const [userRows] = await pool.query('SELECT id, username, nombre_completo, biografia, avatar_url, fecha_registro FROM usuarios WHERE id = ?', [id]);
        if (userRows.length === 0) return res.status(404).json({ detail: "Usuario no encontrado" });
        
        // Estadísticas
        const [statsRows] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM biblioteca WHERE usuario_id = ?) as juegos_jugados,
                (SELECT COUNT(*) FROM resenas WHERE usuario_id = ?) as resenas_escritas,
                (SELECT ROUND(AVG(puntuacion), 1) FROM resenas WHERE usuario_id = ?) as valoracion_media
        `, [id, id, id]);

        res.json({
            usuario: userRows[0],
            estadisticas: statsRows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al obtener perfil público" });
    }
});

app.get('/usuarios/:id/actividad', async (req, res) => {
    try {
        const id = req.params.id;
        const ordenar = req.query.ordenar || 'fecha'; // fecha, puntuacion, nombre
        
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

        const [rows] = await pool.query(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al obtener actividad del usuario" });
    }
});

// ==================== RUTAS / ENDPOINTS ====================

app.get('/', (req, res) => {
    res.json({
        "mensaje": "Bienvenido a la API de Videojuegos",
        "version": "1.0.0 (Node.js)"
    });
});

app.get('/videojuegos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real, COUNT(r.id) as total_resenas
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            GROUP BY v.id
        `);

        const videojuegos = rows.map(v => ({
            ...v,
            en_venta: v.en_venta === 1 || v.en_venta === true,
            precio: parseFloat(v.precio),
            calificacion: parseFloat(v.calificacion_real)
        }));

        res.json(videojuegos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno del servidor" });
    }
});

// ==================== BÚSQUEDA AVANZADA ====================
app.get('/search', async (req, res) => {
    try {
        const { nombre, genero, plataforma, anio, precio_min, precio_max, puntuacion_min, ordenar, limit, offset } = req.query;

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
            query += ` AND v.genero = ?`;
            params.push(genero);
        }
        if (plataforma) {
            query += ` AND v.plataforma LIKE ?`;
            params.push(`%${plataforma}%`);
        }
        if (anio) {
            query += ` AND v.anio_lanzamiento = ?`;
            params.push(anio);
        }
        if (precio_min) {
            query += ` AND v.precio >= ?`;
            params.push(precio_min);
        }
        if (precio_max) {
            query += ` AND v.precio <= ?`;
            params.push(precio_max);
        }
        if (puntuacion_min) {
            query += ` AND (SELECT COALESCE(AVG(puntuacion), v.calificacion) FROM resenas WHERE videojuego_id = v.id) >= ?`;
            params.push(puntuacion_min);
        }

        query += " GROUP BY v.id";

        // Ordenamiento
        switch (ordenar) {
            case 'puntuacion': query += " ORDER BY calificacion_real DESC"; break;
            case 'fecha': query += " ORDER BY v.anio_lanzamiento DESC"; break;
            case 'popularidad': query += " ORDER BY v.popularidad DESC, total_resenas DESC"; break;
            case 'alfabetico': query += " ORDER BY v.titulo ASC"; break;
            default: query += " ORDER BY v.titulo ASC";
        }

        // Primero calculamos el total total
        const [totalRows] = await pool.query(`SELECT COUNT(*) as count FROM (${query}) as sub`, params);
        const totalItems = totalRows[0].count;

        // Luego paginación
        const l = parseInt(limit) || 12;
        const o = parseInt(offset) || 0;
        query += " LIMIT ? OFFSET ?";
        params.push(l, o);

        const [rows] = await pool.query(query, params);
        const resultados = rows.map(v => ({
            ...v,
            precio: parseFloat(v.precio),
            calificacion: parseFloat(v.calificacion_real)
        }));

        res.json({
            total: totalItems,
            limit: l,
            offset: o,
            resultados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error en la búsqueda avanzada" });
    }
});

app.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        const [rows] = await pool.query(
            "SELECT id, titulo, genero, imagen_url FROM videojuegos WHERE LOWER(titulo) LIKE ? LIMIT 5",
            [`%${q.toLowerCase()}%`]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ detail: "Error en sugerencias" });
    }
});

app.get('/videojuegos/genero/:genero', async (req, res) => {
    try {
        const { genero } = req.params;
        const [rows] = await pool.query('SELECT * FROM videojuegos WHERE LOWER(genero) LIKE ?', [`%${genero.toLowerCase()}%`]);
        if (rows.length === 0) {
            return res.status(404).json({ detail: `No hay videojuegos del género '${genero}'` });
        }
        res.json(rows);
    } catch (error) {
        res.status(500).json({ detail: "Error interno del servidor" });
    }
});

app.get('/videojuegos/desarrollador/:desarrollador', async (req, res) => {
    try {
        const { desarrollador } = req.params;
        const [rows] = await pool.query('SELECT * FROM videojuegos WHERE LOWER(desarrollador) LIKE ?', [`%${desarrollador.toLowerCase()}%`]);
        if (rows.length === 0) {
            return res.status(404).json({ detail: `No hay videojuegos del desarrollador '${desarrollador}'` });
        }
        res.json(rows);
    } catch (error) {
        res.status(500).json({ detail: "Error interno" });
    }
});

app.get('/videojuegos/top/calificados', async (req, res) => {
    try {
        let limite = parseInt(req.query.limite) || 5;
        limite = Math.min(limite, 5);
        const [rows] = await pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            GROUP BY v.id
            ORDER BY calificacion_real DESC 
            LIMIT ?
        `, [limite]);

        const videojuegos = rows.map(v => ({
            ...v,
            en_venta: v.en_venta === 1 || v.en_venta === true,
            precio: parseFloat(v.precio),
            calificacion: parseFloat(v.calificacion_real)
        }));

        res.json(videojuegos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno" });
    }
});

app.get('/videojuegos/rango-precio', async (req, res) => {
    try {
        const min_precio = parseFloat(req.query.min_precio) || 0;
        const max_precio = parseFloat(req.query.max_precio) || 100;
        const [rows] = await pool.query('SELECT * FROM videojuegos WHERE precio >= ? AND precio <= ?', [min_precio, max_precio]);
        if (rows.length === 0) {
            return res.status(404).json({ detail: `No hay videojuegos en el rango $${min_precio} - $${max_precio}` });
        }

        const videojuegos = rows.map(v => ({
            ...v,
            en_venta: v.en_venta === 1 || v.en_venta === true,
            precio: parseFloat(v.precio)
        }));

        res.json(videojuegos);
    } catch (error) {
        res.status(500).json({ detail: "Error interno" });
    }
});

app.get('/estadisticas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
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

        const stats = rows[0];

        res.json({
            total_videojuegos: parseInt(stats.total_videojuegos) || 0,
            calificacion_promedio: stats.calificacion_promedio ? Number(parseFloat(stats.calificacion_promedio).toFixed(2)) : 0,
            precio_promedio: stats.precio_promedio ? parseFloat(stats.precio_promedio) : 0,
            precio_maximo: stats.precio_maximo ? parseFloat(stats.precio_maximo) : 0,
            precio_minimo: stats.precio_minimo ? parseFloat(stats.precio_minimo) : 0,
            juegos_en_venta: stats.juegos_en_venta ? parseInt(stats.juegos_en_venta) : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno del servidor" });
    }
});

app.get('/videojuegos/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, COALESCE(ROUND(AVG(r.puntuacion), 1), v.calificacion) as calificacion_real
            FROM videojuegos v
            LEFT JOIN resenas r ON v.id = r.videojuego_id
            WHERE v.id = ?
            GROUP BY v.id
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ detail: `Videojuego con ID ${req.params.id} no encontrado` });
        }
        const juego = rows[0];
        juego.en_venta = juego.en_venta === 1 || juego.en_venta === true;
        juego.precio = parseFloat(juego.precio);
        juego.calificacion = parseFloat(juego.calificacion_real);
        res.json(juego);
    } catch (error) {
        res.status(500).json({ detail: "Error interno del servidor" });
    }
});

// ==================== RUTAS DE RESEÑAS ====================

app.get('/videojuegos/:id/resenas', async (req, res) => {
    try {
        const videojuego_id = req.params.id;
        const [rows] = await pool.query(`
            SELECT r.id, r.puntuacion, r.comentario, r.fecha, u.username, u.avatar_url, r.usuario_id
            FROM resenas r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.videojuego_id = ?
            ORDER BY r.fecha DESC
        `, [videojuego_id]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al obtener reseñas" });
    }
});

// ==================== RUTAS DE BIBLIOTECA (Juegos Jugados) ====================

app.get('/auth/biblioteca', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.usuario_id;
        // Join con resenas para traer la puntuación y comentario del usuario si existen
        const [rows] = await pool.query(`
            SELECT v.*, r.puntuacion as mi_puntuacion, r.comentario as mi_comentario
            FROM biblioteca b
            JOIN videojuegos v ON b.videojuego_id = v.id
            LEFT JOIN resenas r ON (r.videojuego_id = v.id AND r.usuario_id = ?)
            WHERE b.usuario_id = ?
            ORDER BY b.fecha_agregado DESC
        `, [usuario_id, usuario_id]);

        const resultados = rows.map(v => ({
            ...v,
            en_venta: v.en_venta === 1 || v.en_venta === true,
            precio: parseFloat(v.precio)
        }));

        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al obtener tu biblioteca" });
    }
});

app.post('/auth/biblioteca', verificarToken, async (req, res) => {
    try {
        const { videojuego_id } = req.body;
        const usuario_id = req.usuario_id;

        if (!videojuego_id) return res.status(400).json({ detail: "ID de videojuego requerido" });

        // Verificar si ya existe
        const [existRows] = await pool.query('SELECT id FROM biblioteca WHERE usuario_id = ? AND videojuego_id = ?', [usuario_id, videojuego_id]);
        if (existRows.length > 0) return res.status(400).json({ detail: "Este juego ya está en tu biblioteca" });

        await pool.query('INSERT INTO biblioteca (usuario_id, videojuego_id) VALUES (?, ?)', [usuario_id, videojuego_id]);
        res.status(201).json({ mensaje: "Juego añadido a tu biblioteca" });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al añadir a la biblioteca" });
    }
});

app.delete('/auth/biblioteca/:id', verificarToken, async (req, res) => {
    try {
        const videojuego_id = req.params.id;
        const usuario_id = req.usuario_id;

        await pool.query('DELETE FROM biblioteca WHERE usuario_id = ? AND videojuego_id = ?', [usuario_id, videojuego_id]);
        res.json({ mensaje: "Juego eliminado de tu biblioteca" });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al eliminar de la biblioteca" });
    }
});

app.post('/videojuegos/:id/resenas', verificarToken, async (req, res) => {
    try {
        const videojuego_id = req.params.id;
        const usuario_id = req.usuario_id;
        const { puntuacion, comentario } = req.body;

        if (!puntuacion || puntuacion < 1 || puntuacion > 10) {
            return res.status(400).json({ detail: "La puntuación debe estar entre 1 y 10" });
        }

        // Evitar duplicados del mismo usuario en el mismo juego
        const [checkRows] = await pool.query('SELECT id FROM resenas WHERE usuario_id = ? AND videojuego_id = ?', [usuario_id, videojuego_id]);
        if (checkRows.length > 0) {
            return res.status(400).json({ detail: "Ya has dejado una reseña para este videojuego" });
        }

        await pool.query(
            'INSERT INTO resenas (usuario_id, videojuego_id, puntuacion, comentario) VALUES (?, ?, ?, ?)',
            [usuario_id, videojuego_id, puntuacion, comentario]
        );

        res.status(201).json({ mensaje: "Reseña añadida correctamente" });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al guardar la reseña" });
    }
});

app.put('/videojuegos/:id/resenas', verificarToken, async (req, res) => {
    try {
        const videojuego_id = req.params.id;
        const usuario_id = req.usuario_id;
        const { puntuacion, comentario } = req.body;

        if (!puntuacion || puntuacion < 1 || puntuacion > 10) {
            return res.status(400).json({ detail: "La puntuación debe estar entre 1 y 10" });
        }

        const [result] = await pool.query(
            'UPDATE resenas SET puntuacion = ?, comentario = ?, fecha = CURRENT_TIMESTAMP WHERE usuario_id = ? AND videojuego_id = ?',
            [puntuacion, comentario, usuario_id, videojuego_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ detail: "No se encontró la reseña para modificar" });
        }

        res.json({ mensaje: "Reseña actualizada correctamente" });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al actualizar la reseña" });
    }
});

app.delete('/videojuegos/:id/resenas', verificarToken, async (req, res) => {
    try {
        const videojuego_id = req.params.id;
        const usuario_id = req.usuario_id;

        const [result] = await pool.query(
            'DELETE FROM resenas WHERE usuario_id = ? AND videojuego_id = ?',
            [usuario_id, videojuego_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ detail: "No se encontró la reseña para eliminar" });
        }

        res.json({ mensaje: "Reseña eliminada correctamente" });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al eliminar la reseña" });
    }
});

app.post('/videojuegos', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad } = req.body;

        if (calificacion < 1 || calificacion > 10) {
            return res.status(400).json({ detail: "La calificación debe estar entre 1 y 10" });
        }

        const [result] = await pool.query(
            'INSERT INTO videojuegos (titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta || true, imagen_url || '', enlace_compra || '', plataforma || 'PC', motor || 'Desconocido', duracion || 'N/A', popularidad || 0]
        );

        res.json({
            id: result.insertId,
            ...req.body
        });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno del servidor al crear" });
    }
});

app.put('/videojuegos/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad } = req.body;

        if (calificacion < 1 || calificacion > 10) {
            return res.status(400).json({ detail: "La calificación debe estar entre 1 y 10" });
        }

        const [checkRows] = await pool.query('SELECT id FROM videojuegos WHERE id = ?', [id]);
        if (checkRows.length > 0) {
            await pool.query(
                'UPDATE videojuegos SET titulo=?, desarrollador=?, genero=?, anio_lanzamiento=?, calificacion=?, descripcion=?, precio=?, en_venta=?, imagen_url=?, enlace_compra=?, plataforma=?, motor=?, duracion=?, popularidad=? WHERE id=?',
                [titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url || '', enlace_compra || '', plataforma || 'PC', motor || 'Desconocido', duracion || 'N/A', popularidad || 0, id]
            );

            res.json({
                id: parseInt(id),
                ...req.body
            });
            syncDatabaseToFile();
        } else {
            return res.status(404).json({ detail: `Videojuego con ID ${id} no encontrado` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error interno al actualizar" });
    }
});

app.delete('/videojuegos/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await pool.query('SELECT titulo FROM videojuegos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ detail: `Videojuego con ID ${id} no encontrado` });
        }

        await pool.query('DELETE FROM videojuegos WHERE id = ?', [id]);

        res.json({
            mensaje: `Videojuego '${rows[0].titulo}' eliminado correctamente`,
            id: parseInt(id)
        });
        syncDatabaseToFile();
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Error al eliminar" });
    }
});

// El servidor escucha
app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});
