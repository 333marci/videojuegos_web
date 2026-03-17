/**
 * ================== SCRIPT GAMEHUB NEXT-GEN (ESPAÑOL) ==================
 */

const API_URL = 'http://localhost:8000';

function manejarBusquedaGlobal(valor) {
    const mainSearch = document.getElementById('busquedaNombre');
    const navSearch = document.getElementById('navBusqueda');
    
    if (navSearch && navSearch.value !== valor) navSearch.value = valor;
    if (mainSearch && mainSearch.value !== valor) mainSearch.value = valor;

    // Redirigir si es necesario
    if (seccionActual !== 'seccion-busqueda' && valor.length > 2) {
        mostrarSeccion('seccion-busqueda');
    }
    
    manejarInputBusqueda(valor, 'navSuggestions');
}
// Globales
let videojuegosActuales = [];
let usuarioActual = null;
let tokenActual = null;
let miBiblioteca = [];
let seccionActual = 'seccion-home';
let juegoActualId = null;

// Variables de estado de búsqueda
let busquedaState = {
    pagina: 0,
    limite: 12,
    total: 0,
    loading: false,
    hasMore: true,
    debounceTimer: null,
    ultimoNombre: ''
};

// ==================== NAVEGACIÓN SPA ====================

function mostrarSeccion(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('d-none'));
    const seccion = document.getElementById(id);
    if (seccion) seccion.classList.remove('d-none');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = Array.from(document.querySelectorAll('.nav-link')).find(l => l.getAttribute('onclick')?.includes(id));
    if (link) link.classList.add('active');

    seccionActual = id;

    // Reiniciar animaciones de entrada
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('reveal');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('reveal');
    });

    if (id === 'seccion-rankings') cargarRankings();
    if (id === 'seccion-catalogo') mostrarCatalogo(videojuegosActuales);
    if (id === 'seccion-busqueda') ejecutarBusquedaAvanzada(true);
    if (id === 'seccion-perfil' && perfilActualId) {
        // La actualización de interfaz ya se manejó en abrirPerfilUsuario
    }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    // Sincronizar sesión
    const sesion = localStorage.getItem('gamehub_user');
    const token = localStorage.getItem('gamehub_token');
    if (sesion && token && sesion !== "undefined") {
        usuarioActual = JSON.parse(sesion);
        tokenActual = token;
        actualizarUICabecera();
    }
    // Listeners Búsqueda y Filtros
    inicializarEventosBusqueda();
    
    // Listener adicional para cerrar sugerencias al clickar fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-search-container')) {
            toggleSuggestions(null, true);
        }
    });

    // --- FIX: Cargar datos iniciales ---
    cargarVideojuegos();
    cargarEstadisticas();
    actualizarUIAdmin();

    // Listeners Búsqueda y Filtros
    inicializarEventosBusqueda();

    // Listeners Auth
    document.getElementById('formLogin')?.addEventListener('submit', realizarLogin);
    document.getElementById('formRegistro')?.addEventListener('submit', realizarRegistro);
    document.getElementById('formEditarPerfil')?.addEventListener('submit', guardarCambiosPerfil);
});

function inicializarEventosBusqueda() {
    const navInput = document.getElementById('navBusqueda');
    const mainInput = document.getElementById('busquedaNombre');
    const filters = ['filtroGenero', 'filtroPlataforma', 'filtroPuntuacion', 'filtroAnio', 'filtroPrecio', 'ordenarResultados'];

    // Sincronización y Debounce
    [navInput, mainInput].forEach(el => {
        if (!el) return;
        el.addEventListener('input', (e) => {
            const val = e.target.value;
            // Sincronizar el otro input
            if (el.id === 'navBusqueda' && mainInput) mainInput.value = val;
            if (el.id === 'busquedaNombre' && navInput) navInput.value = val;
            
            manejarInputBusqueda(val, el.id === 'navBusqueda' ? 'navSuggestions' : 'searchSuggestions');
        });

        el.addEventListener('blur', () => setTimeout(() => toggleSuggestions(null, true), 200));
    });

    filters.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        el.addEventListener('change', () => ejecutarBusquedaAvanzada(true));
        
        if (id === 'filtroAnio') {
            el.addEventListener('input', () => {
                clearTimeout(busquedaState.debounceTimer);
                busquedaState.debounceTimer = setTimeout(() => ejecutarBusquedaAvanzada(true), 500);
            });
        }
    });
}

// ==================== CARGA DE DATOS ====================

async function cargarVideojuegos() {
    try {
        const res = await fetch(`${API_URL}/videojuegos`);
        videojuegosActuales = await res.json();

        actualizarHeroTrending(videojuegosActuales);
        mostrarDestacados(videojuegosActuales.slice(0, 12));

        if (seccionActual === 'seccion-rankings') cargarRankings();
        if (seccionActual === 'seccion-catalogo') mostrarCatalogo(videojuegosActuales);
        if (seccionActual === 'seccion-busqueda') mostrarResultadosExplorador(videojuegosActuales);

    } catch (err) {
        console.error('Error cargando juegos:', err);
    }
}

async function cargarEstadisticas() {
    try {
        const res = await fetch(`${API_URL}/estadisticas`);
        const stats = await res.json();
        const total = document.getElementById('totalGames');
        const avg = document.getElementById('avgRating');
        const sale = document.getElementById('gamesOnSale');

        if (total) total.textContent = stats.total_videojuegos;
        if (avg) avg.textContent = stats.calificacion_promedio;
        if (sale) sale.textContent = stats.juegos_en_venta;
    } catch (err) { }
}

// ==================== RENDERIZADO ====================

function actualizarHeroTrending(juegos) {
    const hero = document.getElementById('hero-trending-game');
    if (!hero || juegos.length === 0) return;

    const trending = [...juegos].sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0))[0];

    hero.innerHTML = `
        <img src="${trending.imagen_url}" class="game-card-img" style="opacity: 0.6; position: absolute; z-index: 1;">
        <div class="card-overlay" style="z-index: 2; cursor: pointer;" onclick="verDetalles(${trending.id})">
            <span class="badge bg-danger mb-3 py-2 px-3 fw-bold">NIVEL ÉLITE</span>
            <h1 class="display-3 fw-800 text-white mb-2">${trending.titulo}</h1>
            <p class="text-secondary fs-5">Descubre por qué es el título más sincronizado hoy (${trending.calificacion.toFixed(1)}/10)</p>
        </div>
    `;
}

