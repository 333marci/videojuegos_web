const bcrypt = require('bcryptjs');

class BcryptHashService {
    async hash(plainText) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(plainText, salt);
    }
    
    async compare(plainText, hash) {
        return bcrypt.compare(plainText, hash);
    }
}
module.exports = BcryptHashService;
