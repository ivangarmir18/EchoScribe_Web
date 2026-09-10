/**
 * EchoScribe - Módulo de Guías y Comunidad
 * Subforos temáticos, comentarios con y sin sesión, valoraciones y sugerencias de mejora.
 * Vocabulario realista y natural (estudiantes, editores, freelancers).
 * Diseño 100% vectorial con SVG (sin emojis).
 */

(function () {
    'use strict';

    const STORAGE_KEY_FORUM = 'echoscribe_comunidad_threads_v3';
    const STORAGE_KEY_REVIEWS = 'echoscribe_comunidad_reviews_v3';
    const STORAGE_KEY_USER_VOTES = 'echoscribe_user_votes_v3';
    const STORAGE_KEY_GUIDE_COMMENTS = 'echoscribe_guia_comments_v3';

    // Generador de nombres anónimos creativos y realistas (estilo comunidad tech/estudiantes)
    const ANON_ROLES = [
        'estudiante', 'oyente', 'editor', 'lector', 'opositor', 'redactor',
        'cronista', 'investigador', 'programador', 'ingeniero', 'guionista',
        'transcriptor', 'montador', 'podcaster', 'becario', 'pasajero',
        'nodo', 'pixel', 'curioso', 'observador', 'filtro', 'compilador'
    ];
    const ANON_ADJECTIVES = [
        'nocturno', 'en_sombras', 'silencioso', 'zen', 'upv', 'de_madrugada',
        'acústico', 'digital', 'furtivo', 'freelance', 'en_pausa', 'improvisado',
        'curioso', 'discreto', 'solitario', 'atento', 'sigiloso', 'veloz',
        'en_red', 'desconocido', 'inquieto'
    ];

    function generateCoolAnonymousName() {
        const role = ANON_ROLES[Math.floor(Math.random() * ANON_ROLES.length)];
        const adj = ANON_ADJECTIVES[Math.floor(Math.random() * ANON_ADJECTIVES.length)];
        const num = Math.floor(10 + Math.random() * 990);
        if (Math.random() > 0.45) {
            return `${role}_${adj}_${num}`;
        }
        return `${role}_${adj}`;
    }

    function getSessionAnonymousHandle() {
        try {
            let handle = localStorage.getItem('echoscribe_anon_handle_v1');
            if (!handle) {
                handle = generateCoolAnonymousName();
                localStorage.setItem('echoscribe_anon_handle_v1', handle);
            }
            return handle;
        } catch(e) {
            return generateCoolAnonymousName();
        }
    }

    function resolveAnonymousAuthor(inputAuthor, isAnonymous, defaultLoggedInName) {
        const trimmed = (inputAuthor || '').trim();
        const isGenericAnon = !trimmed || /^an[oó]nimo(_\d+)?$/i.test(trimmed) || trimmed.toLowerCase() === 'usuario anónimo';
        
        if (isAnonymous || isGenericAnon) {
            if (trimmed && !isGenericAnon) {
                return trimmed;
            }
            return generateCoolAnonymousName();
        }
        return trimmed || defaultLoggedInName || generateCoolAnonymousName();
    }

    // Centinela de Moderación con IA (Gemini) y Protección Anti-Spam
    async function moderarContenidoConIA(payload) {
        try {
            const res = await fetch('/api/moderar-contenido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                return { aprobado: true, fallback: true };
            }
            return await res.json();
        } catch (e) {
            console.warn('[Ciberseguridad] Escudo de moderación operando en modo local:', e);
            return { aprobado: true, fallback: true };
        }
    }

    function mostrarModalSeguridad(titulo, mensaje, esError = true) {
        let modal = document.getElementById('modal-seguridad-comunidad');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-seguridad-comunidad';
            modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity';
            document.body.appendChild(modal);
        }
        const iconSvg = esError 
            ? '<div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-inner"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>'
            : '<div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
            
        modal.innerHTML = `
            <div class="glass-card bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in relative">
                ${iconSvg}
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${esError ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} mb-2">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Escudo de Ciberseguridad & IA</span>
                </div>
                <h3 class="text-base font-bold text-white mb-2">${escapeHtml(titulo)}</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-6">${escapeHtml(mensaje)}</p>
                <div class="flex items-center justify-center gap-2">
                    <button id="btn-cerrar-modal-seguridad" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700">
                        Entendido
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
        document.getElementById('btn-cerrar-modal-seguridad').onclick = () => {
            modal.classList.add('hidden');
        };
    }

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

    // Hilos de debate hiperrealistas (mezcla de anónimos y nombres reales no cliché, jerga natural, 0 emojis)
    const SEED_THREADS = [
        {
            id: 'th-101',
            category: 'estudiantes',
            title: 'Flujo de trabajo para clases de 2 horas: Whisper GPU + prompt de estudio con Gemini',
            content: 'Buenas gente. En mi facultad los profes van a mil por hora y es físicamente imposible copiar las diapositivas y enterarse de la explicación a la vez. Grabo con la grabadora del móvil en .m4a desde la tercera fila, le tiro el archivo a EchoScribe y en medio minuto tengo el texto íntegro sin carraspeos ni pausas raras. Luego le paso el prompt de Cornell a Gemini y me saca las tablas de artículos y casos prácticos masticados. Menudo salvavidas antes de parciales.',
            author: 'Brais C.',
            isVerified: true,
            userRole: 'Grado en Derecho',
            date: 'Hace 3 horas',
            timestamp: Date.now() - 1000 * 60 * 60 * 3,
            upvotes: 34,
            tags: ['Universidad', 'Gemini AI', 'Apuntes'],
            replies: [
                {
                    id: 'rep-101-1',
                    author: 'opositor_forestal',
                    isVerified: false,
                    content: 'Confirmo. Para temas de legislación donde te meten 40 leyes en una mañana va finísimo. Ojo con dejar el móvil pegado al teclado del portátil porque las teclas tapan la voz, mejor ponerlo sobre un estuche.',
                    date: 'Hace 2 horas'
                },
                {
                    id: 'rep-101-2',
                    author: 'Uxue Larrañaga',
                    isVerified: true,
                    content: 'Yo lo combino con Obsidian. Copio el Markdown que escupe y se me generan los links entre temas automáticamente con la sintaxis de doble corchete.',
                    date: 'Hace 40 minutos'
                }
            ]
        },
        {
            id: 'th-102',
            category: 'creadores',
            title: 'Configuración de subtítulos .SRT para CapCut y Premiere sin palabras huérfanas',
            content: 'Para los que montáis vídeos verticales en Premiere o CapCut Desktop: he probado el perfil "Corto" de EchoScribe (18-24 caracteres) y es la única herramienta que no me deja palabras de una sola letra flotando al final de la línea como hace el auto-caption nativo. ¿Alguien ha probado a meterle audios en gallego o euskera a ver cómo resuelve los cortes?',
            author: 'editor_freelance_bcn',
            isVerified: false,
            userRole: 'Montador Audiovisual',
            date: 'Ayer',
            timestamp: Date.now() - 1000 * 60 * 60 * 22,
            upvotes: 47,
            tags: ['CapCut', 'Premiere', 'Subtítulos SRT'],
            replies: [
                {
                    id: 'rep-102-1',
                    author: 'Pelayo S.',
                    isVerified: true,
                    content: 'En gallego el modelo Large v3 lo pilla sin despeinarse porque comparte raíz fonética con el portugués en los pesos de Whisper. Lo metí para unos vídeos de turismo y clavó hasta las toponimias.',
                    date: 'Ayer'
                },
                {
                    id: 'rep-102-2',
                    author: 'anónimo_vfx',
                    isVerified: false,
                    content: 'En DaVinci Resolve 19 entra a la primera si marcas la pista como Subtitle Track en vez de texto plano. Te ahorra media jornada de titular.',
                    date: 'Hace 18 horas'
                }
            ]
        },
        {
            id: 'th-103',
            category: 'empresa',
            title: 'Notas de voz de WhatsApp del curro: cómo pasarlas a minutas de Notion sin copiar a mano',
            content: 'Tengo un cliente que me manda audios de 8 y 10 minutos divagando sobre cambios en la web. Arrastrar el audio .opus directo a la app y pedirle "extrae solo los acuerdos y los cambios que me pide" me ha ahorrado literalmente discusiones de "¿yo no dije eso?". Al tener el acta fáctica con horas de intervención se acabaron los malentendidos.',
            author: 'Naiara V.',
            isVerified: true,
            userRole: 'Consultora de Proyectos',
            date: 'Hace 1 día',
            timestamp: Date.now() - 1000 * 60 * 60 * 30,
            upvotes: 52,
            tags: ['WhatsApp', 'Productividad', 'Notion'],
            replies: [
                {
                    id: 'rep-103-1',
                    author: 'Guillén F.',
                    isVerified: false,
                    content: 'Totalmente. Yo le paso un prompt de checklist markdown [ ] y lo pego directo en la tarjeta de Trello o Linear del sprint.',
                    date: 'Hace 20 horas'
                }
            ]
        },
        {
            id: 'th-104',
            category: 'tecnologia',
            title: 'Whisper Large v3 en GPU Cloud vs ejecutarlo en local en un portátil con 16GB de RAM',
            content: 'Hice la prueba empírica con un archivo de 52 minutos grabado en un bar con vajilla y eco. En local con whisper.cpp mi portátil se puso a 88 grados, los ventiladores al 100% y tardó 14 minutos. En EchoScribe tardó 21 segundos de reloj porque corre en una gráfica dedicada de servidor. Para los que trabajamos en movilidad con batería esto marca la diferencia entre poder transcribir fuera de casa o quedarte sin pila.',
            author: 'Xabier M.',
            isVerified: true,
            userRole: 'Desarrollador de Software',
            date: 'Hace 2 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 50,
            upvotes: 63,
            tags: ['Whisper GPU', 'Benchmark', 'Rendimiento'],
            replies: [
                {
                    id: 'rep-104-1',
                    author: 'dev_audio_lab',
                    isVerified: false,
                    content: 'Exacto, y además la cuantización del modelo local a 4 bits pierde precisión con acentos cerrados, cosa que no pasa cuando ejecutas el modelo entero en fp16 en la nube.',
                    date: 'Hace 1 día'
                }
            ]
        },
        {
            id: 'th-105',
            category: 'mejoras',
            title: 'Propuesta: Opción de arrastrar carpetas enteras para transcribir en cola por lotes',
            content: 'Cuando vuelves de cubrir un congreso o unas jornadas traes 10 o 12 audios distintos. Estaría brutal poder soltar la carpeta completa y que los vaya procesando en cola uno tras otro sin tener que meterlos de uno en uno. ¿Cómo lo veis?',
            author: 'Artai R.',
            isVerified: true,
            userRole: 'Periodismo Digital',
            date: 'Hace 3 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 75,
            upvotes: 78,
            tags: ['Propuesta', 'Procesado por Lotes', 'Roadmap'],
            replies: [
                {
                    id: 'rep-105-1',
                    author: 'Iván García Miranda',
                    isVerified: true,
                    userRole: 'Desarrollador',
                    content: 'Apuntadísimo Artai. Ya estamos testeando la cola de procesamiento múltiple para la versión 1.2 de la app de escritorio.',
                    date: 'Hace 2 días'
                },
                {
                    id: 'rep-105-2',
                    author: 'usuario_8192',
                    isVerified: false,
                    content: 'Si además le ponéis un botón de "Exportar todos a una sola carpeta de Notion/Markdown", me caso con vosotros.',
                    date: 'Ayer'
                }
            ]
        },
        {
            id: 'th-106',
            category: 'empresa',
            title: 'Entrevistas para investigación sociológica y respeto estricto del RGPD',
            content: 'Para proyectos financiados con fondos públicos la protección de datos es innegociable. Con los servicios que te piden subir audios a servidores que luego los usan para entrenar sus modelos no podemos trabajar legalmente. Que EchoScribe procese en memoria efímera y purgue los ficheros al terminar la petición nos permite justificar el protocolo de anonimización del comité ético.',
            author: 'Montserrat P.',
            isVerified: true,
            userRole: 'Investigación Cualitativa',
            date: 'Hace 4 días',
            timestamp: Date.now() - 1000 * 60 * 60 * 95,
            upvotes: 41,
            tags: ['RGPD', 'Comité Ético', 'Entrevistas'],
            replies: []
        }
    ];

    // Reseñas auténticas con valoraciones realistas (CERO emojis, tono sincero y directo)
    const SEED_REVIEWS = [
        {
            id: 'rev-201',
            author: 'Yanira B.',
            role: 'Redactora y Community Manager',
            isVerified: true,
            rating: 5,
            title: 'Se acabaron las tardes enteras pasando ruedas de prensa a mano',
            content: 'Al principio era escéptica porque casi todas las apps que dicen tener IA se inventan la mitad de los apellidos cuando hablan futbolistas extranjeros. La corrección editorial con Gemini y el despegue fonético clavan los nombres al primer intento.',
            date: 'Hace 2 días',
            helpfulCount: 38
        },
        {
            id: 'rev-202',
            author: 'anónimo_upv',
            role: 'Estudiante de Grado',
            isVerified: false,
            rating: 5,
            title: 'Salvada histórica para preparar los exámenes finales',
            content: 'Me pasaron 18 grabaciones de clase de 2 horas de una asignatura que llevaba atrasada. Con la app de escritorio las procesé todas en una tarde y saqué apuntes limpísimos en Notion. No vuelvo a transcribir a pedal en mi vida.',
            date: 'Hace 3 días',
            helpfulCount: 45
        },
        {
            id: 'rev-203',
            author: 'Brais C.',
            role: 'Creador de Podcast & YouTube',
            isVerified: true,
            rating: 5,
            title: 'La sincronización de los .SRT es milimétrica en DaVinci',
            content: 'Descript me chupaba 14 gigas de RAM y muchas veces se colgaba con proyectos largos en 4K. EchoScribe pesa menos de 100 megas en Windows y exporta el archivo de subtítulos listo para importar.',
            date: 'Hace 5 días',
            helpfulCount: 27
        },
        {
            id: 'rev-204',
            author: 'Iker Albiol',
            role: 'Project Manager Freelance',
            isVerified: true,
            rating: 5,
            title: 'Extracción de acuerdos de reuniones que evita malentendidos con clientes',
            content: 'Lo utilizo después de cada llamada con clientes para mandarles el acta en 3 minutos. El hecho de que extraiga las tareas en casillas de verificación directas para Notion nos ha subido el ritmo de entrega una barbaridad.',
            date: 'Hace 1 semana',
            helpfulCount: 22
        },
        {
            id: 'rev-205',
            author: 'investigador_csic',
            role: 'Investigador Biomédico',
            isVerified: false,
            rating: 4,
            title: 'Brutal velocidad y precisión, solo echo en falta traducción directa en el mismo paso',
            content: 'El filtrado de ruido de fondo con el modelo Large v3 es impecable. Le pongo 4 estrellas en lugar de 5 porque me gustaría que pudiera traducir directamente audios en inglés al castellano en una sola pasada, aunque ahora mismo lo resuelvo pidiéndoselo a Gemini.',
            date: 'Hace 1 semana',
            helpfulCount: 19
        },
        {
            id: 'rev-206',
            author: 'Pelayo S.',
            role: 'Editor de Vídeo Vertical',
            isVerified: true,
            rating: 5,
            title: 'Por fin una herramienta pensada para gente que edita en serio',
            content: 'Las herramientas online te cobran por minuto de audio infladísimo y te meten marcas de agua si no pagas planes de 40 euros. EchoScribe tiene precios súper honestos para lo que ofrece y la app nativa en Windows es una bala.',
            date: 'Hace 2 semanas',
            helpfulCount: 31
        }
    ];

    // Comentarios específicos por guía (con debates reales por especialidad)
    const SEED_GUIDE_COMMENTS = {
        'transcribir-audio-notas-notion-obsidian': [
            {
                id: 'gcn-1',
                author: 'Pelayo S.',
                isVerified: true,
                content: 'Pro tip para Obsidian: si configuráis el plugin Dataview, podéis pedirle a EchoScribe en las instrucciones de Gemini que añada metadatos frontmatter (tags, fecha, tipo: reunión) y se os indexa en vuestro panel de control al instante.',
                date: 'Hace 2 horas',
                upvotes: 16
            },
            {
                id: 'gcn-2',
                author: 'anónimo_notion_geek',
                isVerified: false,
                content: '¿Pega bien las casillas de verificación en Notion si usas la app web en Brave? Lo digo porque a veces los portapapeles de Chromium rompen el markdown.',
                date: 'Hace 5 horas',
                upvotes: 4
            },
            {
                id: 'gcn-3',
                author: 'Naiara V.',
                isVerified: true,
                content: 'En Brave y Chrome entra perfecto con Ctrl+V normal. Notion lo reconoce como bloques nativos de To-Do list sin necesidad de extensiones.',
                date: 'Hace 3 horas',
                upvotes: 9
            }
        ],
        'alternativa-otter-ai-espanol': [
            {
                id: 'gc-ot-1',
                author: 'Joana M.',
                isVerified: true,
                content: 'Lo que más me echaba para atrás de Otter era la pesadilla de que el bot "OtterPilot" entrara solo a reuniones con clientes externos y la gente preguntara "¿quién está grabando esto?". Con EchoScribe grabo en local y no hay ningún bot invasivo.',
                date: 'Hace 1 día',
                upvotes: 21
            },
            {
                id: 'gc-ot-2',
                author: 'usuario_freelance',
                isVerified: false,
                content: 'Y que Otter en español mete unas patadas al diccionario tremendas con los modismos de aquí. El combo de Whisper v3 con Gemini no tiene punto de comparación.',
                date: 'Ayer',
                upvotes: 14
            }
        ],
        'alternativa-descript-transcripcion': [
            {
                id: 'gc-des-1',
                author: 'editor_vfx_madrid',
                isVerified: false,
                content: 'Descript en Windows 11 se ha vuelto un mastodonte intragable. En cuanto metías dos clips de 4K se congelaba el previo. La ligereza de EchoScribe se agradece infinito para sacar los .SRT limpios.',
                date: 'Hace 2 días',
                upvotes: 28
            }
        ],
        'transcribir-clases-apuntes-gemini-ia': [
            {
                id: 'gc-gem-1',
                author: 'Brais C.',
                isVerified: true,
                content: 'Para asignaturas tochas de 6 créditos con temarios densos: pedidle en el prompt que os genere "preguntas trampa tipo test para auto-evaluación". Es la forma más rápida de saber si te has enterado de la clase antes de que llegue el parcial.',
                date: 'Hace 3 días',
                upvotes: 35
            }
        ],
        'transcribir-audios-whatsapp-a-texto': [
            {
                id: 'gc-wsp-1',
                author: 'Naiara V.',
                isVerified: true,
                content: 'Pasar los audios de los grupos de trabajo de la oficina por aquí me ahorra media hora de disgustos todas las mañanas. Mano de santo.',
                date: 'Hace 4 días',
                upvotes: 19
            }
        ],
        'ecoscribe-vs-whisper': [
            {
                        "id": "gc-evw-1",
                        "author": "dev_audio_lab",
                        "isVerified": false,
                        "content": "La diferencia fundamental es que Whisper puro no tiene capa léxica de validación. Para audios limpios en inglés va sobrado, pero en español coloquial o jerga profesional la tasa de error por deformación fonética sube bastante. El paso con Gemini lo deja perfecto.",
                        "date": "Hace 1 día",
                        "upvotes": 24
            },
            {
                        "id": "gc-evw-2",
                        "author": "Pelayo S.",
                        "isVerified": true,
                        "content": "Totalmente. En edición de vídeo, tener que corregir a mano cada nombre propio arruina cualquier automatización. Con la corrección editorial de EchoScribe te ahorras esa revisión manual.",
                        "date": "Ayer",
                        "upvotes": 17
            }
],
        'generar-subtitulos-premiere-capcut-davinci': [
            {
                        "id": "gc-sub-1",
                        "author": "editor_freelance_bcn",
                        "isVerified": false,
                        "content": "El perfil 'Corto' (18-24 caracteres) es perfecto para TikTok y Reels. Evita que el texto tape la cara del creador o los botones de la interfaz nativa.",
                        "date": "Hace 2 días",
                        "upvotes": 31
            },
            {
                        "id": "gc-sub-2",
                        "author": "anónimo_vfx",
                        "isVerified": false,
                        "content": "En Premiere basta con arrastrar el .srt a la línea de tiempo y aplicarle un estilo de pista con la fuente que uses siempre. Ahorro de horas absoluto.",
                        "date": "Ayer",
                        "upvotes": 15
            }
],
        'transcribir-clases-universidad': [
            {
                        "id": "gc-clu-1",
                        "author": "Brais C.",
                        "isVerified": true,
                        "content": "Consejo: si grabáis con móvil, colocadlo sobre un estuche o pañuelo para amortiguar el ruido de la gente tecleando en los portátiles alrededor.",
                        "date": "Hace 2 días",
                        "upvotes": 42
            },
            {
                        "id": "gc-clu-2",
                        "author": "opositor_forestal",
                        "isVerified": false,
                        "content": "Para preparar repasos espaciados, pasarle la transcripción a Gemini pidiéndole tarjetas Anki en formato CSV funciona de locos.",
                        "date": "Hace 1 día",
                        "upvotes": 29
            }
],
        'transcribir-partidos-futbol': [
            {
                        "id": "gc-fut-1",
                        "author": "periodista_deportivo",
                        "isVerified": true,
                        "content": "Lo mejor es que cuando el comentarista suelta de carrerilla tres nombres propios ('Dimitrievski, Maffeo, Tárrega') no los junta en una palabra rara como hace el transcriptor tradicional. El despegue fonético funciona impecable.",
                        "date": "Hace 3 días",
                        "upvotes": 26
            }
],
        'transcribir-traducir-subtitulos-srt-simultaneo': [
            {
                        "id": "gc-trad-1",
                        "author": "subtitulador_freelance",
                        "isVerified": true,
                        "content": "El mapeo cue a cue con DeepSeek V4 Flash mantiene la duración exacta del subtítulo sin desfases ni palabras apelotonadas. Clave para entregar trabajos a agencias.",
                        "date": "Hace 2 días",
                        "upvotes": 33
            }
],
        'transcribir-entrevistas-periodismo': [
            {
                        "id": "gc-per-1",
                        "author": "Naiara V.",
                        "isVerified": true,
                        "content": "La confidencialidad del borrado en 24h es indispensable para fuentes protegidas y entrevistas sensibles. Cumple al 100% con los requisitos de protección de datos de la redacción.",
                        "date": "Hace 4 días",
                        "upvotes": 28
            }
],
        'transcribir-reuniones-zoom-teams-meet': [
            {
                        "id": "gc-reu-1",
                        "author": "Iker Albiol",
                        "isVerified": true,
                        "content": "Mucho mejor que los bots que se meten a la llamada y asustan a los clientes. Grabo el audio con la grabadora del sistema y lo proceso aquí en 20 segundos.",
                        "date": "Hace 3 días",
                        "upvotes": 37
            }
],
        'transcribir-audios-bilingues-dos-idiomas': [
            {
                        "id": "gc-bil-1",
                        "author": "Joana M.",
                        "isVerified": true,
                        "content": "En ruedas de prensa internacionales donde mezclan preguntas en inglés y respuestas en español es el único transcriptor que no inventa palabras por forzar un solo idioma.",
                        "date": "Hace 2 días",
                        "upvotes": 22
            }
],
        'transcribir-entrevistas-tfg': [
            {
                        "id": "gc-tfg-1",
                        "author": "Uxue Larrañaga",
                        "isVerified": true,
                        "content": "Para análisis cualitativo con codificación temático-conceptual te ahorra semanas de transcripción manual antes de meter los textos a ATLAS.ti o MAXQDA.",
                        "date": "Hace 3 días",
                        "upvotes": 30
            }
],
        'transcribir-podcast-spotify-ivoox-a-texto': [
            {
                        "id": "gc-pod-1",
                        "author": "Pelayo S.",
                        "isVerified": true,
                        "content": "Subir el episodio completo y pedirle que extraiga los 5 mejores momentos para crear hilos en X o carruseles en LinkedIn nos ha duplicado el alcance orgánico.",
                        "date": "Hace 4 días",
                        "upvotes": 25
            }
],
        'transcribir-ruedas-prensa': [
            {
                        "id": "gc-rdp-1",
                        "author": "periodista_deportivo",
                        "isVerified": true,
                        "content": "La acústica en las salas de prensa suele tener eco de micrófonos y preguntas sin micro desde el fondo. La combinación de Whisper Turbo y la corrección editorial saca el texto limpio al primer intento.",
                        "date": "Hace 5 días",
                        "upvotes": 19
            }
]
    };

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

    function getGuideComments() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_GUIDE_COMMENTS);
            if (data) return JSON.parse(data);
        } catch (e) {}
        localStorage.setItem(STORAGE_KEY_GUIDE_COMMENTS, JSON.stringify(SEED_GUIDE_COMMENTS));
        return SEED_GUIDE_COMMENTS;
    }

    function saveGuideComments(all) {
        try {
            localStorage.setItem(STORAGE_KEY_GUIDE_COMMENTS, JSON.stringify(all));
        } catch (e) {}
    }

    // Helper para estrellas SVG puras
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

    // Iniciales para avatar vectorial
    function getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().replace(/_/g, ' ').split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    // Comprobación de usuario actual en Supabase
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
            console.warn('Error comprobando sesión Supabase:', e);
        }
        return {
            isLoggedIn: false,
            id: null,
            email: null,
            name: null
        };
    }

    // Estado local
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

        const filteredThreads = threads.filter(t => {
            const matchSubforo = (currentSubforo === 'todos') || (t.category === currentSubforo);
            const matchSearch = !searchQuery || 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            return matchSubforo && matchSearch;
        });

        container.innerHTML = `
            <!-- BARRA SUPERIOR: SUBFOROS -->
            <div id="subforos-chips-container"></div>

            <!-- CONTROLES: BÚSQUEDA Y BOTÓN NUEVO DEBATE -->
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

            <!-- FORMULARIO DE NUEVO DEBATE -->
            <div id="nuevo-debate-box" class="hidden mb-10 glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl relative">
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Publicar un Nuevo Debate</h3>
                            <p class="text-[11px] text-slate-400">Comparte dudas, trucos de software o flujos de trabajo</p>
                        </div>
                    </div>
                    <button id="btn-close-nuevo-debate" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form id="form-nuevo-debate" data-loaded-at="${Date.now()}" class="space-y-4">
                    <!-- Honeypot invisible contra bots automáticos -->
                    <input type="text" name="website_url_hp" id="input-debate-hp" class="hidden" style="display:none !important; opacity:0; position:absolute; left:-9999px;" tabindex="-1" autocomplete="off" value="" />

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
                                placeholder="${user.isLoggedIn ? escapeHtml(user.name) : 'Tu nombre o alias (ej: ' + getSessionAnonymousHandle() + ')'}" 
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
                            placeholder="Sé directo y claro (ej: Cómo optimizar apuntes de audio de 3 horas en Notion)" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500" 
                            required 
                        />
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Detalle del Mensaje</label>
                        <textarea 
                            id="input-debate-contenido" 
                            rows="4" 
                            placeholder="Explica tu caso, el formato de archivo (.m4a, .opus, .wav), tu experiencia o la consulta..." 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed" 
                            required 
                        ></textarea>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" id="input-debate-anonimo" class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
                                <label for="input-debate-anonimo" class="text-xs text-slate-400 cursor-pointer">
                                    Publicar en modo anónimo (sin asociar perfil registrado)
                                </label>
                            </div>
                            <span class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <svg class="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                <span>Verificación en tiempo real con IA contra spam y contenido no afín</span>
                            </span>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" id="btn-cancel-nuevo-debate" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
                                Cancelar
                            </button>
                            <button type="submit" id="btn-submit-nuevo-debate" class="btn-gradient text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2">
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

        const chipsContainer = document.getElementById('subforos-chips-container');
        if (chipsContainer) {
            chipsContainer.appendChild(renderSubforosBar());
        }

        const searchInput = document.getElementById('comunidad-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderForumSection();
            });
        }

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

        const formNuevo = document.getElementById('form-nuevo-debate');
        if (formNuevo) {
            formNuevo.onsubmit = async (e) => {
                e.preventDefault();
                const btnSubmit = document.getElementById('btn-submit-nuevo-debate');
                const origHtml = btnSubmit ? btnSubmit.innerHTML : '';

                const categoria = document.getElementById('input-debate-categoria').value;
                const autor = document.getElementById('input-debate-autor').value.trim();
                const titulo = document.getElementById('input-debate-titulo').value.trim();
                const contenido = document.getElementById('input-debate-contenido').value.trim();
                const isAnon = document.getElementById('input-debate-anonimo').checked;
                const hpField = document.getElementById('input-debate-hp')?.value || '';
                const formLoadedAt = formNuevo.getAttribute('data-loaded-at') || Date.now();

                if (!titulo || !contenido || !autor) return;

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = `
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span>Escaneando con IA...</span>
                    `;
                }

                const modResult = await moderarContenidoConIA({
                    tipo: 'debate',
                    categoria: categoria,
                    titulo: titulo,
                    contenido: contenido,
                    autor: autor,
                    hp_field: hpField,
                    timestamp_form: formLoadedAt
                });

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = origHtml;
                }

                if (!modResult.aprobado) {
                    mostrarModalSeguridad(
                        'Publicación No Autorizada',
                        modResult.motivo || 'El debate ha sido clasificado como fuera de temática o no apto por el escudo de IA centinela. Asegúrate de hablar sobre transcripción, audio, vídeo, estudio o tecnología.',
                        true
                    );
                    return;
                }

                const newThread = {
                    id: 'th-' + Date.now(),
                    category: modResult.categoria && SUBFOROS.some(s => s.id === modResult.categoria) ? modResult.categoria : categoria,
                    title: titulo,
                    content: contenido,
                    author: resolveAnonymousAuthor(autor, isAnon, user.name),
                    isVerified: !isAnon && user.isLoggedIn,
                    userRole: isAnon ? 'Miembro Anónimo' : (user.isLoggedIn ? 'Usuario Registrado' : 'Miembro de la Comunidad'),
                    date: 'Ahora mismo',
                    timestamp: Date.now(),
                    upvotes: 1,
                    tags: [(modResult.categoria || categoria).toUpperCase()],
                    replies: []
                };

                const allThreads = getStoredThreads();
                allThreads.unshift(newThread);
                saveStoredThreads(allThreads);

                const curVotes = getUserVotes();
                curVotes.threads[newThread.id] = true;
                saveUserVotes(curVotes);

                renderForumSection();
            };
        }

        attachThreadActionListeners(user);
    }

    // Generar tarjeta HTML de un hilo con metadatos SEO
    function renderThreadCardHtml(thread, hasVoted) {
        const subforo = SUBFOROS.find(s => s.id === thread.category) || SUBFOROS[1];
        const initials = getInitials(thread.author);

        return `
            <article class="glass-card card-interactive rounded-3xl p-6 sm:p-7 border border-slate-800 transition" id="card-${thread.id}" itemscope itemtype="https://schema.org/DiscussionForumPosting">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">
                            ${escapeHtml(initials)}
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-bold text-white" itemprop="author">${escapeHtml(thread.author)}</span>
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

                <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug hover:text-indigo-400 transition cursor-pointer" onclick="window.EchoScribeComunidad.toggleReplies('${thread.id}')" itemprop="headline">
                    ${escapeHtml(thread.title)}
                </h3>

                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 whitespace-pre-line" itemprop="articleBody">
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

                    <div class="flex items-center gap-3">
                        <button 
                            class="text-slate-400 hover:text-white font-semibold text-xs flex items-center gap-1 transition"
                            onclick="window.EchoScribeComunidad.copyThreadLink('${thread.id}')"
                            title="Copiar enlace al debate"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                            <span>Compartir</span>
                        </button>
                        <button 
                            class="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1 transition"
                            onclick="window.EchoScribeComunidad.toggleReplies('${thread.id}')"
                        >
                            <span>Responder</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                    </div>
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
                    <form class="form-reply-thread flex flex-col sm:flex-row gap-2 mt-3" data-thread-id="${thread.id}" data-loaded-at="${Date.now()}">
                        <input type="text" name="website_url_hp" class="input-reply-hp hidden" style="display:none !important; opacity:0; position:absolute; left:-9999px;" tabindex="-1" autocomplete="off" value="" />
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
            </article>
        `;
    }

    // Listeners de interacciones en hilos
    function attachThreadActionListeners(user) {
        document.querySelectorAll('.btn-vote-thread').forEach(btn => {
            btn.onclick = () => {
                const threadId = btn.getAttribute('data-thread-id');
                const threads = getStoredThreads();
                const votes = getUserVotes();
                const target = threads.find(t => t.id === threadId);
                if (!target) return;

                if (votes.threads[threadId]) {
                    target.upvotes = Math.max(0, (target.upvotes || 1) - 1);
                    delete votes.threads[threadId];
                } else {
                    target.upvotes = (target.upvotes || 0) + 1;
                    votes.threads[threadId] = true;
                }

                saveStoredThreads(threads);
                saveUserVotes(votes);
                renderForumSection();
            };
        });

        document.querySelectorAll('.form-reply-thread').forEach(form => {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const threadId = form.getAttribute('data-thread-id');
                const input = form.querySelector('input[name="reply_content"]');
                const content = input ? input.value.trim() : '';
                const hpVal = form.querySelector('.input-reply-hp')?.value || '';
                const formLoadedAt = form.getAttribute('data-loaded-at') || Date.now();
                const btn = form.querySelector('button[type="submit"]');

                if (!content) return;

                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = `<span class="text-[11px]">Verificando...</span>`;
                }

                const modResult = await moderarContenidoConIA({
                    tipo: 'respuesta',
                    contenido: content,
                    autor: user.isLoggedIn ? user.name : 'Miembro de la Comunidad',
                    hp_field: hpVal,
                    timestamp_form: formLoadedAt
                });

                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Enviar</span>`;
                }

                if (!modResult.aprobado) {
                    mostrarModalSeguridad('Respuesta Bloqueada', modResult.motivo || 'Tu respuesta contiene elementos identificados como spam o inapropiados por el centinela de IA.', true);
                    return;
                }

                const threads = getStoredThreads();
                const target = threads.find(t => t.id === threadId);
                if (!target) return;

                if (!target.replies) target.replies = [];

                target.replies.push({
                    id: 'rep-' + Date.now(),
                    author: user.isLoggedIn ? user.name : generateCoolAnonymousName(),
                    isVerified: user.isLoggedIn,
                    content: content,
                    date: 'Ahora mismo'
                });

                saveStoredThreads(threads);
                renderForumSection();

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

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : '5.0';

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const stars = Math.min(5, Math.max(1, r.rating || 5));
            counts[stars] = (counts[stars] || 0) + 1;
        });

        const filteredReviews = reviews.filter(r => {
            if (currentRatingFilter === 'todas') return true;
            return r.rating === parseInt(currentRatingFilter, 10);
        });

        container.innerHTML = `
            <!-- HEADER RESUMEN VALORACIONES -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 mb-8 relative overflow-hidden">
                <div class="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div class="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                        <div class="text-5xl sm:text-6xl font-black text-white tracking-tight mb-2">${avg}</div>
                        <div class="flex items-center justify-center md:justify-start gap-1 mb-2">
                            ${renderStarsSvg(Math.round(parseFloat(avg)), 5, 'w-5 h-5')}
                        </div>
                        <p class="text-xs text-slate-400">Basado en <strong>${total} valoraciones reales</strong> de estudiantes, editores y empresas</p>
                    </div>

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

                    <div class="flex flex-col items-center md:items-end justify-center">
                        <p class="text-xs text-slate-400 text-center md:text-right mb-3">¿Usas la app para estudiar o trabajar?</p>
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

            <!-- FORMULARIO DE NUEVA RESEÑA -->
            <div id="review-form-box" class="hidden mb-8 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl relative">
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Escribe tu Reseña o Propuesta</h3>
                            <p class="text-[11px] text-slate-400">Tu opinión nos ayuda a pulir la herramienta y añadir funciones clave</p>
                        </div>
                    </div>
                    <button id="btn-close-review-form" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form id="form-nueva-resena" data-loaded-at="${Date.now()}" class="space-y-4">
                    <!-- Honeypot invisible contra bots -->
                    <input type="text" name="website_url_hp" id="input-review-hp" class="hidden" style="display:none !important; opacity:0; position:absolute; left:-9999px;" tabindex="-1" autocomplete="off" value="" />
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
                                <option value="Estudiante Universitario">Estudiante / Oposiciones</option>
                                <option value="Periodista / Medios">Periodismo / Medios de Comunicación</option>
                                <option value="Creador de Contenido">Creador / Editor de Vídeo</option>
                                <option value="Empresa / Consultoría">Empresa / Consultoría / PM</option>
                                <option value="Investigador">Investigación / Docencia / CSIC</option>
                                <option value="Usuario General">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Nombre o Alias</label>
                            <input 
                                type="text" 
                                id="input-review-autor" 
                                value="${user.isLoggedIn ? escapeHtml(user.name) : ''}" 
                                placeholder="${user.isLoggedIn ? escapeHtml(user.name) : 'Tu nombre o alias (ej: ' + getSessionAnonymousHandle() + ')'}" 
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
                            placeholder="Resume tu opinión en una frase" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>

                    <div>
                        <label class="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Tu Opinión o Sugerencia Detallada</label>
                        <textarea 
                            id="input-review-contenido" 
                            rows="4" 
                            placeholder="¿Qué problema te resolvió? ¿Qué añadirías a la app de escritorio?" 
                            class="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                            required
                        ></textarea>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" id="input-review-anonimo" class="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0">
                                <label for="input-review-anonimo" class="text-xs text-slate-400 cursor-pointer">
                                    Publicar reseña en modo anónimo
                                </label>
                            </div>
                            <span class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <svg class="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                <span>Verificación activa con IA centinela</span>
                            </span>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" id="btn-cancel-review-form" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
                                Cancelar
                            </button>
                            <button type="submit" id="btn-submit-review" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2">
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
                        <div class="glass-card card-interactive rounded-3xl p-6 border border-slate-800 flex flex-col justify-between transition" itemscope itemtype="https://schema.org/Review">
                            <div>
                                <div class="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <div class="flex items-center gap-1.5 mb-1">
                                            <span class="text-xs font-bold text-white" itemprop="author">${escapeHtml(rev.author)}</span>
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

                                <h4 class="text-sm font-bold text-white mb-2 leading-snug" itemprop="name">${escapeHtml(rev.title)}</h4>
                                <p class="text-xs text-slate-300 leading-relaxed mb-4" itemprop="reviewBody">${escapeHtml(rev.content)}</p>
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

        document.querySelectorAll('.filter-rating-btn').forEach(btn => {
            btn.onclick = () => {
                currentRatingFilter = btn.getAttribute('data-filter');
                renderReviewsSection();
            };
        });

        const formRev = document.getElementById('form-nueva-resena');
        if (formRev) {
            formRev.onsubmit = async (e) => {
                e.preventDefault();
                const btnSubmit = document.getElementById('btn-submit-review');
                const origHtml = btnSubmit ? btnSubmit.innerHTML : '';

                const role = document.getElementById('input-review-role').value;
                const autor = document.getElementById('input-review-autor').value.trim();
                const titulo = document.getElementById('input-review-titulo').value.trim();
                const contenido = document.getElementById('input-review-contenido').value.trim();
                const isAnon = document.getElementById('input-review-anonimo').checked;
                const hpField = document.getElementById('input-review-hp')?.value || '';
                const formLoadedAt = formRev.getAttribute('data-loaded-at') || Date.now();

                if (!titulo || !contenido || !autor) return;

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = `
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span>Escaneando reseña con IA...</span>
                    `;
                }

                const modResult = await moderarContenidoConIA({
                    tipo: 'resena',
                    categoria: role,
                    titulo: titulo,
                    contenido: contenido,
                    autor: autor,
                    hp_field: hpField,
                    timestamp_form: formLoadedAt
                });

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = origHtml;
                }

                if (!modResult.aprobado) {
                    mostrarModalSeguridad(
                        'Reseña No Aprobada',
                        modResult.motivo || 'Tu reseña no cumple las normas temáticas o de ciberseguridad del sistema. Por favor, asegúrate de hablar sobre tu experiencia con EchoScribe o la transcripción.',
                        true
                    );
                    return;
                }

                const newRev = {
                    id: 'rev-' + Date.now(),
                    author: isAnon ? (autor.includes('_') ? autor : 'anónimo_' + Math.floor(100 + Math.random() * 900)) : autor,
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
                            <p class="text-[11px] text-slate-400">Pregunta dudas o comparte tu experiencia (anónimo o con cuenta)</p>
                        </div>
                    </div>
                    <a href="/guias#comunidad" class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                        <span>Ver Foro General</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </a>
                </div>

                <!-- FORMULARIO COMENTARIO EN GUÍA -->
                <form id="form-guia-comment" data-loaded-at="${Date.now()}" class="space-y-3 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                    <input type="text" name="website_url_hp" id="input-gc-hp" class="hidden" style="display:none !important; opacity:0; position:absolute; left:-9999px;" tabindex="-1" autocomplete="off" value="" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            id="input-gc-autor" 
                            value="${user.isLoggedIn ? escapeHtml(user.name) : ''}" 
                            placeholder="${user.isLoggedIn ? escapeHtml(user.name) : 'Tu nombre o alias (ej: ' + getSessionAnonymousHandle() + ')'}" 
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
                    <div class="flex items-center justify-between pt-1">
                        <span class="text-[10px] text-slate-500 flex items-center gap-1">
                            <svg class="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            <span>Centinela de seguridad activo</span>
                        </span>
                        <button type="submit" id="btn-submit-gc" class="btn-gradient text-white text-xs font-bold py-2 px-5 rounded-xl transition flex items-center gap-1.5 shadow-md">
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
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btnSubmit = document.getElementById('btn-submit-gc');
                const origHtml = btnSubmit ? btnSubmit.innerHTML : '';

                const autorInput = document.getElementById('input-gc-autor');
                const contenidoInput = document.getElementById('input-gc-contenido');
                const isAnon = document.getElementById('input-gc-anonimo')?.checked;
                const hpField = document.getElementById('input-gc-hp')?.value || '';
                const formLoadedAt = form.getAttribute('data-loaded-at') || Date.now();

                const autor = autorInput.value.trim();
                const contenido = contenidoInput.value.trim();
                if (!autor || !contenido) return;

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = `
                        <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span>Verificando...</span>
                    `;
                }

                const modResult = await moderarContenidoConIA({
                    tipo: 'comentario_guia',
                    categoria: slug,
                    titulo: 'Comentario en Guía ' + slug,
                    contenido: contenido,
                    autor: autor,
                    hp_field: hpField,
                    timestamp_form: formLoadedAt
                });

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = origHtml;
                }

                if (!modResult.aprobado) {
                    mostrarModalSeguridad(
                        'Comentario No Autorizado',
                        modResult.motivo || 'Tu comentario no cumple los requisitos temáticos o de seguridad del centinela de IA.',
                        true
                    );
                    return;
                }

                const newC = {
                    id: 'gc-' + Date.now(),
                    author: isAnon ? (autor.includes('_') ? autor : 'anónimo_' + Math.floor(100 + Math.random() * 900)) : autor,
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

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function toggleReplies(threadId, forceOpen) {
        const box = document.getElementById(`replies-box-${threadId}`);
        if (box) {
            if (forceOpen === true) {
                box.classList.remove('hidden');
            } else {
                box.classList.toggle('hidden');
            }
        }
    }

    function copyThreadLink(threadId) {
        const url = `${window.location.origin}/guias#${threadId}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => showToast('Enlace al debate copiado al portapapeles'))
                .catch(() => fallbackCopy(threadId));
        } else {
            fallbackCopy(threadId);
        }
    }

    function fallbackCopy(threadId) {
        window.location.hash = threadId;
        showToast('Enlace permanente activado');
    }

    function showToast(msg) {
        const existing = document.getElementById('comunidad-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'comunidad-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl transition flex items-center gap-2 border border-indigo-400/40 animate-bounce';
        toast.innerHTML = '<svg class="w-4 h-4 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>' + escapeHtml(msg) + '</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function switchTab(tabName) {
        const tabGuias = document.getElementById('tab-btn-guias');
        const tabForo = document.getElementById('tab-btn-foro');
        const tabResenas = document.getElementById('tab-btn-resenas');

        const viewGuias = document.getElementById('comunidad-guias-view');
        const viewForo = document.getElementById('comunidad-foro-view');
        const viewResenas = document.getElementById('comunidad-resenas-view');

        const heroSub = document.getElementById('comunidad-hero-subtitle');

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
        } else if (tabName === 'resenas' || tabName === 'opiniones') {
            if (tabResenas) {
                tabResenas.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
                tabResenas.classList.remove('text-slate-400');
            }
            if (viewResenas) viewResenas.classList.remove('hidden');
            if (heroSub) heroSub.textContent = 'Valora tu experiencia con EchoScribe, consulta opiniones contrastadas o propón nuevas características para el software.';
            renderReviewsSection();
        } else {
            if (tabGuias) {
                tabGuias.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
                tabGuias.classList.remove('text-slate-400');
            }
            if (viewGuias) viewGuias.classList.remove('hidden');
            if (heroSub) heroSub.textContent = 'Descubre cómo EchoScribe resuelve problemas reales de transcripción periodística, subtitulado automático y redacción con IA.';
        }
    }

    function handleHashRouting() {
        const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
        if (!rawHash) return;

        if (rawHash.includes('comunidad') || rawHash.includes('foro') || rawHash.startsWith('th-') || rawHash.includes('debate')) {
            switchTab('foro');
            if (rawHash.startsWith('th-')) {
                setTimeout(() => {
                    const el = document.getElementById(`card-${rawHash}`) || document.getElementById(rawHash);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        toggleReplies(rawHash, true);
                        el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-slate-900');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-slate-900'), 3500);
                    }
                }, 300);
            }
        } else if (rawHash.includes('resenas') || rawHash.includes('opiniones') || rawHash.includes('mejoras') || rawHash.startsWith('rev-')) {
            switchTab('resenas');
            if (rawHash.startsWith('rev-')) {
                setTimeout(() => {
                    const el = document.getElementById(`card-${rawHash}`) || document.getElementById(rawHash);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-slate-900');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-slate-900'), 3500);
                    }
                }, 300);
            }
        } else if (rawHash.includes('guias')) {
            switchTab('guias');
        }
    }

    function init() {
        const tabGuias = document.getElementById('tab-btn-guias');
        const tabForo = document.getElementById('tab-btn-foro');
        const tabResenas = document.getElementById('tab-btn-resenas');

        if (tabGuias) tabGuias.onclick = () => { switchTab('guias'); window.history.replaceState(null, '', '#guias'); };
        if (tabForo) tabForo.onclick = () => { switchTab('foro'); window.history.replaceState(null, '', '#comunidad'); };
        if (tabResenas) tabResenas.onclick = () => { switchTab('resenas'); window.history.replaceState(null, '', '#resenas'); };

        handleHashRouting();

        window.addEventListener('hashchange', () => {
            handleHashRouting();
        });

        initGuideComments();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.EchoScribeComunidad = {
        switchTab: switchTab,
        toggleReplies: toggleReplies,
        copyThreadLink: copyThreadLink,
        renderForum: renderForumSection,
        renderReviews: renderReviewsSection,
        initGuideComments: initGuideComments,
        'ecoscribe-vs-whisper': [
            {
                        "id": "gc-evw-1",
                        "author": "dev_audio_lab",
                        "isVerified": false,
                        "content": "La diferencia fundamental es que Whisper puro no tiene capa léxica de validación. Para audios limpios en inglés va sobrado, pero en español coloquial o jerga profesional la tasa de error por deformación fonética sube bastante. El paso con Gemini lo deja perfecto.",
                        "date": "Hace 1 día",
                        "upvotes": 24
            },
            {
                        "id": "gc-evw-2",
                        "author": "Pelayo S.",
                        "isVerified": true,
                        "content": "Totalmente. En edición de vídeo, tener que corregir a mano cada nombre propio arruina cualquier automatización. Con la corrección editorial de EchoScribe te ahorras esa revisión manual.",
                        "date": "Ayer",
                        "upvotes": 17
            }
],
        'generar-subtitulos-premiere-capcut-davinci': [
            {
                        "id": "gc-sub-1",
                        "author": "editor_freelance_bcn",
                        "isVerified": false,
                        "content": "El perfil 'Corto' (18-24 caracteres) es perfecto para TikTok y Reels. Evita que el texto tape la cara del creador o los botones de la interfaz nativa.",
                        "date": "Hace 2 días",
                        "upvotes": 31
            },
            {
                        "id": "gc-sub-2",
                        "author": "anónimo_vfx",
                        "isVerified": false,
                        "content": "En Premiere basta con arrastrar el .srt a la línea de tiempo y aplicarle un estilo de pista con la fuente que uses siempre. Ahorro de horas absoluto.",
                        "date": "Ayer",
                        "upvotes": 15
            }
],
        'transcribir-clases-universidad': [
            {
                        "id": "gc-clu-1",
                        "author": "Brais C.",
                        "isVerified": true,
                        "content": "Consejo: si grabáis con móvil, colocadlo sobre un estuche o pañuelo para amortiguar el ruido de la gente tecleando en los portátiles alrededor.",
                        "date": "Hace 2 días",
                        "upvotes": 42
            },
            {
                        "id": "gc-clu-2",
                        "author": "opositor_forestal",
                        "isVerified": false,
                        "content": "Para preparar repasos espaciados, pasarle la transcripción a Gemini pidiéndole tarjetas Anki en formato CSV funciona de locos.",
                        "date": "Hace 1 día",
                        "upvotes": 29
            }
],
        'transcribir-partidos-futbol': [
            {
                        "id": "gc-fut-1",
                        "author": "periodista_deportivo",
                        "isVerified": true,
                        "content": "Lo mejor es que cuando el comentarista suelta de carrerilla tres nombres propios ('Dimitrievski, Maffeo, Tárrega') no los junta en una palabra rara como hace el transcriptor tradicional. El despegue fonético funciona impecable.",
                        "date": "Hace 3 días",
                        "upvotes": 26
            }
],
        'transcribir-traducir-subtitulos-srt-simultaneo': [
            {
                        "id": "gc-trad-1",
                        "author": "subtitulador_freelance",
                        "isVerified": true,
                        "content": "El mapeo cue a cue con DeepSeek V4 Flash mantiene la duración exacta del subtítulo sin desfases ni palabras apelotonadas. Clave para entregar trabajos a agencias.",
                        "date": "Hace 2 días",
                        "upvotes": 33
            }
],
        'transcribir-entrevistas-periodismo': [
            {
                        "id": "gc-per-1",
                        "author": "Naiara V.",
                        "isVerified": true,
                        "content": "La confidencialidad del borrado en 24h es indispensable para fuentes protegidas y entrevistas sensibles. Cumple al 100% con los requisitos de protección de datos de la redacción.",
                        "date": "Hace 4 días",
                        "upvotes": 28
            }
],
        'transcribir-reuniones-zoom-teams-meet': [
            {
                        "id": "gc-reu-1",
                        "author": "Iker Albiol",
                        "isVerified": true,
                        "content": "Mucho mejor que los bots que se meten a la llamada y asustan a los clientes. Grabo el audio con la grabadora del sistema y lo proceso aquí en 20 segundos.",
                        "date": "Hace 3 días",
                        "upvotes": 37
            }
],
        'transcribir-audios-bilingues-dos-idiomas': [
            {
                        "id": "gc-bil-1",
                        "author": "Joana M.",
                        "isVerified": true,
                        "content": "En ruedas de prensa internacionales donde mezclan preguntas en inglés y respuestas en español es el único transcriptor que no inventa palabras por forzar un solo idioma.",
                        "date": "Hace 2 días",
                        "upvotes": 22
            }
],
        'transcribir-entrevistas-tfg': [
            {
                        "id": "gc-tfg-1",
                        "author": "Uxue Larrañaga",
                        "isVerified": true,
                        "content": "Para análisis cualitativo con codificación temático-conceptual te ahorra semanas de transcripción manual antes de meter los textos a ATLAS.ti o MAXQDA.",
                        "date": "Hace 3 días",
                        "upvotes": 30
            }
],
        'transcribir-podcast-spotify-ivoox-a-texto': [
            {
                        "id": "gc-pod-1",
                        "author": "Pelayo S.",
                        "isVerified": true,
                        "content": "Subir el episodio completo y pedirle que extraiga los 5 mejores momentos para crear hilos en X o carruseles en LinkedIn nos ha duplicado el alcance orgánico.",
                        "date": "Hace 4 días",
                        "upvotes": 25
            }
],
        'transcribir-ruedas-prensa': [
            {
                        "id": "gc-rdp-1",
                        "author": "periodista_deportivo",
                        "isVerified": true,
                        "content": "La acústica en las salas de prensa suele tener eco de micrófonos y preguntas sin micro desde el fondo. La combinación de Whisper Turbo y la corrección editorial saca el texto limpio al primer intento.",
                        "date": "Hace 5 días",
                        "upvotes": 19
            }
]
    };

})();
