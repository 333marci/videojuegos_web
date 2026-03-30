const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('../adapters/http/routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../../frontend')));

// Registrar todas las rutas
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor Node.js corriendo con Arquitectura Hexagonal en http://localhost:${PORT}`);
});
