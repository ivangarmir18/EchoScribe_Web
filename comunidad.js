/**
 * EchoScribe - Módulo de Guías y Comunidad
 * Subforos temáticos, comentarios con y sin sesión, valoraciones y sugerencias de mejora.
 * Diseño 100% vectorial con SVG (sin emojis).
 */

(function () {
    'use strict';

    const STORAGE_KEY_FORUM = 'echoscribe_comunidad_threads_v2';
    const STORAGE_KEY_REVIEWS = 'echoscribe_comunidad_reviews_v2';
    const STORAGE_KEY_USER_VOTES = 'echoscribe_user_votes_v2';
    const STORAGE_KEY_GUIDE_COMMENTS = 'echoscribe_guia_comments_v2';

    // 5 Subforos Temáticos
    const SUBFOROS = [
        {
            id: 'todos',
            nombre: 'Todos los Debates',
            desc: 'Todas las conversaciones activas de la comunidad',
            color: 'indigo',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>'
        },
        {
            id: 'estudiantes',
            nombre: 'Estudiantes & Universidad',
            desc: 'Clases magistrales, apuntes con Gemini, exámenes y TFG',
            color: 'blue',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"/></svg>'
        },
        {
            id: 'creadores',
            nombre: 'Creadores & Redes',
            desc: 'Subtítulos SRT, YouTube, Reels, Premiere, DaVinci y CapCut',
            color: 'purple',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'
        },
        {
            id: 'empresa',
            nombre: 'Empresa & Periodismo',
            desc: 'Reuniones de Zoom/Teams, actas, entrevistas confidenciales',
            color: 'emerald',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'
        },
        {
            id: 'tecnologia',
            nombre: 'Tecnología & Comparativas',
            desc: 'Whisper Large v3, GPU Cloud, benchmarks y compatibilidad',
            color: 'amber',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
        },
        {
            id: 'mejoras',
            nombre: 'Sugerencias de Mejora',
            desc: 'Peticiones de funciones, ideas de la comunidad y feedback directo',
            color: 'rose',
            svgIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>'
        }
    ];

    // Datos semilla para el foro (CERO emojis, tono realista y profesional)
    const SEED_THREADS = [
        {
            id: 'th-1',
            category: 'estudiantes',
            title: 'Flujo de trabajo para clases de 2 horas: Whisper GPU + prompt de estudio con Gemini',
            content: 'Buenas a todos. Quería compartir cómo organizo las clases de Derecho Mercantil. Grabo con la grabadora del móvil en M4A, paso el audio a EchoScribe seleccionando "Corrección Gemini para Apuntes", y en menos de 40 segundos tengo el texto limpio sin muletillas ni carraspeos del profesor. Luego le pido a Gemini un cuadro sinóptico de artículos del Código de Comercio y me ahorra literalmente semanas de trabajo antes de parciales.',
            author: 'Marc P.',
            isVerified: true,
            userRole: 'Estudiante Universitario',
            date: 'Hace 4 horas',
            timestamp: Date.now() - 1000 * 60 * 60 * 4,
            upvotes: 24,
            tags: ['Universidad', 'Gemini AI', 'Apuntes'],
            replies: [
                {
                    id: 'rep-1-1',
                    author: 'Carlos G.',
                    isVerified: false,
                    content: 'Totalmente de acuerdo. Yo tenía problemas antes con grabaciones lejanas desde la última fila del aula, pero al no tener compresión destructiva en la GPU lo saca nítido.',
                    date: 'Hace 2 horas'
                },
                {
                    id: 'rep-1-2',
                    author: 'Elena R.',
                    isVerified: true,
                    content: 'Un consejo extra: si el profesor menciona mucha jurisprudencia en latín, pon en el campo de contexto de la app los términos clave para que no los confunda.',
                    date: 'Hace 45 minutos'
                }
            ]
        },
        {
            id: 'th-2',
            category: 'creadores',
            title: 'Sincronización de subtítulos .SRT cortos para Shorts y Reels sin palabras sueltas',
            content: 'Para los que editan en Premiere o CapCut Desktop: he probado el perfil "Corto" de EchoScribe (18-24 caracteres) y es una maravilla porque respeta las pausas naturales de respiración en lugar de cortar palabras a la mitad como hace el auto-caption por defecto de otras herramientas. ¿Alguien ha probado a importar el archivo a DaVinci Resolve 19?',
            author: 'Sergio M.',
            isVerified: true,
            userRole: 'Editor de Vídeo',
            date: 'Ayer',
            timestamp: Date.now() - 1000 * 60 * 60 * 26,
            upvotes: 38,
            tags: ['Subtítulos SRT', 'CapCut', 'Premiere'],
            replies: [
                {
                    id: 'rep-2-1',
                    author: 'David Editor',
                    isVerified: true,
                    content: 'En DaVinci Resolve entra perfecto como pista de subtítulo estándar. Solo asegúrate de marcar "Subtitle Track -> Style" para elegir tu tipografía preferida.',
                    date: 'Ayer'
                }
            ]
        },
        {
            id: 'th-3',
            category: 'empresa',
            title: 'Privacidad y entrevistas en investigación clínica con pacientes',
            content: 'En nuestro departamento médico necesitamos transcripciones fiables de entrevistas cualitativas sin que los audios queden almacenados en servidores de terceros ni se utilicen para entrenar modelos públicos. La arquitectura de procesar y borrar inmediatamente tras la inferencia nos da total tranquilidad con el RGPD.',
            author: 'Dra. Beatriz S.',
            isVerified: true,
            userRole: 'Investigación Biomédica',
            date: 'Hace 2 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 48,
            upvotes: 19,
            tags: ['Privacidad', 'RGPD', 'Entrevistas'],
            replies: [
                {
                    id: 'rep-3-1',
                    author: 'Iván Miranda',
                    isVerified: true,
                    userRole: 'Desarrollador',
                    content: 'Efectivamente, Dra. Beatriz. Los servidores GPU Cloud no conservan ninguna copia de los archivos de audio ni del texto resultante tras completar la petición de transcripción.',
                    date: 'Hace 1 día'
                }
            ]
        },
        {
            id: 'th-4',
            category: 'tecnologia',
            title: 'Whisper Large v3 vs motores fonéticos de escritorio: comparativa con ruido ambiente',
            content: 'Hice una prueba con un archivo de 45 minutos grabado en una cafetería con murmullos y vajilla de fondo. Con el modelo base que viene en muchas apps locales se quedaba en bucles infinitos repitiendo frases. El modelo Large v3 ejecutado en la GPU de EchoScribe no solo filtró el ruido de fondo sino que aisló con precisión la voz del interlocutor.',
            author: 'Guillermo F.',
            isVerified: false,
            userRole: 'Ingeniero de Sonido',
            date: 'Hace 3 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 72,
            upvotes: 42,
            tags: ['Whisper Large', 'Ruido', 'GPU Cloud'],
            replies: []
        },
        {
            id: 'th-5',
            category: 'mejoras',
            title: 'Propuesta: Glosario personalizado de nombres propios por proyecto',
            content: 'Sería muy útil tener una opción para guardar listas de nombres técnicos o siglas frecuentes (por ejemplo por materia o por cliente) para no tener que escribirlos cada vez en el campo de corrección de Gemini. ¿Qué opináis?',
            author: 'Laura G.',
            isVerified: true,
            userRole: 'Traductora & Redactora',
            date: 'Hace 4 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 96,
            upvotes: 56,
            tags: ['Propuesta', 'Glosario', 'Productividad'],
            replies: [
                {
                    id: 'rep-5-1',
                    author: 'Iván Miranda',
                    isVerified: true,
                    userRole: 'Desarrollador',
                    content: 'Excelente propuesta Laura. Lo tenemos anotado en el roadmap para permitir crear perfiles de vocabulario reutilizables en la app de escritorio.',
                    date: 'Hace 3 días'
                }
            ]
        }
    ];

    // Datos semilla para las Reseñas y Mejoras (CERO emojis, valoraciones 100% vectoriales)
    const SEED_REVIEWS = [
        {
            id: 'rev-1',
            author: 'Marcos V.',
            role: 'Periodista Deportivo',
            isVerified: true,
            rating: 5,
            title: 'La corrección de nombres de jugadores me ahorra horas',
            content: 'En ruedas de prensa de fútbol internacional los transcriptores genéricos inventan los apellidos de jugadores extranjeros. Con la integración de Gemini y las plantillas reales, EchoScribe escribe los nombres exactos al primer intento.',
            date: 'Hace 3 días',
            helpfulCount: 29
        },
        {
            id: 'rev-2',
            author: 'Lucía T.',
            role: 'Estudiante de Medicina',
            isVerified: true,
            rating: 5,
            title: 'Imprescindible para las clases de Anatomía y Farmacología',
            content: 'Paso las clases grabadas y en 30 segundos tengo el texto limpio listo para pasar a Notion y generar esquemas con IA. La velocidad con la GPU Cloud es incomparable con esperar 20 minutos en local.',
            date: 'Hace 5 días',
            helpfulCount: 34
        },
        {
            id: 'rev-3',
            author: 'David K.',
            role: 'Editor Audiovisual & Creador',
            isVerified: true,
            rating: 5,
            title: 'Subtítulos .SRT limpios sin palabras cortadas a mitad',
            content: 'Descript me consumía toda la RAM y la sincronización a veces dejaba palabras huérfanas. Con EchoScribe exporto el .SRT directo a DaVinci Resolve y la temporización es milimétrica.',
            date: 'Hace 1 semana',
            helpfulCount: 18
        },
        {
            id: 'rev-4',
            author: 'Andrea B.',
            role: 'Consultora de Negocio',
            isVerified: true,
            rating: 5,
            title: 'Actas de reuniones de Zoom de 1 hora en menos de 2 minutos',
            content: 'Grabo las reuniones con clientes y obtengo un acta ejecutiva ordenada por temas clave e intervenciones. Ha mejorado notablemente el seguimiento de compromisos con los equipos.',
            date: 'Hace 1 semana',
            helpfulCount: 15
        },
        {
            id: 'rev-5',
            author: 'Roberto C.',
            role: 'Investigador Social',
            isVerified: true,
            rating: 4,
            title: 'Muy buena precisión fonética y excelente política de privacidad',
            content: 'La calidad con acentos del sur de España y de Latinoamérica es de las mejores que he probado. Le pongo 4 estrellas porque me gustaría que tuviera también opción de traducción directa al inglés en el mismo proceso.',
            date: 'Hace 2 semanas',
            helpfulCount: 12
        },
        {
            id: 'rev-6',
            author: 'Nuria M.',
            role: 'Productora de Podcast',
            isVerified: true,
            rating: 5,
            title: 'La app de escritorio en Windows es ultraligera',
            content: 'No pesa prácticamente nada, no ralentiza el ordenador mientras edito audio en Reaper y los servidores en la nube hacen todo el trabajo pesado. Una herramienta indispensable.',
            date: 'Hace 2 semanas',
            helpfulCount: 21
        }
    ];

    // Helpers de almacenamiento local
    function getStoredThreads() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_FORUM);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn('Error leyendo hilos:', e);
        }
        localStorage.setItem(STORAGE_KEY_FORUM, JSON.stringify(SEED_THREADS));
        return SEED_THREADS;
    }

    function saveStoredThreads(threads) {
        try {
            localStorage.setItem(STORAGE_KEY_FORUM, JSON.stringify(threads));
        } catch (e) {
            console.warn('Error guardando hilos:', e);
        }
    }

    function getStoredReviews() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_REVIEWS);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn('Error leyendo reseñas:', e);
        }
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(SEED_REVIEWS));
        return SEED_REVIEWS;
    }

    function saveStoredReviews(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
        } catch (e) {
            console.warn('Error guardando reseñas:', e);
        }
    }

    function getUserVotes() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_USER_VOTES);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn('Error leyendo votos:', e);
        }
        return { threads: {}, reviews: {} };
    }

    function saveUserVotes(votes) {
        try {
            localStorage.setItem(STORAGE_KEY_USER_VOTES, JSON.stringify(votes));
        } catch (e) {
            console.warn('Error guardando votos:', e);
        }
    }

    // Helper para estrellas SVG
    function renderStarsSvg(rating, max = 5, sizeClass = 'w-4 h-4') {
        let html = '<div class="inline-flex items-center gap-0.5 text-amber-400">';
        for (let i = 1; i <= max; i++) {
            if (i <= rating) {
                html += `<svg class="${sizeClass} fill-amber-400 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
            } else {
                html += `<svg class="${sizeClass} fill-slate-700 text-slate-600" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
            }
        }
        html += '</div>';
        return html;
    }

    // Iniciales para el avatar vectorial
    function getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    // Comprobación del usuario actual en Supabase
    async function getCurrentUser() {
        try {
            if (window.sb && window.sb.auth) {
                const { data } = await window.sb.auth.getUser();
                if (data && data.user) {
                    const email = data.user.email || '';
                    const meta = data.user.user_metadata || {};
                    const name = meta.full_name || meta.name || email.split('@')[0] || 'Usuario Registrado';
                    return {
                        isLoggedIn: true,
                        id: data.user.id,
                        email: email,
                        name: name
                    };
                }
            }
        } catch (e) {
            console.warn('Error verificando sesión Supabase:', e);
        }
        return {
            isLoggedIn: false,
            id: null,
            email: null,
            name: null
        };
    }

    // Estado local de la interfaz
    let currentSubforo = 'todos';
    let searchQuery = '';
    let currentRatingFilter = 'todas';
    let selectedRatingInForm = 5;

    // Renderizar Selector de Subforos
    function renderSubforosBar() {
        const bar = document.createElement('div');
        bar.className = 'flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth';

        SUBFOROS.forEach(sub => {
            const isActive = currentSubforo === sub.id;
            const btn = document.createElement('button');
            btn.className = `px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
            }`;
            btn.innerHTML = `${sub.svgIcon}<span>${sub.nombre}</span>`;
            btn.onclick = () => {
                currentSubforo = sub.id;
                renderForumSection();
            };
            bar.appendChild(btn);
        });

        return bar;
    }

    // Renderizar la sección completa del Foro
    async function renderForumSection() {
        const container = document.getElementById('comunidad-foro-view');
        if (!container) return;

        const user = await getCurrentUser();
        const threads = getStoredThreads();
        const votes = getUserVotes();

        // Filtrar por subforo y búsqueda
        const filteredThreads = threads.filter(t => {
            const matchSubforo = (currentSubforo === 'todos') || (t.category === currentSubforo);
            const matchSearch = !searchQuery || 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            return matchSubforo && matchSearch;
        });

        container.innerHTML = `
            <!-- BARRA SUPERIOR: SUBFOROS Y ACCIONES -->
            <div id="subforos-chips-container"></div>

            <!-- CONTROLES: BÚSQUEDA Y BOTÓN NUEVO HILO -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
                <div class="relative flex-1 max-w-lg">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </span>
                    <input 
                        type="text" 
                        id="comunidad-search-input" 
                        value="${escapeHtml(searchQuery)}" 
                        placeholder="Buscar por palabra clave, técnica o etiqueta..." 
                        class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                </div>

                <div class="flex items-center gap-3">
                    <button 
                        id="btn-open-nuevo-debate" 
                        class="btn-gradient text-white text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        <span>Crear Nuevo Debate</span>
                    </button>
                </div>
            </div>

            <!-- FORMULARIO DE NUEVO DEBATE (COLAPSABLE / DESPLEGABLE) -->
            <div id="nuevo-debate-box" class="hidden mb-10 glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl relative">
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Publicar un Nuevo Debate</h3>
                            <p class="text-[11px] text-slate-400">Comparte dudas, guías o soluciones con toda la comunidad</p>
                        </div>
                    </div>
                    <button id="btn-close-nuevo-debate" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form id="form-nuevo-debate" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Subforo de Destino</label>
                            <select id="input-debate-categoria" class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500">
                                <option value="estudiantes">Estudiantes & Universidad</option>
                                <option value="creadores">Creadores & Redes (SRT, Premiere, CapCut)</option>
                                <option value="empresa">Empresa & Periodismo (Reuniones, Actas)</option>
                                <option value="tecnologia">Tecnología & Comparativas (Whisper, GPU)</option>
                                <option value="mejoras">Sugerencias de Mejora & Peticiones</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Nombre o Alias</label>
                            <input 
                                type="text" 
                                id="input-debate-autor" 
                                value="${user.isLoggedIn ? escapeHtml(user.name) : ''}" 
                                placeholder="${user.isLoggedIn ? 'Tu nombre de usuario' : 'Ej: Alejandro o Anónimo'}" 
                                class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Título del Debate</label>
                        <input 
                            type="text" 
                            id="input-debate-titulo" 
                            placeholder="Sé claro y descriptivo (ej: Cómo optimizar apuntes de audio de 3 horas)" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Detalle del Mensaje</label>
                        <textarea 
                            id="input-debate-contenido" 
                            rows="4" 
                            placeholder="Explica tu caso, el formato de archivo que usas, la solución encontrada o la consulta..." 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                            required
                        ></textarea>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="input-debate-anonimo" class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
                            <label for="input-debate-anonimo" class="text-xs text-slate-400 cursor-pointer">
                                Publicar en modo anónimo (no vincular mi cuenta registrada)
                            </label>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" id="btn-cancel-nuevo-debate" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-gradient text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                <span>Publicar Debate</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- LISTADO DE HILOS -->
            <div class="space-y-5" id="threads-container">
                ${filteredThreads.length === 0 ? `
                    <div class="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400">
                        <div class="w-12 h-12 mx-auto mb-3 text-slate-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <p class="text-sm font-semibold text-slate-300 mb-1">No se encontraron debates con este criterio</p>
                        <p class="text-xs text-slate-500">Sé el primero en iniciar una conversación en este subforo.</p>
                    </div>
                ` : filteredThreads.map(thread => renderThreadCardHtml(thread, votes.threads[thread.id])).join('')}
            </div>
        `;

        // Montar chips de subforos
        const chipsContainer = document.getElementById('subforos-chips-container');
        if (chipsContainer) {
            chipsContainer.appendChild(renderSubforosBar());
        }

        // Listener de búsqueda con debounce
        const searchInput = document.getElementById('comunidad-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderForumSection();
            });
        }

        // Mostrar / Ocultar formulario nuevo debate
        const btnOpen = document.getElementById('btn-open-nuevo-debate');
        const boxNuevo = document.getElementById('nuevo-debate-box');
        const btnClose = document.getElementById('btn-close-nuevo-debate');
        const btnCancel = document.getElementById('btn-cancel-nuevo-debate');

        if (btnOpen && boxNuevo) {
            btnOpen.onclick = () => {
                boxNuevo.classList.remove('hidden');
                document.getElementById('input-debate-titulo')?.focus();
            };
        }
        if (btnClose && boxNuevo) {
            btnClose.onclick = () => boxNuevo.classList.add('hidden');
        }
        if (btnCancel && boxNuevo) {
            btnCancel.onclick = () => boxNuevo.classList.add('hidden');
        }

        // Enviar nuevo debate
        const formNuevo = document.getElementById('form-nuevo-debate');
        if (formNuevo) {
            formNuevo.onsubmit = (e) => {
                e.preventDefault();
                const categoria = document.getElementById('input-debate-categoria').value;
                const autor = document.getElementById('input-debate-autor').value.trim();
                const titulo = document.getElementById('input-debate-titulo').value.trim();
                const contenido = document.getElementById('input-debate-contenido').value.trim();
                const isAnon = document.getElementById('input-debate-anonimo').checked;

                if (!titulo || !contenido || !autor) return;

                const newThread = {
                    id: 'th-' + Date.now(),
                    category: categoria,
                    title: titulo,
                    content: contenido,
                    author: isAnon ? 'Usuario Anónimo' : autor,
                    isVerified: !isAnon && user.isLoggedIn,
                    userRole: isAnon ? 'Miembro Anónimo' : (user.isLoggedIn ? 'Usuario Registrado' : 'Miembro de la Comunidad'),
                    date: 'Ahora mismo',
                    timestamp: Date.now(),
                    upvotes: 1,
                    tags: [categoria.toUpperCase()],
                    replies: []
                };

                const allThreads = getStoredThreads();
                allThreads.unshift(newThread);
                saveStoredThreads(allThreads);

                // Auto-votar positivo propio
                const curVotes = getUserVotes();
                curVotes.threads[newThread.id] = true;
                saveUserVotes(curVotes);

                renderForumSection();
            };
        }

        // Adjuntar listeners de hilos (votos, respuestas)
        attachThreadActionListeners(user);
    }

    // Generar tarjeta HTML de un hilo
    function renderThreadCardHtml(thread, hasVoted) {
        const subforo = SUBFOROS.find(s => s.id === thread.category) || SUBFOROS[1];
        const initials = getInitials(thread.author);

        return `
            <div class="glass-card card-interactive rounded-3xl p-6 sm:p-7 border border-slate-800 transition" id="card-${thread.id}">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">
                            ${escapeHtml(initials)}
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-bold text-white">${escapeHtml(thread.author)}</span>
                                ${thread.isVerified ? `
                                    <span title="Usuario Verificado" class="text-indigo-400">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </span>
                                ` : ''}
                                <span class="text-[10px] text-slate-500">·</span>
                                <span class="text-[10px] text-slate-400">${escapeHtml(thread.date)}</span>
                            </div>
                            <span class="text-[10px] text-slate-500 font-medium">${escapeHtml(thread.userRole || 'Miembro')}</span>
                        </div>
                    </div>

                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-indigo-300 border border-slate-700 shrink-0">
                        ${escapeHtml(subforo.nombre.split('&')[0].trim())}
                    </span>
                </div>

                <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug hover:text-indigo-400 transition cursor-pointer" onclick="window.EchoScribeComunidad.toggleReplies('${thread.id}')">
                    ${escapeHtml(thread.title)}
                </h3>

                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 whitespace-pre-line">
                    ${escapeHtml(thread.content)}
                </p>

                <!-- ETIQUETAS -->
                ${thread.tags && thread.tags.length ? `
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        ${thread.tags.map(tag => `
                            <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                #${escapeHtml(tag)}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- PIE: VOTOS Y COMENTARIOS -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <div class="flex items-center gap-2">
                        <button 
                            class="btn-vote-thread px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-semibold ${
                                hasVoted
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white'
                            }" 
                            data-thread-id="${thread.id}"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2m-7 0H4a2 2 0 00-2 2v7a2 2 0 002 2h3"/></svg>
                            <span>${thread.upvotes || 0}</span>
                        </button>

                        <button 
                            class="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white flex items-center gap-1.5 transition font-semibold"
                            onclick="window.EchoScribeComunidad.toggleReplies('${thread.id}')"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            <span>${thread.replies ? thread.replies.length : 0} respuestas</span>
                        </button>
                    </div>

                    <button 
                        class="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1 transition"
                        onclick="window.EchoScribeComunidad.toggleReplies('${thread.id}')"
                    >
                        <span>Responder</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                </div>

                <!-- CONTENEDOR DESPLEGABLE DE RESPUESTAS -->
                <div id="replies-box-${thread.id}" class="hidden mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <div class="space-y-3" id="replies-list-${thread.id}">
                        ${(thread.replies && thread.replies.length) ? thread.replies.map(rep => `
                            <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
                                <div class="flex items-center gap-2 mb-1.5">
                                    <div class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                        ${escapeHtml(getInitials(rep.author))}
                                    </div>
                                    <span class="text-xs font-bold text-white">${escapeHtml(rep.author)}</span>
                                    ${rep.isVerified ? `
                                        <span title="Verificado" class="text-indigo-400">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        </span>
                                    ` : ''}
                                    <span class="text-[10px] text-slate-500">·</span>
                                    <span class="text-[10px] text-slate-400">${escapeHtml(rep.date)}</span>
                                </div>
                                <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(rep.content)}</p>
                            </div>
                        `).join('') : '<p class="text-xs text-slate-500 italic py-2">No hay respuestas aún. ¡Sé el primero en contestar!</p>'}
                    </div>

                    <!-- FORMULARIO DE RESPUESTA RÁPIDA -->
                    <form class="form-reply-thread flex flex-col sm:flex-row gap-2 mt-3" data-thread-id="${thread.id}">
                        <input 
                            type="text" 
                            name="reply_content" 
                            placeholder="Escribe tu respuesta a este debate..." 
                            class="flex-1 bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            required
                        />
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition shrink-0 flex items-center justify-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                            <span>Enviar</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    // Listeners de interacciones en hilos
    function attachThreadActionListeners(user) {
        // Votos en hilos
        document.querySelectorAll('.btn-vote-thread').forEach(btn => {
            btn.onclick = () => {
                const threadId = btn.getAttribute('data-thread-id');
                const threads = getStoredThreads();
                const votes = getUserVotes();
                const target = threads.find(t => t.id === threadId);
                if (!target) return;

                if (votes.threads[threadId]) {
                    // Quitar voto
                    target.upvotes = Math.max(0, (target.upvotes || 1) - 1);
                    delete votes.threads[threadId];
                } else {
                    // Dar voto
                    target.upvotes = (target.upvotes || 0) + 1;
                    votes.threads[threadId] = true;
                }

                saveStoredThreads(threads);
                saveUserVotes(votes);
                renderForumSection();
            };
        });

        // Respuestas a hilos
        document.querySelectorAll('.form-reply-thread').forEach(form => {
            form.onsubmit = (e) => {
                e.preventDefault();
                const threadId = form.getAttribute('data-thread-id');
                const input = form.querySelector('input[name="reply_content"]');
                const content = input ? input.value.trim() : '';
                if (!content) return;

                const threads = getStoredThreads();
                const target = threads.find(t => t.id === threadId);
                if (!target) return;

                if (!target.replies) target.replies = [];

                target.replies.push({
                    id: 'rep-' + Date.now(),
                    author: user.isLoggedIn ? user.name : 'Usuario Anónimo',
                    isVerified: user.isLoggedIn,
                    content: content,
                    date: 'Ahora mismo'
                });

                saveStoredThreads(threads);
                renderForumSection();

                // Asegurar que el contenedor quede abierto tras refrescar
                setTimeout(() => {
                    const box = document.getElementById(`replies-box-${threadId}`);
                    if (box) box.classList.remove('hidden');
                }, 50);
            };
        });
    }

    // Renderizar la sección completa de Reseñas y Mejoras
    async function renderReviewsSection() {
        const container = document.getElementById('comunidad-resenas-view');
        if (!container) return;

        const user = await getCurrentUser();
        const reviews = getStoredReviews();
        const votes = getUserVotes();

        // Cálculo de promedio
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : '5.0';

        // Distribución por estrellas (5, 4, 3, 2, 1)
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const stars = Math.min(5, Math.max(1, r.rating || 5));
            counts[stars] = (counts[stars] || 0) + 1;
        });

        // Filtrado
        const filteredReviews = reviews.filter(r => {
            if (currentRatingFilter === 'todas') return true;
            return r.rating === parseInt(currentRatingFilter, 10);
        });

        container.innerHTML = `
            <!-- HEADER RESUMEN VALORACIONES -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 mb-8 relative overflow-hidden">
                <div class="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <!-- NOTA MEDIA -->
                    <div class="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                        <div class="text-5xl sm:text-6xl font-black text-white tracking-tight mb-2">${avg}</div>
                        <div class="flex items-center justify-center md:justify-start gap-1 mb-2">
                            ${renderStarsSvg(Math.round(parseFloat(avg)), 5, 'w-5 h-5')}
                        </div>
                        <p class="text-xs text-slate-400">Basado en <strong>${total} valoraciones reales</strong> de usuarios y profesionales</p>
                    </div>

                    <!-- BARRAS DE PROGRESO POR ESTRELLAS -->
                    <div class="space-y-2 text-xs">
                        ${[5, 4, 3, 2, 1].map(star => {
                            const cnt = counts[star] || 0;
                            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                            return `
                                <div class="flex items-center gap-3">
                                    <span class="w-12 font-bold text-slate-300 flex items-center gap-1">
                                        <span>${star}</span>
                                        <svg class="w-3 h-3 text-amber-400 fill-amber-400 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    </span>
                                    <div class="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                        <div class="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                                    </div>
                                    <span class="w-8 text-right text-slate-500 font-mono text-[11px]">${cnt}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- CTA VALORAR -->
                    <div class="flex flex-col items-center md:items-end justify-center">
                        <p class="text-xs text-slate-400 text-center md:text-right mb-3">¿Has probado la app en tus proyectos o clases?</p>
                        <button 
                            id="btn-open-review-form" 
                            class="btn-gradient text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-lg transition flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                            <span>Dejar Reseña o Sugerencia</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- FORMULARIO DE NUEVA RESEÑA (COLAPSABLE) -->
            <div id="review-form-box" class="hidden mb-8 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl relative">
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Escribe tu Reseña o Propuesta</h3>
                            <p class="text-[11px] text-slate-400">Tu opinión nos ayuda a pulir la aplicación y añadir funciones útiles</p>
                        </div>
                    </div>
                    <button id="btn-close-review-form" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form id="form-nueva-resena" class="space-y-4">
                    <!-- SELECTOR DE PUNTUACIÓN CON ESTRELLAS VECTORIALES -->
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">Tu Puntuación</label>
                        <div class="flex items-center gap-2" id="star-picker-container">
                            ${[1, 2, 3, 4, 5].map(s => `
                                <button type="button" class="btn-star-pick p-1 transition" data-star-value="${s}">
                                    <svg class="w-7 h-7 ${s <= selectedRatingInForm ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'} transition hover:scale-110" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                </button>
                            `).join('')}
                            <span class="text-xs font-bold text-amber-400 ml-2" id="star-picker-label">${selectedRatingInForm} de 5 Estrellas</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Perfil o Sector</label>
                            <select id="input-review-role" class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500">
                                <option value="Estudiante Universitario">Estudiante Universitario / Oposiciones</option>
                                <option value="Periodista / Medios">Periodista / Medios de Comunicación</option>
                                <option value="Creador de Contenido">Creador de Contenido / Editor de Vídeo</option>
                                <option value="Empresa / Consultoría">Empresa / Negocio / Consultoría</option>
                                <option value="Investigador">Investigación / Sanidad / Docencia</option>
                                <option value="Usuario General">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Nombre o Alias</label>
                            <input 
                                type="text" 
                                id="input-review-autor" 
                                value="${user.isLoggedIn ? escapeHtml(user.name) : ''}" 
                                placeholder="${user.isLoggedIn ? 'Tu nombre de usuario' : 'Ej: Marta R. o Anónimo'}" 
                                class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Título de tu Reseña</label>
                        <input 
                            type="text" 
                            id="input-review-titulo" 
                            placeholder="Resume tu experiencia en pocas palabras" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Opinión o Sugerencia Detallada</label>
                        <textarea 
                            id="input-review-contenido" 
                            rows="4" 
                            placeholder="¿Qué es lo que más te gusta? ¿Qué función crees que le falta a EchoScribe para ser perfecta?" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                            required
                        ></textarea>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="input-review-anonimo" class="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0">
                            <label for="input-review-anonimo" class="text-xs text-slate-400 cursor-pointer">
                                Publicar reseña en modo anónimo
                            </label>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" id="btn-cancel-review-form" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                <span>Enviar Valoración</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- FILTRO POR PUNTUACIÓN -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                <span class="text-xs text-slate-500 font-semibold shrink-0 mr-1">Filtrar:</span>
                ${['todas', '5', '4', '3'].map(f => {
                    const isActive = currentRatingFilter === f;
                    const label = f === 'todas' ? 'Todas las Reseñas' : `${f} Estrellas`;
                    return `
                        <button 
                            class="filter-rating-btn px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                                isActive 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                            }" 
                            data-filter="${f}"
                        >
                            ${label}
                        </button>
                    `;
                }).join('')}
            </div>

            <!-- GRID DE TARJETAS DE RESEÑAS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5" id="reviews-grid-container">
                ${filteredReviews.map(rev => {
                    const hasVotedHelpful = !!(votes.reviews[rev.id]);
                    return `
                        <div class="glass-card card-interactive rounded-3xl p-6 border border-slate-800 flex flex-col justify-between transition">
                            <div>
                                <div class="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <div class="flex items-center gap-1.5 mb-1">
                                            <span class="text-xs font-bold text-white">${escapeHtml(rev.author)}</span>
                                            ${rev.isVerified ? `
                                                <span title="Comprador / Usuario Verificado" class="text-amber-400">
                                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                </span>
                                            ` : ''}
                                        </div>
                                        <span class="text-[10px] text-slate-400">${escapeHtml(rev.role || 'Usuario')}</span>
                                    </div>

                                    <div class="text-right">
                                        <div class="flex items-center justify-end">${renderStarsSvg(rev.rating, 5, 'w-3.5 h-3.5')}</div>
                                        <span class="text-[10px] text-slate-500">${escapeHtml(rev.date)}</span>
                                    </div>
                                </div>

                                <h4 class="text-sm font-bold text-white mb-2 leading-snug">${escapeHtml(rev.title)}</h4>
                                <p class="text-xs text-slate-300 leading-relaxed mb-4">${escapeHtml(rev.content)}</p>
                            </div>

                            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                <span class="text-[11px] text-slate-500">¿Te ha parecido útil?</span>
                                <button 
                                    class="btn-helpful-review px-3 py-1 rounded-xl border flex items-center gap-1.5 transition text-[11px] font-medium ${
                                        hasVotedHelpful
                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                            : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-400 hover:text-white'
                                    }" 
                                    data-review-id="${rev.id}"
                                >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2m-7 0H4a2 2 0 00-2 2v7a2 2 0 002 2h3"/></svg>
                                    <span>Útil (${rev.helpfulCount || 0})</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Toggle formulario de reseña
        const btnOpenRev = document.getElementById('btn-open-review-form');
        const boxRev = document.getElementById('review-form-box');
        const btnCloseRev = document.getElementById('btn-close-review-form');
        const btnCancelRev = document.getElementById('btn-cancel-review-form');

        if (btnOpenRev && boxRev) {
            btnOpenRev.onclick = () => {
                boxRev.classList.remove('hidden');
                document.getElementById('input-review-titulo')?.focus();
            };
        }
        if (btnCloseRev && boxRev) {
            btnCloseRev.onclick = () => boxRev.classList.add('hidden');
        }
        if (btnCancelRev && boxRev) {
            btnCancelRev.onclick = () => boxRev.classList.add('hidden');
        }

        // Star picker buttons
        document.querySelectorAll('.btn-star-pick').forEach(btn => {
            btn.onclick = () => {
                const val = parseInt(btn.getAttribute('data-star-value'), 10);
                selectedRatingInForm = val;
                const label = document.getElementById('star-picker-label');
                if (label) label.textContent = `${val} de 5 Estrellas`;

                document.querySelectorAll('.btn-star-pick').forEach(b => {
                    const v = parseInt(b.getAttribute('data-star-value'), 10);
                    const svg = b.querySelector('svg');
                    if (svg) {
                        if (v <= val) {
                            svg.className.baseVal = 'w-7 h-7 fill-amber-400 text-amber-400 transition hover:scale-110';
                        } else {
                            svg.className.baseVal = 'w-7 h-7 fill-slate-700 text-slate-600 transition hover:scale-110';
                        }
                    }
                });
            };
        });

        // Filtro de puntuación
        document.querySelectorAll('.filter-rating-btn').forEach(btn => {
            btn.onclick = () => {
                currentRatingFilter = btn.getAttribute('data-filter');
                renderReviewsSection();
            };
        });

        // Enviar nueva reseña
        const formRev = document.getElementById('form-nueva-resena');
        if (formRev) {
            formRev.onsubmit = (e) => {
                e.preventDefault();
                const role = document.getElementById('input-review-role').value;
                const autor = document.getElementById('input-review-autor').value.trim();
                const titulo = document.getElementById('input-review-titulo').value.trim();
                const contenido = document.getElementById('input-review-contenido').value.trim();
                const isAnon = document.getElementById('input-review-anonimo').checked;

                if (!titulo || !contenido || !autor) return;

                const newRev = {
                    id: 'rev-' + Date.now(),
                    author: isAnon ? 'Usuario Anónimo' : autor,
                    role: role,
                    isVerified: !isAnon && user.isLoggedIn,
                    rating: selectedRatingInForm,
                    title: titulo,
                    content: contenido,
                    date: 'Hoy',
                    helpfulCount: 1
                };

                const allRevs = getStoredReviews();
                allRevs.unshift(newRev);
                saveStoredReviews(allRevs);

                renderReviewsSection();
            };
        }

        // Votos útiles en reseñas
        document.querySelectorAll('.btn-helpful-review').forEach(btn => {
            btn.onclick = () => {
                const revId = btn.getAttribute('data-review-id');
                const revs = getStoredReviews();
                const vts = getUserVotes();
                const target = revs.find(r => r.id === revId);
                if (!target) return;

                if (vts.reviews[revId]) {
                    target.helpfulCount = Math.max(0, (target.helpfulCount || 1) - 1);
                    delete vts.reviews[revId];
                } else {
                    target.helpfulCount = (target.helpfulCount || 0) + 1;
                    vts.reviews[revId] = true;
                }

                saveStoredReviews(revs);
                saveUserVotes(vts);
                renderReviewsSection();
            };
        });
    }

    // Renderizar comentarios específicos de una guía
    async function initGuideComments() {
        const container = document.getElementById('comunidad-guia-comments');
        if (!container) return;

        const slug = container.getAttribute('data-guia-slug') || window.location.pathname.split('/').pop().replace('.html', '');
        const user = await getCurrentUser();

        function getGuideComments() {
            try {
                const data = localStorage.getItem(STORAGE_KEY_GUIDE_COMMENTS);
                if (data) return JSON.parse(data);
            } catch(e){}
            // Default seed comments for guides
            const initial = {
                'alternativa-otter-ai-espanol': [
                    {
                        id: 'gc-1',
                        author: 'Javier M.',
                        isVerified: true,
                        content: 'Gran comparativa. Lo que más me molestaba de Otter era que el bot entraba a reuniones de clientes y causaba desconfianza. Grabar el audio y pasarlo directamente es mucho más profesional.',
                        date: 'Hace 1 día',
                        upvotes: 8
                    },
                    {
                        id: 'gc-2',
                        author: 'Marta Redacción',
                        isVerified: false,
                        content: '¿Admite también archivos en formato .ogg o .opus de notas de voz de WhatsApp o Telegram?',
                        date: 'Hace 6 horas',
                        upvotes: 3
                    }
                ],
                'alternativa-descript-transcripcion': [
                    {
                        id: 'gc-3',
                        author: 'Carlos Vídeo',
                        isVerified: true,
                        content: 'Descript me consumía 12GB de RAM en un proyecto de 40 minutos. La ligereza de la app de escritorio de EchoScribe se agradece un montón en Premiere.',
                        date: 'Hace 2 días',
                        upvotes: 11
                    }
                ],
                'transcribir-clases-apuntes-gemini-ia': [
                    {
                        id: 'gc-4',
                        author: 'Sara Opositora',
                        isVerified: true,
                        content: 'El formato de apuntes con esquemas de leyes me está salvando la oposición. Muy recomendado pasar el texto por Gemini con el prompt de la guía.',
                        date: 'Hace 3 días',
                        upvotes: 14
                    }
                ]
            };
            localStorage.setItem(STORAGE_KEY_GUIDE_COMMENTS, JSON.stringify(initial));
            return initial;
        }

        function saveGuideComments(all) {
            try {
                localStorage.setItem(STORAGE_KEY_GUIDE_COMMENTS, JSON.stringify(all));
            } catch(e){}
        }

        const allComments = getGuideComments();
        const comments = allComments[slug] || [];

        container.innerHTML = `
            <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Comentarios y Preguntas de esta Guía</h3>
                            <p class="text-[11px] text-slate-400">Participa en la conversación de forma anónima o con tu cuenta</p>
                        </div>
                    </div>
                    <a href="/guias#comunidad" class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                        <span>Ver Foro General</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </a>
                </div>

                <!-- FORMULARIO COMENTARIO EN GUÍA -->
                <form id="form-guia-comment" class="space-y-3 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            id="input-gc-autor" 
                            value="${user.isLoggedIn ? escapeHtml(user.name) : ''}" 
                            placeholder="${user.isLoggedIn ? 'Tu nombre de usuario' : 'Tu alias (ej: María o Anónimo)'}" 
                            class="bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500" 
                            required 
                        />
                        <div class="flex items-center gap-2 px-1">
                            <input type="checkbox" id="input-gc-anonimo" class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
                            <label for="input-gc-anonimo" class="text-xs text-slate-400 cursor-pointer">
                                Publicar como anónimo
                            </label>
                        </div>
                    </div>
                    <textarea 
                        id="input-gc-contenido" 
                        rows="2" 
                        placeholder="Escribe tu consulta o aportación sobre esta guía..." 
                        class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed" 
                        required
                    ></textarea>
                    <div class="flex justify-end">
                        <button type="submit" class="btn-gradient text-white text-xs font-bold py-2 px-5 rounded-xl transition flex items-center gap-1.5 shadow-md">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                            <span>Comentar</span>
                        </button>
                    </div>
                </form>

                <!-- LISTA DE COMENTARIOS -->
                <div class="space-y-3" id="guia-comments-list">
                    ${comments.length === 0 ? `
                        <p class="text-xs text-slate-500 italic py-3 text-center">Aún no hay comentarios en esta guía. ¡Sé el primero en opinar!</p>
                    ` : comments.map(c => `
                        <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4">
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                        ${escapeHtml(getInitials(c.author))}
                                    </div>
                                    <span class="text-xs font-bold text-white">${escapeHtml(c.author)}</span>
                                    ${c.isVerified ? `
                                        <span title="Verificado" class="text-indigo-400">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        </span>
                                    ` : ''}
                                    <span class="text-[10px] text-slate-500">·</span>
                                    <span class="text-[10px] text-slate-400">${escapeHtml(c.date)}</span>
                                </div>
                            </div>
                            <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(c.content)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const form = document.getElementById('form-guia-comment');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const autorInput = document.getElementById('input-gc-autor');
                const contenidoInput = document.getElementById('input-gc-contenido');
                const isAnon = document.getElementById('input-gc-anonimo')?.checked;

                const autor = autorInput.value.trim();
                const contenido = contenidoInput.value.trim();
                if (!autor || !contenido) return;

                const newC = {
                    id: 'gc-' + Date.now(),
                    author: isAnon ? 'Usuario Anónimo' : autor,
                    isVerified: !isAnon && user.isLoggedIn,
                    content: contenido,
                    date: 'Ahora mismo',
                    upvotes: 1
                };

                const currentAll = getGuideComments();
                if (!currentAll[slug]) currentAll[slug] = [];
                currentAll[slug].unshift(newC);
                saveGuideComments(currentAll);

                initGuideComments();
            };
        }
    }

    // Escape de HTML para evitar XSS
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Toggle de respuestas de un hilo
    function toggleReplies(threadId) {
        const box = document.getElementById(`replies-box-${threadId}`);
        if (box) {
            box.classList.toggle('hidden');
        }
    }

    // Control del Tab Switcher general
    function switchTab(tabName) {
        const tabGuias = document.getElementById('tab-btn-guias');
        const tabForo = document.getElementById('tab-btn-foro');
        const tabResenas = document.getElementById('tab-btn-resenas');

        const viewGuias = document.getElementById('comunidad-guias-view');
        const viewForo = document.getElementById('comunidad-foro-view');
        const viewResenas = document.getElementById('comunidad-resenas-view');

        const heroSub = document.getElementById('comunidad-hero-subtitle');

        // Reset
        [tabGuias, tabForo, tabResenas].forEach(btn => {
            if (!btn) return;
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
            btn.classList.add('text-slate-400', 'hover:text-white');
        });

        [viewGuias, viewForo, viewResenas].forEach(v => {
            if (!v) return;
            v.classList.add('hidden');
        });

        if (tabName === 'foro' || tabName === 'comunidad') {
            if (tabForo) {
                tabForo.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
                tabForo.classList.remove('text-slate-400');
            }
            if (viewForo) viewForo.classList.remove('hidden');
            if (heroSub) heroSub.textContent = 'Espacio de intercambio para resolver dudas técnicas, compartir prompts y debatir sobre transcripción con IA.';
            renderForumSection();
            window.history.replaceState(null, '', '#comunidad');
        } else if (tabName === 'resenas' || tabName === 'opiniones') {
            if (tabResenas) {
                tabResenas.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
                tabResenas.classList.remove('text-slate-400');
            }
            if (viewResenas) viewResenas.classList.remove('hidden');
            if (heroSub) heroSub.textContent = 'Valora tu experiencia con EchoScribe, consulta opiniones contrastadas o propón nuevas características para el software.';
            renderReviewsSection();
            window.history.replaceState(null, '', '#resenas');
        } else {
            // Default: guias
            if (tabGuias) {
                tabGuias.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
                tabGuias.classList.remove('text-slate-400');
            }
            if (viewGuias) viewGuias.classList.remove('hidden');
            if (heroSub) heroSub.textContent = 'Descubre cómo EchoScribe resuelve problemas reales de transcripción periodística, subtitulado automático y redacción con IA.';
            window.history.replaceState(null, '', '#guias');
        }
    }

    // Inicialización al cargar la página
    function init() {
        // Enlazar botones de pestañas si estamos en guias.html
        const tabGuias = document.getElementById('tab-btn-guias');
        const tabForo = document.getElementById('tab-btn-foro');
        const tabResenas = document.getElementById('tab-btn-resenas');

        if (tabGuias) tabGuias.onclick = () => switchTab('guias');
        if (tabForo) tabForo.onclick = () => switchTab('foro');
        if (tabResenas) tabResenas.onclick = () => switchTab('resenas');

        // Leer hash de la URL para activar la pestaña correspondiente
        const hash = (window.location.hash || '').replace('#', '').toLowerCase();
        if (hash.includes('comunidad') || hash.includes('foro')) {
            switchTab('foro');
        } else if (hash.includes('resenas') || hash.includes('opiniones') || hash.includes('mejoras')) {
            switchTab('resenas');
        } else {
            // Cargar inicialización silenciosa de los componentes
            const viewForo = document.getElementById('comunidad-foro-view');
            const viewResenas = document.getElementById('comunidad-resenas-view');
            if (viewForo) renderForumSection();
            if (viewResenas) renderReviewsSection();
        }

        window.addEventListener('hashchange', () => {
            const h = (window.location.hash || '').replace('#', '').toLowerCase();
            if (h.includes('comunidad') || h.includes('foro')) switchTab('foro');
            else if (h.includes('resenas') || h.includes('opiniones')) switchTab('resenas');
            else if (h.includes('guias')) switchTab('guias');
        });

        // Inicializar comentarios específicos de guía si está el contenedor
        initGuideComments();
    }

    // Autoarranque
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API pública para llamadas externas
    window.EchoScribeComunidad = {
        switchTab: switchTab,
        toggleReplies: toggleReplies,
        renderForum: renderForumSection,
        renderReviews: renderReviewsSection,
        initGuideComments: initGuideComments
    };

})();