function mostrarDestacados(juegos) {
    const container = document.getElementById('destacadosContainer');
    if (!container) return;

    container.innerHTML = juegos.map(j => `
        <div class="col-6 col-md-4 col-lg-3 reveal" style="animation-delay: 0.1s">
            <div class="bento-item p-0 h-100" onclick="verDetalles(${j.id})">
                <div style="height: 250px; overflow: hidden;">
                    <img src="${j.imagen_url}" class="game-card-img" alt="${j.titulo}">
                </div>
                <div class="p-3 bg-card-glow">
                    <div class="fw-800 text-white mb-1 text-truncate">${j.titulo}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-success fw-bold">€${j.precio.toFixed(2)}</span>
                        <span class="badge" style="background: rgba(0, 242, 255, 0.1); color: var(--accent-primary)">${j.calificacion.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function mostrarResultadosExplorador(juegos, append = false, query = '') {
    const container = document.getElementById('exploradorContainer');
    if (!container) return;

    if (!append) container.innerHTML = '';
    
    if (juegos.length === 0 && !append) {
        document.getElementById('fb-no-results')?.classList.remove('d-none');
        return;
    } else {
        document.getElementById('fb-no-results')?.classList.add('d-none');
    }

    const html = juegos.map((j, index) => {
        const tituloResaltado = resaltarTexto(j.titulo, query);
        const delay = (index % 12) * 50; // Stagger effect recreado
        return `
        <div class="col-sm-6 col-md-4 col-xl-3 reveal explorador-item" style="animation-delay: ${delay}ms">
            <div class="elite-game-card" onclick="verDetalles(${j.id})">
                <div class="elite-img-container">
                    <img src="${j.imagen_url}" loading="lazy">
                    <div class="elite-score-badge">
                        <i class="fas fa-star me-1 small"></i>${j.calificacion.toFixed(1)}
                    </div>
                </div>
                <div class="elite-content">
                    <div class="elite-title" title="${j.titulo}">${tituloResaltado}</div>
                    <div class="elite-meta">
                        <span class="elite-genre">${j.genero}</span>
                        <span class="elite-price">${j.precio > 0 ? '€' + j.precio.toFixed(2) : 'GRATIS'}</span>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }

    actualizarActiveFilters();
}

function resaltarTexto(texto, query) {
    if (!query || query.length < 2) return texto;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.replace(regex, '<mark>$1</mark>');
}

function cargarRankings() {
    const container = document.getElementById('rankingsContainer');
    if (!container) return;

    const rankings = [...videojuegosActuales].sort((a, b) => b.calificacion - a.calificacion);
    container.innerHTML = rankings.map((j, i) => `
        <tr onclick="verDetalles(${j.id})" style="cursor: pointer;">
            <td class="ps-4"><span class="badge-rank">#${i + 1}</span></td>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <img src="${j.imagen_url}" style="width: 50px; height: 65px; border-radius: 12px; object-fit: cover; border: 1px solid var(--glass-border);">
                    <div>
                        <div class="fw-800 text-white">${j.titulo}</div>
                        <div class="small text-muted">${j.desarrollador}</div>
                    </div>
                </div>
            </td>
            <td><span class="text-muted small">${j.genero}</span></td>
            <td><span class="text-white fw-500">${j.anio_lanzamiento}</span></td>
            <td><span class="fw-800 fs-5" style="color: ${getRatingColor(j.calificacion)}">${j.calificacion.toFixed(1)}</span></td>
            <td class="pe-4">
                <div class="progress" style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <div class="progress-bar" style="width: ${j.popularidad || 50}%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));"></div>
                </div>
            </td>
        </tr>
    `).join('');
}

