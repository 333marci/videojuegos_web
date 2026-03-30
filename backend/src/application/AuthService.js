const Usuario = require('../domain/Usuario');

class AuthService {
    constructor(usuarioRepository, hashService, tokenService, backupService) {
        this.usuarioRepository = usuarioRepository;
        this.hashService = hashService;
        this.tokenService = tokenService;
        this.backupService = backupService;
    }

    async registrar({ username, password, nombre_completo, email, biografia, avatar_url }) {
        if (!username || !password || !nombre_completo || !email) {
            throw new Error("Todos los campos obligatorios (Usuario, Contraseña, Nombre, Email)");
        }

        const existe = await this.usuarioRepository.findByUsernameOrEmail(username, email);
        if (existe) {
            throw new Error("El nombre de usuario o email ya está registrado");
        }

        const password_hash = await this.hashService.hash(password);
        const avatar = avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;

        const nuevoUsuario = new Usuario({
            username,
            password_hash,
            nombre_completo,
            email,
            biografia,
            avatar_url: avatar
        });

        const id = await this.usuarioRepository.save(nuevoUsuario);
        this.backupService.runBackup(); // Fire and forget (asíncrono)
        return id;
    }

    async login({ username, password }) {
        if (!username || !password) throw new Error("Faltan credenciales");

        const usuario = await this.usuarioRepository.findByUsername(username);
        if (!usuario) throw new Error("Usuario no encontrado");

        const esCorrecto = await this.hashService.compare(password, usuario.password_hash);
        if (!esCorrecto) throw new Error("Contraseña incorrecta");

        const token = this.tokenService.sign({ id: usuario.id, username: usuario.username });

        return {
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                biografia: usuario.biografia,
                avatar_url: usuario.avatar_url,
                es_admin: usuario.esAdministrador()
            }
        };
    }
}

module.exports = AuthService;
