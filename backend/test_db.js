const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'videojuegos_db',
            port: process.env.DB_PORT || 3306
        });
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Database connection successful:', rows[0].result === 2);
        const [games] = await pool.query('SELECT COUNT(*) as count FROM videojuegos');
        console.log('Number of games in database:', games[0].count);
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();