function mostrarCatalogo(juegos) {
    const container = document.getElementById('catalogoContainer');
    const counter = document.getElementById('catalogo-total-count');
    if (!container) return;

    if (counter) counter.textContent = juegos.length;

    if (juegos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-5">No hay datos en el catálogo.</div>';
        return;
    }

    container.innerHTML = juegos.map((j, index) => {
        const delay = (index % 12) * 50;
        return `
        <div class="col-sm-6 col-lg-4 col-xl-3 reveal" style="animation-delay: ${delay}ms">
            <div class="elite-game-card" onclick="verDetalles(${j.id})">
                <div class="elite-img-container">
                    <img src="${j.imagen_url}" loading="lazy" alt="${j.titulo}">
                    <div class="elite-score-badge">
                        <i class="fas fa-star small"></i> ${j.calificacion.toFixed(1)}
                    </div>
                </div>
                <div class="elite-content">
                    <div class="elite-title" title="${j.titulo}">${j.titulo}</div>
                    <div class="elite-meta">
                        <span class="elite-genre text-accent">${j.genero}</span>
                        <span class="elite-price">${j.precio > 0 ? '€' + j.precio.toFixed(2) : 'GRATIS'}</span>
                    </div>
                    <div class="elite-footer d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-white border-opacity-10">
                        <div class="d-flex gap-2">
                            <span class="elite-badge"><i class="far fa-calendar-alt me-1"></i>${j.anio_lanzamiento}</span>
                            <span class="elite-badge"><i class="fas fa-desktop me-1"></i>${j.plataforma ? j.plataforma.split(',')[0] : 'Multi'}</span>
                        </div>
                        <i class="fas fa-arrow-right text-accent opacity-50"></i>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

// ==================== DETALLES Y RESEÑAS ====================

async function verDetalles(id) {
    try {
        const res = await fetch(`${API_URL}/videojuegos/${id}`);
        const juego = await res.json();
        juegoActualId = id;

        const content = document.getElementById('detallesContenido');
        content.dataset.juegoId = id;

        content.innerHTML = `
            <div class="p-0 overflow-hidden">
                <div style="height: 400px; background: linear-gradient(rgba(12, 12, 14, 0.4), #0c0c0e), url('${juego.imagen_url}'); background-size: cover; background-position: center;"></div>
                <div class="p-5" style="margin-top: -150px; position: relative; z-index: 10;">
                    <div class="row g-5">
                        <div class="col-lg-5">
                            <img src="${juego.imagen_url}" class="img-fluid rounded-4 shadow-lg mb-4" style="width: 100%; height: 500px; object-fit: cover;">
                            <div class="d-flex gap-3">
                                <a href="${juego.enlace_compra || '#'}" target="_blank" class="btn-premium flex-grow-1 text-center py-3">
                                    <i class="fas fa-shopping-cart me-2"></i> ADQUIRIR TÍTULO
                                </a>
                                <div class="admin-only d-none d-flex gap-2">
                                    <button class="btn btn-warning py-3 px-4 rounded-3" onclick="abrirEditarJuego(${juego.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger py-3 px-4 rounded-3" onclick="eliminarJuego(${juego.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-7">
                            <h1 class="display-2 fw-800 mb-2">${juego.titulo}</h1>
                            <p class="text-muted fs-5 mb-3">${juego.desarrollador} • ${juego.anio_lanzamiento}</p>
                            <div class="d-flex gap-3 mb-4 flex-wrap">
                                <span class="badge bg-secondary p-3 rounded-3" style="font-size: 0.9rem;"><i class="fas fa-microchip me-2"></i>${juego.motor || 'Desconocido'}</span>
                                <span class="badge bg-secondary p-3 rounded-3" style="font-size: 0.9rem;"><i class="fas fa-clock me-2"></i>${juego.duracion || 'N/A'}</span>
                                <span class="badge bg-secondary p-3 rounded-3" style="font-size: 0.9rem;"><i class="fas fa-desktop me-2"></i>${juego.plataforma || 'Varias'}</span>
                                <div class="p-2 px-4 rounded-3 d-flex align-items-center" style="background: rgba(0, 242, 255, 0.1); color: var(--accent-primary); font-weight: 800; font-size: 1.2rem;">
                                    ${juego.calificacion.toFixed(1)} <i class="fas fa-star ms-2" style="font-size: 0.8rem;"></i>
                                </div>
                            </div>
                            <p class="text-secondary fs-5" style="line-height: 1.8;">${juego.descripcion}</p>
                            <div class="mt-5 pt-5 border-top" style="border-color: var(--glass-border) !important;">
                                <h5 class="text-accent fw-800 mb-4 text-uppercase">NEURAL FEEDBACK (RESEÑAS)</h5>
                                <div id="lista-resenas" class="mt-4">Sincronizando registros...</div>
                                
                                <div id="seccion-escribir-resena" class="d-none mt-5 p-5 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
                                    <h4 class="fw-800 mb-4 text-white">PUBLICAR ANÁLISIS</h4>
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="small text-muted fw-bold">PUNTUACIÓN</label>
                                            <input type="number" id="nueva-resena-puntos" class="cyber-input text-center fs-4" placeholder="0-10" min="0" max="10">
                                        </div>
                                        <div class="col-md-9">
                                            <label class="small text-muted fw-bold">COMENTARIO</label>
                                            <textarea id="nueva-resena-texto" class="cyber-input" style="height: 80px;" placeholder="Describe tu experiencia sensorial..."></textarea>
                                        </div>
                                    </div>
                                    <button onclick="enviarResena()" class="btn-premium py-3 mt-4">ENVIAR TRANSMISIÓN</button>
                                </div>
                                <div id="mensaje-invitado-resenas" class="mt-5 text-center p-4 rounded-3 border border-dashed border-secondary text-muted">
                                    <i class="fas fa-fingerprint me-2"></i> Identificación requerida para sincronizar feedback.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        cargarResenas(id);
        actualizarUIAdmin(); // Para mostrar botones de editar/borrar si es admin

        if (usuarioActual) {
            document.getElementById('seccion-escribir-resena').classList.remove('d-none');
            document.getElementById('mensaje-invitado-resenas').classList.add('d-none');
            actualizarBotonBiblioteca(id);
        }

        const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
        modal.show();
    } catch (err) { console.error(err); }
}

async function cargarResenas(id) {
    const lista = document.getElementById('lista-resenas');
    try {
        const res = await fetch(`${API_URL}/videojuegos/${id}/resenas`);
        const resenas = await res.json();

        if (resenas.length === 0) {
            lista.innerHTML = '<div class="text-muted border-start border-3 border-accent ps-4 py-2">No se han encontrado registros neuronales para este título.</div>';
            return;
        }

        lista.innerHTML = resenas.map(r => `
            <div class="d-flex mb-4 gap-4 p-4 rounded-4" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);">
                <img src="${r.avatar_url}" class="rounded-circle cursor-pointer" onclick="abrirPerfilUsuario(${r.usuario_id}); bootstrap.Modal.getInstance(document.getElementById('modalDetalles')).hide();" style="width: 50px; height: 50px; object-fit: cover; border: 2px solid var(--accent-primary);">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-800 text-accent fs-5 cursor-pointer" onclick="abrirPerfilUsuario(${r.usuario_id}); bootstrap.Modal.getInstance(document.getElementById('modalDetalles')).hide();">${r.username}</span>
                        <div class="d-flex align-items-center gap-2">
                            ${getEstrellasHtml(r.puntuacion, 10)}
                            <div class="badge-rank fs-6">${r.puntuacion}/10</div>
                        </div>
                    </div>
                    <p class="text-secondary m-0">${r.comentario || 'El agente no ha proporcionado un informe escrito.'}</p>
                </div>
            </div>
        `).join('');
    } catch (err) { lista.innerHTML = 'Error de conexión.'; }
}

async function enviarResena() {
    const p = document.getElementById('nueva-resena-puntos').value;
    const c = document.getElementById('nueva-resena-texto').value;

    if (!p || p < 0 || p > 10) return mostrarNotificacion('Puntaje inválido (0-10)', 'error');

    try {
        const res = await fetch(`${API_URL}/videojuegos/${juegoActualId}/resenas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
            body: JSON.stringify({ puntuacion: parseInt(p), comentario: c })
        });

        if (!res.ok) throw new Error('Error al enviar');

        mostrarNotificacion('Pulso sincronizado correctamente', 'success');
        document.getElementById('nueva-resena-puntos').value = '';
        document.getElementById('nueva-resena-texto').value = '';
        cargarResenas(juegoActualId);
        cargarVideojuegos();
    } catch (err) { mostrarNotificacion('Protocolo de envío fallido', 'error'); }
}

// ==================== AUTH & BIBLIOTECA & PERFILES ====================

let perfilActualId = null;

function abrirMiPerfil() {
    if (!usuarioActual) {
        mostrarNotificacion("Protocolo de acceso denegado: Identificación requerida", "error");
        new bootstrap.Modal(document.getElementById('modalLogin')).show();
        return;
    }
    abrirPerfilUsuario(usuarioActual.id);
}

async function abrirPerfilUsuario(id) {
    perfilActualId = id;
    mostrarSeccion('seccion-perfil');
    
    // Cargar datos básicos y estadísticas
    try {
        const res = await fetch(`${API_URL}/usuarios/${id}/perfil`);
        if (!res.ok) throw new Error("Perfil no encontrado");
        const data = await res.json();
        const u = data.usuario;
        const e = data.estadisticas;

        document.getElementById('perfil-avatar').src = u.avatar_url;
        document.getElementById('perfil-nombre').textContent = u.username;
        document.getElementById('perfil-bio').textContent = u.biografia || "Agente sin biografía en los registros.";
        document.getElementById('perfil-fecha').textContent = new Date(u.fecha_registro).toLocaleDateString();

        document.getElementById('perfil-stat-juegos').textContent = e.juegos_jugados;
        document.getElementById('perfil-stat-media').textContent = e.valoracion_media || "-";
        document.getElementById('perfil-stat-resenas').textContent = e.resenas_escritas;
        cargarAccionesPerfil(id);
        cargarHistorialPerfil(id);

    } catch (err) {
        mostrarNotificacion(err.message, "error");
        mostrarSeccion('seccion-home');
    }
}

function cargarAccionesPerfil(perfilId) {
    const contenedor = document.getElementById('perfil-acciones');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (!usuarioActual) return;

    if (usuarioActual.id == perfilId) {
        contenedor.innerHTML = `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-info px-4 py-2 fw-bold" onclick="abrirModalSeleccionJuegos()">
                    <i class="fas fa-plus-circle me-2"></i>AÑADIR JUEGOS
                </button>
                <button class="btn btn-outline-secondary px-4 py-2" onclick="abrirEditarPerfil()">
                    <i class="fas fa-edit me-2"></i>EDITAR PERFIL
                </button>
            </div>
        `;
    }
}

let todosLosJuegosParaSeleccion = [];

async function abrirModalSeleccionJuegos() {
    const modalEl = document.getElementById('modalSeleccionJuegos');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    try {
        if (todosLosJuegosParaSeleccion.length === 0) {
            const res = await fetch(`${API_URL}/videojuegos`);
            todosLosJuegosParaSeleccion = await res.json();
        }
        renderizarJuegosModal(todosLosJuegosParaSeleccion);
    } catch (err) {
        console.error("Error cargando juegos para modal:", err);
    }
}

function renderizarJuegosModal(juegos) {
    const contenedor = document.getElementById('listaJuegosSeleccion');
    if (!contenedor) return;

    // Filtrar los que ya están en la biblioteca local del usuario
    const juegosFiltrados = juegos.filter(j => !miBiblioteca.some(mj => mj.id === j.id));

    if (juegosFiltrados.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center text-muted py-5">Todos los títulos disponibles ya están en tu biblioteca.</div>';
        return;
    }

    contenedor.innerHTML = juegosFiltrados.map(j => `
        <div class="col-md-6 selectable-game-item mb-3">
            <div class="bento-item p-2 d-flex align-items-center gap-3 cursor-pointer" onclick="vincularJuegoDesdeModal(${j.id})">
                <img src="${j.imagen_url}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div class="overflow-hidden">
                    <div class="fw-bold text-white text-truncate">${j.titulo}</div>
                    <div class="small text-muted">${j.genero}</div>
                </div>
                <div class="ms-auto">
                    <i class="fas fa-plus-circle text-accent"></i>
                </div>
            </div>
        </div>
    `).join('');
}

function filtrarJuegosModal() {
    const q = document.getElementById('busquedaJuegosModal').value.toLowerCase();
    const filtrados = todosLosJuegosParaSeleccion.filter(j => 
        j.titulo.toLowerCase().includes(q) || j.genero.toLowerCase().includes(q)
    );
    renderizarJuegosModal(filtrados);
}

async function vincularJuegoDesdeModal(videojuegoId) {
    try {
        const res = await fetch(`${API_URL}/auth/biblioteca`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${tokenActual}` 
            },
            body: JSON.stringify({ videojuego_id: videojuegoId })
        });

        if (!res.ok) throw new Error("Error al vincular título");

        mostrarNotificacion("Juego vinculado correctamente", "success");
        
        // Actualizar datos locales
        await cargarBiblioteca();
        if (perfilActualId) {
            abrirPerfilUsuario(perfilActualId); // Refresca estadísticas e historial
        }

        // Refrescar el modal
        renderizarJuegosModal(todosLosJuegosParaSeleccion);

    } catch (err) {
        mostrarNotificacion(err.message, "error");
    }
}



