// EchoScribe Universal Navbar & Auth Handshake Synchronization
(function() {
    const SUPABASE_URL = 'https://ggmaiqxbidcxhbungnpx.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWFpcXhiaWRjeGhidW5nbnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjI4OTUsImV4cCI6MjEwMzIzODg5NX0.dFblpUUXInw4JLbsQQVa5NcxFWoCz3Ydff2c87_gRew'; 
    
    if (typeof supabase === 'undefined') return;
    
    // Configuración robusta de Supabase Client con persistencia en localStorage
    const sb = window.sb || supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    window.sb = sb;

    // Procesar Magic Handshake / Auto-login transferido desde la App de Escritorio
    async function procesarAutoLoginUrl() {
        try {
            const rawHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
            const rawQuery = window.location.search.startsWith('?') ? window.location.search.substring(1) : window.location.search;
            
            const params = new URLSearchParams(rawHash || rawQuery);
            let accessToken = params.get('access_token');
            let refreshToken = params.get('refresh_token');

            // Si vino en query pero no en hash
            if (!accessToken && rawQuery) {
                const qParams = new URLSearchParams(rawQuery);
                accessToken = qParams.get('access_token');
                refreshToken = qParams.get('refresh_token');
            }

            if (accessToken && refreshToken) {
                console.log('[AUTH] Token detectado desde la App. Sincronizando sesión...');
                const { data, error } = await sb.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (!error && data?.session) {
                    console.log('[AUTH] ✅ Sesión transferida con éxito:', data.session.user?.email);
                    // Limpiar la barra de direcciones para seguridad y estética
                    let cleanSearch = window.location.search
                        .replace(/[?&]access_token=[^&]+/g, '')
                        .replace(/[?&]refresh_token=[^&]+/g, '');
                    if (cleanSearch.startsWith('&')) cleanSearch = '?' + cleanSearch.substring(1);
                    if (cleanSearch === '?') cleanSearch = '';

                    const cleanUrl = window.location.pathname + cleanSearch;
                    window.history.replaceState({}, document.title, cleanUrl || window.location.pathname);
                    return data.session;
                } else if (error) {
                    console.warn('[AUTH] Error validando tokens:', error.message);
                }
            }
        } catch(e) {
            console.warn('[AUTH] Error en handshake de auto-login:', e);
        }
        return null;
    }

    async function actualizarNavbarGlobal(user) {
        const navGuest = document.getElementById('nav-guest');
        const navUser = document.getElementById('nav-user');
        const userLabel = document.getElementById('nav-user-label');
        if (!navGuest || !navUser) return;

        if (user) {
            navGuest.classList.add('hidden');
            navUser.classList.remove('hidden');
            navUser.classList.add('flex');
            if (userLabel) {
                const name = user.user_metadata?.username || user.email?.split('@')[0] || 'Mi Cuenta';
                userLabel.innerText = name;
            }
        } else {
            navGuest.classList.remove('hidden');
            navUser.classList.add('hidden');
            navUser.classList.remove('flex');
        }
    }

    window.cerrarSesionWeb = async function() {
        await sb.auth.signOut();
        window.location.href = '/';
    };

    window.openAuthModal = function(mode) {
        window.location.href = '/?auth=' + (mode || 'login');
    };

    sb.auth.onAuthStateChange((_, session) => {
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });

    document.addEventListener('DOMContentLoaded', async () => {
        // Primero intentar auto-login si viene de la app
        let session = await procesarAutoLoginUrl();
        if (!session) {
            const res = await sb.auth.getSession();
            session = res.data?.session;
        }
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });
})();

