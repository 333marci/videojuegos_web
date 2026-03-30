const BackupService = require('../../ports/BackupService');
const fs = require('fs');
const path = require('path');

class LocalBackupService extends BackupService {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async runBackup() {
        try {
            const [videojuegos] = await this.pool.query('SELECT * FROM videojuegos ORDER BY id ASC');
            const [usuarios] = await this.pool.query('SELECT * FROM usuarios ORDER BY id ASC');
            const [resenas] = await this.pool.query('SELECT * FROM resenas ORDER BY id ASC');
            const [biblioteca] = await this.pool.query('SELECT * FROM biblioteca ORDER BY id ASC');
            
            let sql = `-- Script de respaldo automático GameHub\n`;
            sql += `CREATE DATABASE IF NOT EXISTS videojuegos_db;\nUSE videojuegos_db;\n\n`;
            sql += `SET FOREIGN_KEY_CHECKS = 0;\nDROP TABLE IF EXISTS biblioteca;\nDROP TABLE IF EXISTS resenas;\nDROP TABLE IF EXISTS usuarios;\nDROP TABLE IF EXISTS videojuegos;\nSET FOREIGN_KEY_CHECKS = 1;\n\n`;
            
            // Videojuegos
            sql += `CREATE TABLE videojuegos (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  titulo VARCHAR(255) NOT NULL,\n  desarrollador VARCHAR(255),\n  genero VARCHAR(100),\n  anio_lanzamiento INT,\n  calificacion DECIMAL(3,1),\n  descripcion TEXT,\n  precio DECIMAL(10,2),\n  en_venta BOOLEAN DEFAULT TRUE,\n  imagen_url TEXT,\n  enlace_compra TEXT,\n  plataforma VARCHAR(255),\n  motor VARCHAR(255),\n  duracion VARCHAR(100),\n  popularidad INT DEFAULT 0\n);\n\n`;
            
            if (videojuegos.length > 0) {
                sql += `INSERT INTO videojuegos (id, titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad) VALUES \n`;
                sql += videojuegos.map(r => {
                    const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                    return `(${r.id}, ${escape(r.titulo)}, ${escape(r.desarrollador)}, ${escape(r.genero)}, ${r.anio_lanzamiento}, ${r.calificacion}, ${escape(r.descripcion)}, ${r.precio}, ${r.en_venta ? 1 : 0}, ${escape(r.imagen_url)}, ${escape(r.enlace_compra)}, ${escape(r.plataforma)}, ${escape(r.motor)}, ${escape(r.duracion)}, ${r.popularidad || 0})`;
                }).join(',\n') + ';\n\n';
            }

            // Usuarios
            sql += `CREATE TABLE usuarios (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE, password_hash VARCHAR(255), nombre_completo VARCHAR(100), email VARCHAR(100) UNIQUE, biografia TEXT, avatar_url VARCHAR(255), es_admin BOOLEAN DEFAULT FALSE, fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP);\n`;
            if (usuarios.length > 0) {
                sql += `INSERT INTO usuarios (id, username, password_hash, nombre_completo, email, biografia, avatar_url, es_admin, fecha_registro) VALUES \n`;
                sql += usuarios.map(u => {
                    const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                    return `(${u.id}, ${escape(u.username)}, ${escape(u.password_hash)}, ${escape(u.nombre_completo)}, ${escape(u.email)}, ${escape(u.biografia)}, ${escape(u.avatar_url)}, ${u.es_admin ? 1 : 0}, '${new Date(u.fecha_registro).toISOString().slice(0, 19).replace('T', ' ')}')`;
                }).join(',\n') + ';\n\n';
            }

            // Reseñas
            sql += `CREATE TABLE resenas (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, puntuacion INT, comentario TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);\n`;
            if (resenas.length > 0) {
                sql += `INSERT INTO resenas (id, usuario_id, videojuego_id, puntuacion, comentario, fecha) VALUES \n`;
                sql += resenas.map(r => {
                    const escape = (val) => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
                    return `(${r.id}, ${r.usuario_id}, ${r.videojuego_id}, ${r.puntuacion}, ${escape(r.comentario)}, '${new Date(r.fecha).toISOString().slice(0, 19).replace('T', ' ')}')`;
                }).join(',\n') + ';\n\n';
            }

            // Biblioteca
            sql += `CREATE TABLE biblioteca (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);\n`;
            if (biblioteca.length > 0) {
                sql += `INSERT INTO biblioteca (id, usuario_id, videojuego_id, fecha_agregado) VALUES \n`;
                sql += biblioteca.map(b => {
                    return `(${b.id}, ${b.usuario_id}, ${b.videojuego_id}, '${new Date(b.fecha_agregado).toISOString().slice(0, 19).replace('T', ' ')}')`;
                }).join(',\n') + ';\n';
            }

            const sqlPath = path.join(__dirname, '../../../../database.sql');
            fs.writeFileSync(sqlPath, sql);
            console.log('✅ database.sql sincronizado correctamente.');
        } catch (error) {
            console.error('❌ Error sincronizando database.sql:', error);
        }
    }
}

module.exports = LocalBackupService;