// Escuchar cambios de ordenación en el perfil
document.getElementById('perfil-ordenar-actividad')?.addEventListener('change', () => {
    if (perfilActualId) cargarHistorialPerfil(perfilActualId);
});

async function cargarHistorialPerfil(id) {
    const contenedor = document.getElementById('perfil-actividad-container');
    const ordenar = document.getElementById('perfil-ordenar-actividad')?.value || 'fecha';
    contenedor.innerHTML = '<div class="col-12 text-center text-accent"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const res = await fetch(`${API_URL}/usuarios/${id}/actividad?ordenar=${ordenar}`);
        const juegos = await res.json();

        if (juegos.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center p-5 rounded-4 border border-secondary border-dashed">
                    <i class="fas fa-ghost fa-3x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">SIN REGISTROS DE ACTIVIDAD</h4>
                    <p class="text-muted">Este agente aún no ha vinculado títulos a su red neural.</p>
                </div>`;
            return;
        }

        const isMiPerfil = usuarioActual && usuarioActual.id == id;

        contenedor.innerHTML = juegos.map(j => {
            let resenaHtml = '';
            let estrellasHtml = `<span class="text-muted small">Sin valorar</span>`;
            
            if (j.puntuacion) {
                estrellasHtml = getEstrellasHtml(j.puntuacion, 10);
                resenaHtml = `
                    <div class="mt-3 p-3 rounded-3 border-start border-3 border-accent" style="background: rgba(0, 242, 255, 0.05);">
                        <p class="text-secondary m-0 mb-2 fst-italic">"${j.comentario || 'Sin transcripción vocal.'}"</p>
                        ${isMiPerfil ? `
                            <div class="d-flex justify-content-end gap-2 mt-2">
                                <button class="btn btn-sm btn-outline-warning" onclick="abrirEditarResena(${j.videojuego_id}, ${j.puntuacion}, '${(j.comentario || '').replace(/'/g, "\\'")}')"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-outline-danger" onclick="eliminarMiResena(${j.videojuego_id})"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            return `
            <div class="col-md-6 col-xl-4 reveal">
                <div class="bento-item p-0 h-100 d-flex flex-column">
                    <div style="height: 180px; overflow: hidden; position: relative;" onclick="verDetalles(${j.videojuego_id})" class="cursor-pointer">
                        <img src="${j.imagen_url}" class="game-card-img">
                        <div class="badge-rank position-absolute top-0 end-0 m-3" style="background: rgba(0,0,0,0.8);">
                            ${j.genero}
                        </div>
                    </div>
                    <div class="p-4 flex-grow-1 d-flex flex-column">
                        <div class="fw-800 fs-5 text-white cursor-pointer" onclick="verDetalles(${j.videojuego_id})">${j.titulo}</div>
                        <div class="text-muted small mb-3"><i class="fas fa-link me-1"></i> Vinculado el ${new Date(j.fecha_agregado).toLocaleDateString()}</div>
                        
                        <div class="d-flex align-items-center mb-2 gap-2">
                            ${estrellasHtml}
                            ${j.puntuacion ? `<span class="badge bg-dark align-self-start">${j.puntuacion}/10</span>` : ''}
                        </div>
                        
                        <div class="flex-grow-1">
                            ${resenaHtml}
                        </div>
                        
                        ${isMiPerfil && !j.puntuacion ? `
                            <button class="btn btn-sm btn-outline-info w-100 mt-3" onclick="verDetalles(${j.videojuego_id})">
                                <i class="fas fa-pen me-2"></i> ESCRIBIR RESEÑA
                            </button>
                        ` : ''}
                        
                        ${isMiPerfil ? `
                            <button class="btn btn-sm btn-link text-danger w-100 mt-2 text-decoration-none" onclick="eliminarJuegoBibliotecaPerfil(${j.videojuego_id})">
                                <i class="fas fa-unlink me-1"></i> Desvincular del perfil
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (err) { console.error(err); }
}

// --- UTILIDADES DE ESTRELLAS ---
function getEstrellasHtml(puntuacion, max = 10) {
    if (!puntuacion) return '';
    // Convertimos a base 5 visualmente para mantenerlo limpio (ej 8/10 -> 4/5 estrellas)
    const valor = Math.round(puntuacion / (max / 5)); 
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= valor) html += '<i class="fas fa-star text-warning"></i>';
        else html += '<i class="far fa-star text-secondary"></i>';
    }
    return `<div class="d-flex gap-1" title="${puntuacion}/${max}">${html}</div>`;
}

// --- GESTIÓN DE RESEÑAS DESDE PERFIL ---

async function eliminarMiResena(videojuegoId) {
    if(!confirm("¿Purgar reseña de los registros? Esta acción es irreversible.")) return;
    try {
        const res = await fetch(`${API_URL}/videojuegos/${videojuegoId}/resenas`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenActual}` }
        });
        if(!res.ok) throw new Error("Error al eliminar");
        mostrarNotificacion("Reseña eliminada", "success");
        cargarHistorialPerfil(perfilActualId);
        cargarVideojuegos(); // Refrescar media si es necesario
    } catch(e) { mostrarNotificacion(e.message, "error"); }
}

