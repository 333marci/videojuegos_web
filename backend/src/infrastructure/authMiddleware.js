const { tokenService, usuarioRepo } = require('./dependencies');

const verificarToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ detail: "No se proporcionó token" });

    const token = header.split(' ')[1];
    try {
        const decoded = tokenService.verify(token);
        req.usuario_id = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ detail: "Token inválido o expirado" });
    }
};

const verificarAdmin = async (req, res, next) => {
    try {
        const usuario = await usuarioRepo.findById(req.usuario_id);
        if (!usuario || !usuario.esAdministrador()) {
            return res.status(403).json({ detail: "Acceso denegado: Se requieren permisos de administrador" });
        }
        next();
    } catch (error) {
        res.status(500).json({ detail: "Error al verificar permisos" });
    }
};

module.exports = { verificarToken, verificarAdmin };
