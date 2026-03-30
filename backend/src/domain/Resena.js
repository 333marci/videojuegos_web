class Resena {
    constructor({ id, usuario_id, videojuego_id, puntuacion, comentario, fecha, username, avatar_url }) {
        this.id = id;
        this.usuario_id = usuario_id;
        this.videojuego_id = videojuego_id;
        
        if (puntuacion !== undefined && (puntuacion < 1 || puntuacion > 10)) {
            throw new Error("La puntuación debe estar entre 1 y 10");
        }
        
        this.puntuacion = puntuacion;
        this.comentario = comentario;
        this.fecha = fecha;
        
        // Propiedades calculadas / joins
        this.username = username;
        this.avatar_url = avatar_url;
    }
}

module.exports = Resena;
