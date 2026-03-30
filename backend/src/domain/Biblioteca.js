class Biblioteca {
    constructor({ id, usuario_id, videojuego_id, fecha_agregado, mi_puntuacion, mi_comentario, videojuego }) {
        this.id = id;
        this.usuario_id = usuario_id;
        this.videojuego_id = videojuego_id;
        this.fecha_agregado = fecha_agregado;
        
        // Información embebida si se obtiene con joins
        this.mi_puntuacion = mi_puntuacion || null;
        this.mi_comentario = mi_comentario || null;
        
        // Objeto de tipo Videojuego
        this.videojuego = videojuego || null; 
    }
}

module.exports = Biblioteca;
