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
        window.location.reload();
    };

    function asegurarModalAuthEnPagina() {
        if (document.getElementById('auth-modal')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'auth-modal';
        modalDiv.className = 'fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4';
        modalDiv.innerHTML = `
        <div class="glass-card p-8 rounded-3xl w-full max-w-[400px] shadow-2xl relative border border-slate-800 bg-[#0f172a]" id="auth-modal-content">
            <button onclick="window.closeAuthModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white transition">✕</button>
            <div class="text-center mb-6">
                <h2 id="web-auth-title" class="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
                <p id="web-auth-subtitle" class="text-sm text-slate-400 mb-6">Accede a tu cuenta de EchoScribe.</p>
                <button onclick="window.iniciarConGoogleWeb()" class="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl flex justify-center items-center gap-3 transition shadow-md">
                    <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s-.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continuar con Google
                </button>
                <div class="flex items-center my-6">
                    <hr class="flex-1 border-slate-700">
                    <span class="px-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">O con email</span>
                    <hr class="flex-1 border-slate-700">
                </div>
            </div>
            
            <form id="web-auth-form" onsubmit="event.preventDefault(); window.procesarAuthWeb();" class="space-y-4">
                <div id="web-field-username" class="hidden">
                    <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Nombre de Usuario</label>
                    <input type="text" id="web-auth-user" placeholder="Ej. usuario18" class="w-full bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-white transition text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Correo Electrónico</label>
                    <input type="email" id="web-auth-email" required placeholder="tu@correo.com" class="w-full bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-white transition text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Contraseña</label>
                    <input type="password" id="web-auth-pwd" required minlength="6" placeholder="Mínimo 6 caracteres" class="w-full bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-white transition text-sm">
                </div>
                <div id="web-field-repeat-pwd" class="hidden">
                    <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Repetir Contraseña</label>
                    <input type="password" id="web-auth-pwd-2" placeholder="Debe coincidir" class="w-full bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-white transition text-sm">
                </div>
                <div id="web-field-forgot" class="text-right">
                    <a href="/recuperar-password" class="text-xs text-indigo-400 hover:underline font-semibold">¿Olvidaste tu contraseña?</a>
                </div>
                <p id="web-auth-error" class="hidden text-xs text-rose-400 font-semibold"></p>
                <button type="submit" id="web-auth-submit-btn" class="w-full btn-gradient text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition">Iniciar Sesión</button>
            </form>
            
            <div class="mt-6 text-center text-sm text-slate-400 border-t border-slate-700/50 pt-6">
                <span id="web-auth-switch-text">¿No tienes cuenta?</span> 
                <button onclick="window.toggleAuthModeWeb()" id="web-auth-switch-btn" class="text-indigo-400 font-bold hover:underline ml-1">Regístrate gratis</button>
            </div>
        </div>`;
        document.body.appendChild(modalDiv);
    }

    let webAuthMode = 'login';

    window.openAuthModal = function(mode) {
        if (window.location.pathname === '/' && typeof openAuthModalNative === 'function') {
            openAuthModalNative(mode);
            return;
        }
        asegurarModalAuthEnPagina();
        webAuthMode = mode || 'login';
        window.updateWebAuthUI();
        const m = document.getElementById('auth-modal');
        if (m) m.classList.remove('hidden');
    };

    window.closeAuthModal = function() {
        const m = document.getElementById('auth-modal');
        if (m) m.classList.add('hidden');
    };

    window.toggleAuthModeWeb = function() {
        webAuthMode = webAuthMode === 'register' ? 'login' : 'register';
        window.updateWebAuthUI();
    };

    window.updateWebAuthUI = function() {
        const title = document.getElementById('web-auth-title');
        const subtitle = document.getElementById('web-auth-subtitle');
        const btn = document.getElementById('web-auth-submit-btn');
        const switchText = document.getElementById('web-auth-switch-text');
        const switchBtn = document.getElementById('web-auth-switch-btn');
        const fieldUser = document.getElementById('web-field-username');
        const fieldPwd2 = document.getElementById('web-field-repeat-pwd');
        const fieldForgot = document.getElementById('web-field-forgot');
        const errorEl = document.getElementById('web-auth-error');
        if (errorEl) errorEl.classList.add('hidden');

        if (!title) return;

        if (webAuthMode === 'register') {
            title.innerText = "Crear Cuenta";
            subtitle.innerText = "Regístrate para usar EchoScribe.";
            btn.innerText = "Registrarse";
            switchText.innerText = "¿Ya tienes una cuenta?";
            switchBtn.innerText = "Inicia Sesión";
            if (fieldUser) fieldUser.classList.remove('hidden');
            if (fieldPwd2) fieldPwd2.classList.remove('hidden');
            if (fieldForgot) fieldForgot.classList.add('hidden');
        } else {
            title.innerText = "Iniciar Sesión";
            subtitle.innerText = "Accede a tu cuenta de EchoScribe.";
            btn.innerText = "Entrar";
            switchText.innerText = "¿No tienes cuenta?";
            switchBtn.innerText = "Regístrate gratis";
            if (fieldUser) fieldUser.classList.add('hidden');
            if (fieldPwd2) fieldPwd2.classList.add('hidden');
            if (fieldForgot) fieldForgot.classList.remove('hidden');
        }
    };

    window.iniciarConGoogleWeb = async function() {
        const { error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) {
            const errEl = document.getElementById('web-auth-error');
            if (errEl) {
                errEl.innerText = error.message;
                errEl.classList.remove('hidden');
            }
        }
    };

    window.procesarAuthWeb = async function() {
        const email = document.getElementById('web-auth-email')?.value;
        const pwd = document.getElementById('web-auth-pwd')?.value;
        const errEl = document.getElementById('web-auth-error');
        const btn = document.getElementById('web-auth-submit-btn');

        if (errEl) errEl.classList.add('hidden');
        if (btn) btn.disabled = true;

        if (webAuthMode === 'register') {
            const user = document.getElementById('web-auth-user')?.value || '';
            const pwd2 = document.getElementById('web-auth-pwd-2')?.value;
            if (pwd !== pwd2) {
                if (errEl) {
                    errEl.innerText = "Las contraseñas no coinciden.";
                    errEl.classList.remove('hidden');
                }
                if (btn) btn.disabled = false;
                return;
            }
            const { error } = await sb.auth.signUp({
                email,
                password: pwd,
                options: { data: { username: user }, emailRedirectTo: window.location.origin }
            });
            if (error && errEl) {
                errEl.innerText = error.message;
                errEl.classList.remove('hidden');
            } else {
                alert("¡Cuenta creada con éxito! Puedes iniciar sesión.");
                webAuthMode = 'login';
                window.updateWebAuthUI();
            }
        } else {
            const { data, error } = await sb.auth.signInWithPassword({ email, password: pwd });
            if (error && errEl) {
                errEl.innerText = error.message;
                errEl.classList.remove('hidden');
            } else if (data?.user) {
                window.closeAuthModal();
                actualizarNavbarGlobal(data.user);
                window.location.reload();
            }
        }
        if (btn) btn.disabled = false;
    };

    sb.auth.onAuthStateChange((_, session) => {
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });

    document.addEventListener('DOMContentLoaded', async () => {
        let session = await procesarAutoLoginUrl();
        if (!session) {
            const res = await sb.auth.getSession();
            session = res.data?.session;
        }
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });
})();

