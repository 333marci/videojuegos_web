const jwt = require('jsonwebtoken');

class JwtTokenService {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'misupersecretoclave123';
    }

    sign(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: '24h' });
    }

    verify(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            throw new Error("Token inválido o expirado");
        }
    }
}
module.exports = JwtTokenService;
