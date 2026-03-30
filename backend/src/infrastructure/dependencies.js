const pool = require('./database');

// Repositorios / Adapters Externos
const MySQLUsuarioRepository = require('../adapters/db/MySQLUsuarioRepository');
const MySQLVideojuegoRepository = require('../adapters/db/MySQLVideojuegoRepository');
const MySQLResenaRepository = require('../adapters/db/MySQLResenaRepository');
const MySQLBibliotecaRepository = require('../adapters/db/MySQLBibliotecaRepository');
const LocalBackupService = require('../adapters/fs/LocalBackupService');
const BcryptHashService = require('./BcryptHashService');
const JwtTokenService = require('./JwtTokenService');

// Casos de Uso / Services
const AuthService = require('../application/AuthService');
const VideojuegoService = require('../application/VideojuegoService');
const UsuarioService = require('../application/UsuarioService');
const ResenaService = require('../application/ResenaService');
const BibliotecaService = require('../application/BibliotecaService');

// Controladores
const AuthController = require('../adapters/http/controllers/AuthController');
const VideojuegoController = require('../adapters/http/controllers/VideojuegoController');
const UsuarioController = require('../adapters/http/controllers/UsuarioController');
const ResenaController = require('../adapters/http/controllers/ResenaController');
const BibliotecaController = require('../adapters/http/controllers/BibliotecaController');

// 1. Instanciar Adapters
const usuarioRepo = new MySQLUsuarioRepository(pool);
const videojuegoRepo = new MySQLVideojuegoRepository(pool);
const resenaRepo = new MySQLResenaRepository(pool);
const bibliotecaRepo = new MySQLBibliotecaRepository(pool);
const backupService = new LocalBackupService(pool);
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService();

// 2. Instanciar Casos de Uso inyectando dependencias
const authService = new AuthService(usuarioRepo, hashService, tokenService, backupService);
const videojuegoService = new VideojuegoService(videojuegoRepo, backupService);
const usuarioService = new UsuarioService(usuarioRepo, backupService);
const resenaService = new ResenaService(resenaRepo, backupService);
const bibliotecaService = new BibliotecaService(bibliotecaRepo, backupService);

// 3. Instanciar Controladores
const authController = new AuthController(authService);
const videojuegoController = new VideojuegoController(videojuegoService, backupService);
const usuarioController = new UsuarioController(usuarioService);
const resenaController = new ResenaController(resenaService);
const bibliotecaController = new BibliotecaController(bibliotecaService);

module.exports = {
    authController,
    videojuegoController,
    usuarioController,
    resenaController,
    bibliotecaController,
    tokenService,
    usuarioRepo
};
