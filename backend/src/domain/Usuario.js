class Usuario {
    constructor({ id, username, password_hash, nombre_completo, email, biografia, avatar_url, es_admin, fecha_registro }) {
        this.id = id;
        this.username = username;
        this.password_hash = password_hash;
        this.nombre_completo = nombre_completo;
        this.email = email;
        this.biografia = biografia || '';
        this.avatar_url = avatar_url;
        this.es_admin = es_admin;
        this.fecha_registro = fecha_registro;
    }

    esAdministrador() {
        return this.es_admin === 1 || this.es_admin === true;
    }
}

module.exports = Usuario;
