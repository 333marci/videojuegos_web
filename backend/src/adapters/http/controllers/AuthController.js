class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async registrar(req, res) {
        try {
            const id = await this.authService.registrar(req.body);
            res.status(201).json({ mensaje: "Usuario registrado correctamente", id });
        } catch (error) {
            res.status(400).json({ detail: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const data = await this.authService.login({ username, password });
            res.json(data);
        } catch (error) {
            res.status(401).json({ detail: error.message });
        }
    }
}

module.exports = AuthController;