async function eliminarJuegoBibliotecaPerfil(videoId) {
    if(!confirm("¿Desvincular este título de tu biblioteca local?")) return;
    try {
        const res = await fetch(`${API_URL}/auth/biblioteca/${videoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenActual}` }
        });
        if(!res.ok) throw new Error("Error al desvincular");
        mostrarNotificacion("Juego desvinculado", "success");
        cargarBiblioteca();
        cargarHistorialPerfil(perfilActualId);
        // Actualizar estadistica de contador
        const statJuegos = document.getElementById('perfil-stat-juegos');
        if(statJuegos) statJuegos.innerText = parseInt(statJuegos.innerText) - 1;
    } catch(e) { mostrarNotificacion(e.message, "error"); }
}

// Variables para edición de reseña
let editandoResenaJuegoId = null;

function abrirEditarResena(juegoId, puntuacionActual, comentarioActual) {
    editandoResenaJuegoId = juegoId;
    
    // Rellenamos el modal (que hay que crear en index.html)
    const modalEl = document.getElementById('modalEditarResena');
    if(!modalEl) return;
    
    document.getElementById('editar-resena-puntos').value = puntuacionActual;
    document.getElementById('editar-resena-texto').value = comentarioActual || '';
    
    new bootstrap.Modal(modalEl).show();
}

