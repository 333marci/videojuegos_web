class Videojuego {
    constructor({ id, titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad, calificacion_real, total_resenas }) {
        this.id = id;
        this.titulo = titulo;
        this.desarrollador = desarrollador;
        this.genero = genero;
        this.anio_lanzamiento = anio_lanzamiento;
        this.calificacion = parseFloat(calificacion) || 0;
        this.descripcion = descripcion;
        this.precio = parseFloat(precio) || 0;
        this.en_venta = en_venta === 1 || en_venta === true;
        this.imagen_url = imagen_url;
        this.enlace_compra = enlace_compra;
        this.plataforma = plataforma;
        this.motor = motor;
        this.duracion = duracion;
        this.popularidad = popularidad || 0;

        // Propiedades calculadas a partir de combinaciones/joins (opcional)
        this.calificacion_real = calificacion_real ? parseFloat(calificacion_real) : this.calificacion;
        this.total_resenas = total_resenas || 0;
    }
}

module.exports = Videojuego;