async function guardarEdicionResena() {
    if(!editandoResenaJuegoId) return;
    const p = document.getElementById('editar-resena-puntos').value;
    const c = document.getElementById('editar-resena-texto').value;

    if (!p || p < 1 || p > 10) return mostrarNotificacion('Puntaje inválido (1-10)', 'error');

    try {
        const res = await fetch(`${API_URL}/videojuegos/${editandoResenaJuegoId}/resenas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
            body: JSON.stringify({ puntuacion: parseInt(p), comentario: c })
        });
        if(!res.ok) throw new Error("Error actualizando transmisión");
        
        mostrarNotificacion("Transmisión actualizada", "success");
        bootstrap.Modal.getInstance(document.getElementById('modalEditarResena')).hide();
        cargarHistorialPerfil(perfilActualId);
    } catch(e) { mostrarNotificacion(e.message, "error"); }
}

async function realizarLogin(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);

        usuarioActual = data.usuario;
        tokenActual = data.token;
        localStorage.setItem('gamehub_user', JSON.stringify(usuarioActual));
        localStorage.setItem('gamehub_token', tokenActual);

        const modalEl = document.getElementById('modalLogin');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();

        actualizarUICabecera();
        actualizarUIAdmin();
        mostrarNotificacion(`Identidad verificada: Agente ${usuarioActual.username}`, 'success');
        cargarVideojuegos();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

function actualizarUIAdmin() {
    const btnAdd = document.getElementById('admin-add-game');
    const adminMenuItem = document.getElementById('admin-menu-item'); // Nuevo elemento del dropdown
    const is_admin = usuarioActual && (usuarioActual.es_admin === true || usuarioActual.es_admin === 1 || usuarioActual.rol === 'admin' || usuarioActual.username === 'admin');

    if (btnAdd) {
        if (is_admin) {
            btnAdd.classList.remove('d-none');
        } else {
            btnAdd.classList.add('d-none');
        }
    }

    if (adminMenuItem) {
        if (is_admin) adminMenuItem.classList.remove('d-none');
        else adminMenuItem.classList.add('d-none');
    }

    // También actualizar botones en modales abiertos si los hubiera
    document.querySelectorAll('.admin-only').forEach(el => {
        if (is_admin) el.classList.remove('d-none');
        else el.classList.add('d-none');
    });
}

function abrirModalAdmin() {
    const modalEl = document.getElementById('modalAdminJuego');
    if (!modalEl) return;
    
    // Resetear formulario por si acaso
    juegoEnEdicion = null;
    document.getElementById('formAdminJuego')?.reset();
    const subBtn = document.querySelector('#formAdminJuego button[type="submit"]');
    if (subBtn) subBtn.textContent = 'SINCRONIZAR JUEGO';

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function persistirEnSQL() {
    try {
        const res = await fetch(`${API_URL}/admin/export-sql`, {
            headers: { 'Authorization': `Bearer ${tokenActual}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        mostrarNotificacion("Núcleo SQL sincronizado: Los cambios ahora son permanentes en el código.", "success");
    } catch (err) {
        mostrarNotificacion("Fallo en la persistencia SQL: " + err.message, "error");
    }
}

// Inyectar listener para el formulario admin
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formAdminJuego')?.addEventListener('submit', enviarNuevoJuego);
});

let juegoEnEdicion = null;

function abrirEditarJuego(id) {
    const j = videojuegosActuales.find(v => v.id === id);
    if (!j) return;

    juegoEnEdicion = id;

    // Rellenar formulario
    document.getElementById('adminTitulo').value = j.titulo;
    document.getElementById('adminGenero').value = j.genero;
    document.getElementById('adminDesarrollador').value = j.desarrollador;
    document.getElementById('adminPrecio').value = j.precio;
    document.getElementById('adminCalificacion').value = j.calificacion;
    document.getElementById('adminAnio').value = j.anio_lanzamiento;
    document.getElementById('adminPlataforma').value = j.plataforma || '';
    document.getElementById('adminMotor').value = j.motor || '';
    document.getElementById('adminDuracion').value = j.duracion || '';
    document.getElementById('adminPopularidad').value = j.popularidad || 0;
    document.getElementById('adminImagen').value = j.imagen_url;
    document.getElementById('adminDescripcion').value = j.descripcion;
    document.getElementById('adminEnlace').value = j.enlace_compra || '';

    // Cambiar texto del botón
    document.querySelector('#formAdminJuego button[type="submit"]').textContent = 'ACTUALIZAR TÍTULO';

    // Cerrar detalle y abrir admin
    bootstrap.Modal.getInstance(document.getElementById('modalDetalles')).hide();
    const modalAdmin = new bootstrap.Modal(document.getElementById('modalAdminJuego'));
    modalAdmin.show();
}

async function eliminarJuego(id) {
    if (!confirm('¿Seguro que deseas eliminar este título de los registros permanentes?')) return;

    try {
        const res = await fetch(`${API_URL}/videojuegos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenActual}` }
        });

        if (!res.ok) throw new Error('Error al purgar datos');

        mostrarNotificacion('Título eliminado correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalDetalles')).hide();
        cargarVideojuegos();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function enviarNuevoJuego(e) {
    e.preventDefault();
    const payload = {
        titulo: document.getElementById('adminTitulo').value,
        genero: document.getElementById('adminGenero').value,
        desarrollador: document.getElementById('adminDesarrollador').value,
        precio: parseFloat(document.getElementById('adminPrecio').value),
        calificacion: parseFloat(document.getElementById('adminCalificacion').value),
        anio_lanzamiento: parseInt(document.getElementById('adminAnio').value),
        plataforma: document.getElementById('adminPlataforma').value,
        motor: document.getElementById('adminMotor').value,
        duracion: document.getElementById('adminDuracion').value,
        popularidad: parseInt(document.getElementById('adminPopularidad').value) || 0,
        imagen_url: document.getElementById('adminImagen').value,
        descripcion: document.getElementById('adminDescripcion').value,
        enlace_compra: document.getElementById('adminEnlace').value || ""
    };

    try {
        const method = juegoEnEdicion ? 'PUT' : 'POST';
        const url = juegoEnEdicion ? `${API_URL}/videojuegos/${juegoEnEdicion}` : `${API_URL}/videojuegos`;

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenActual}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Error al sincronizar datos con el núcleo');

        mostrarNotificacion(juegoEnEdicion ? 'Registro actualizado' : 'Título registrado con éxito', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalAdminJuego')).hide();
        document.getElementById('formAdminJuego').reset();
        juegoEnEdicion = null;
        document.querySelector('#formAdminJuego button[type="submit"]').textContent = 'SINCRONIZAR JUEGO';
        cargarVideojuegos();
        
        // Auto-persistir tras cambio exitoso
        setTimeout(persistirEnSQL, 1000);
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function realizarRegistro(e) {
    e.preventDefault();
    const u = document.getElementById('registroUsername').value;
    const em = document.getElementById('registroEmail').value;
    const p = document.getElementById('registroPassword').value;
    const n = document.getElementById('registroNombre').value;

    try {
        const res = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p, email: em, nombre_completo: n })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Error al registrar nueva identidad');
        
        mostrarNotificacion('Firma digital registrada: Bienvenida a bordo, Agente ' + u, 'success');
        
        // Cerrar registro y abrir login
        const modalRegEl = document.getElementById('modalRegistro');
        bootstrap.Modal.getInstance(modalRegEl).hide();
        
        setTimeout(() => {
            const modalLogin = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLogin'));
            modalLogin.show();
        }, 500);

    } catch (err) { 
        mostrarNotificacion(err.message, 'error'); 
        console.error('Fallo en registro:', err);
    }
}

function cerrarSesion() {
    usuarioActual = null;
    tokenActual = null;
    localStorage.clear();
    location.reload();
}

function abrirEditarPerfil() {
    if (!usuarioActual) return;
    
    document.getElementById('edit-perfil-nombre').value = usuarioActual.nombre_completo || '';
    document.getElementById('edit-perfil-email').value = usuarioActual.email || '';
    document.getElementById('edit-perfil-avatar').value = usuarioActual.avatar_url || '';
    document.getElementById('edit-perfil-bio').value = usuarioActual.biografia || '';
    
    new bootstrap.Modal(document.getElementById('modalEditarPerfil')).show();
}

async function guardarCambiosPerfil(e) {
    if (e) e.preventDefault();
    
    const payload = {
        nombre_completo: document.getElementById('edit-perfil-nombre').value,
        email: document.getElementById('edit-perfil-email').value,
        avatar_url: document.getElementById('edit-perfil-avatar').value,
        biografia: document.getElementById('edit-perfil-bio').value
    };
    
    try {
        const res = await fetch(`${API_URL}/auth/perfil/update`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${tokenActual}` 
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || "Error al actualizar perfil");
        
        usuarioActual = data.usuario;
        localStorage.setItem('gamehub_user', JSON.stringify(usuarioActual));
        
        mostrarNotificacion("Perfil actualizado correctamente", "success");
        bootstrap.Modal.getInstance(document.getElementById('modalEditarPerfil')).hide();
        
        // Refrescar UI
        abrirPerfilUsuario(usuarioActual.id);
        actualizarUICabecera();
        
    } catch (err) {
        mostrarNotificacion(err.message, "error");
    }
}

function actualizarUICabecera() {
    if (usuarioActual) {
        document.getElementById('auth-buttons')?.classList.add('d-none');
        document.getElementById('user-profile')?.classList.remove('d-none');
        document.getElementById('user-profile')?.classList.add('d-flex');
        const av = document.getElementById('user-avatar');
        if (av) av.src = usuarioActual.avatar_url;
        const un = document.getElementById('user-name');
        if (un) un.textContent = usuarioActual.username;
        cargarBiblioteca();
        actualizarUIAdmin();
    }
}

async function cargarBiblioteca() {
    if (!tokenActual) return;
    try {
        const res = await fetch(`${API_URL}/auth/biblioteca`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
        miBiblioteca = await res.json();
    } catch (err) { }
}

async function marcarComoJugadoActual() {
    try {
        await fetch(`${API_URL}/auth/biblioteca`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
            body: JSON.stringify({ videojuego_id: juegoActualId })
        });
        await cargarBiblioteca();
        actualizarBotonBiblioteca(juegoActualId);
        mostrarNotificacion('Título vinculado a tu archivo personal', 'success');
    } catch (err) { }
}

function actualizarBotonBiblioteca(id) {
    const btn = document.getElementById('btn-marcar-jugado');
    if (!btn) return;
    btn.classList.remove('d-none');
    const ya = miBiblioteca.some(j => j.id === id);
    btn.disabled = ya;
    btn.innerText = ya ? 'VINCULADO AL HUB' : 'VINCULAR TÍTULO';
}

// ==================== UTILS ====================

// ==================== LÓGICA DE BÚSQUEDA AVANZADA ====================

function manejarInputBusqueda(valor, suggestionsId) {
    busquedaState.ultimoNombre = valor;
    
    // 1. Manejar Sugerencias
    if (valor.length >= 2) {
        cargarSugerencias(valor, suggestionsId);
    } else {
        toggleSuggestions(suggestionsId, true);
    }

    // 2. Debounce para búsqueda real (Búsqueda profunda en grid)
    clearTimeout(busquedaState.debounceTimer);
    busquedaState.debounceTimer = setTimeout(() => {
        // Solo actualizar el grid si estamos en la sección de búsqueda
        // De lo contrario, dejar que el usuario use el dropdown rápido
        if (seccionActual === 'seccion-busqueda') {
            ejecutarBusquedaAvanzada(true);
        }
    }, 800);
}

async function cargarSugerencias(query, suggestionsId) {
    try {
        const res = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderSugerencias(data, suggestionsId);
    } catch (err) {}
}

function renderSugerencias(data, suggestionsId) {
    const el = document.getElementById(suggestionsId);
    if (!el) return;
    
    if (data.length === 0) {
        el.classList.add('d-none');
        return;
    }

    el.innerHTML = data.map(s => `
        <div class="suggestion-item" onclick="verDetalles(${s.id}); toggleSuggestions('${suggestionsId}', true)">
            <img src="${s.imagen_url || s.image_url}" class="suggestion-img" loading="lazy">
            <div class="suggestion-info">
                <div class="suggestion-title">${s.titulo}</div>
                <div class="suggestion-meta">
                    <span>${s.genero}</span>
                    <span>•</span>
                    <span>${s.anio_lanzamiento || s.anio}</span>
                </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-1">
                <div class="suggestion-price">${s.precio > 0 ? '€' + s.precio.toFixed(2) : 'GRATIS'}</div>
                <div class="suggestion-score">${s.calificacion ? s.calificacion.toFixed(1) : (s.score ? s.score.toFixed(1) : '-')}</div>
            </div>
        </div>
    `).join('');
    el.classList.remove('d-none');
}

function toggleSuggestions(id, hide = false) {
    if (id) {
        const el = document.getElementById(id);
        if (el) hide ? el.classList.add('d-none') : el.classList.remove('d-none');
    } else {
        document.querySelectorAll('.suggestions-dropdown').forEach(el => el.classList.add('d-none'));
    }
}

async function ejecutarBusquedaAvanzada(reset = false) {
    if (reset) {
        busquedaState.pagina = 0;
        busquedaState.hasMore = true;
    }

    if (busquedaState.loading || (!busquedaState.hasMore && !reset)) return;

    const nombre = document.getElementById('busquedaNombre')?.value || '';
    const genero = document.getElementById('filtroGenero')?.value || '';
    const plataforma = document.getElementById('filtroPlataforma')?.value || '';
    const filtroPrecio = document.getElementById('filtroPrecio')?.value || '';
    const nota = document.getElementById('filtroPuntuacion')?.value || '';
    const anio = document.getElementById('filtroAnio')?.value || '';
    const ordenar = document.getElementById('ordenarResultados')?.value || '';

    let pMin = '';
    let pMax = '';

    if (filtroPrecio === '0') {
        pMax = '0';
    } else if (filtroPrecio === '20') {
        pMax = '20';
    } else if (filtroPrecio === '50') {
        pMax = '50';
    } else if (filtroPrecio === 'max') {
        pMin = '50';
    }

    busquedaState.loading = true;
    document.getElementById('fb-loading')?.classList.remove('d-none');
    if (reset) document.getElementById('exploradorContainer').innerHTML = '';

    const params = new URLSearchParams({
        nombre, genero, plataforma, anio, ordenar,
        precio_min: pMin,
        precio_max: pMax,
        puntuacion_min: nota,
        limit: busquedaState.limite,
        offset: busquedaState.pagina * busquedaState.limite
    });

    try {
        const res = await fetch(`${API_URL}/search?${params.toString()}`);
        const data = await res.json();
        
        busquedaState.total = data.total;
        busquedaState.hasMore = (busquedaState.pagina + 1) * busquedaState.limite < data.total;
        
        mostrarResultadosExplorador(data.resultados, !reset, nombre);
        actualizarUIBusqueda();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        busquedaState.loading = false;
        document.getElementById('fb-loading')?.classList.add('d-none');
    }
}

function cargarMasResultados() {
    busquedaState.pagina++;
    ejecutarBusquedaAvanzada();
}

function actualizarUIBusqueda() {
    const btn = document.getElementById('btnCargarMas');
    const label = document.getElementById('totalResultadosLabel');
    
    if (btn) {
        busquedaState.hasMore ? btn.classList.remove('d-none') : btn.classList.add('d-none');
    }
    
    if (label) {
        label.innerText = `Mostrando ${Math.min((busquedaState.pagina + 1) * busquedaState.limite, busquedaState.total)} de ${busquedaState.total} títulos`;
    }

    actualizarActiveFilters();
}

function actualizarActiveFilters() {
    const container = document.getElementById('activeFiltersContainer');
    const monitor = document.getElementById('resultCounter');
    if (!container) return;

    const filters = [];
    const pushFilter = (id, label, icon) => {
        const el = document.getElementById(id);
        if (el?.value && el.value !== "") {
            const text = el.options ? el.options[el.selectedIndex].text : el.value;
            filters.push({ id, label: `${label}: ${text}`, icon });
        }
    };

    const q = document.getElementById('busquedaNombre')?.value;
    if (q) filters.push({ id: 'busquedaNombre', label: `QUERY: ${q}`, icon: 'crosshair' });
    
    pushFilter('filtroGenero', 'TYPE', 'project-diagram');
    pushFilter('filtroPlataforma', 'HOST', 'desktop');
    pushFilter('filtroPuntuacion', 'RANK', 'star');
    pushFilter('filtroAnio', 'EXEC', 'calendar-alt');

    container.innerHTML = filters.map(f => `
        <div class="pro-tag">
            <i class="fas fa-${f.icon} opacity-50"></i>
            <span>${f.label}</span>
            <i class="fas fa-times-circle" onclick="purgarFiltro('${f.id}')"></i>
        </div>
    `).join('');

    // Sincronizar contador de resultados
    if (monitor) {
        monitor.innerText = `SYNCED: ${busquedaState.total} NODES`;
    }
}

function purgarFiltro(id) {
    const el = document.getElementById(id);
    if (el) {
        el.value = "";
        ejecutarBusquedaAvanzada(true);
    }
}

function resetearFiltros() {
    ['busquedaNombre', 'navBusqueda', 'filtroGenero', 'filtroPlataforma', 'filtroPuntuacion', 'filtroAnio', 'filtroPrecio', 'ordenarResultados'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ejecutarBusquedaAvanzada(true);
}

function getRatingColor(r) {
    if (r >= 9) return 'var(--accent-success)';
    if (r >= 7) return 'var(--accent-primary)';
    return '#ff375f';
}

function mostrarNotificacion(msg, type) {
    const toast = document.getElementById('toastNotificacion');
    if (!toast) return;
    document.getElementById('toastMensaje').innerText = msg;
    toast.className = `toast show text-white border-0 bg-${type === 'error' ? 'danger' : 'success'}`;
    setTimeout(() => toast.classList.remove('show'), 4000);
}




function toggleAdvancedSearchHeader() {
    mostrarSeccion('seccion-busqueda');
    const panel = document.getElementById('panelAvanzado');
    if (panel) {
        const bsCollapse = new bootstrap.Collapse(panel, { toggle: true });
    }
}
