// EchoScribe Universal Navbar & Auth Handshake Synchronization
(function() {
    const SUPABASE_URL = 'https://ggmaiqxbidcxhbungnpx.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWFpcXhiaWRjeGhidW5nbnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjI4OTUsImV4cCI6MjEwMzIzODg5NX0.dFblpUUXInw4JLbsQQVa5NcxFWoCz3Ydff2c87_gRew';

    // Render temprano del navbar desde la sesion persistida en localStorage.
    // Evita que "Registrate" parpadee (o se quede fijo) si el CDN de Supabase tarda o falla.
    try {
        const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        if (storageKey) {
            const raw = JSON.parse(localStorage.getItem(storageKey) || 'null');
            const cachedUser = raw?.user || raw?.currentSession?.user;
            if (cachedUser) {
                const navGuest = document.getElementById('nav-guest');
                const navUser = document.getElementById('nav-user');
                if (navGuest && navUser) {
                    navGuest.classList.add('hidden');
                    navUser.classList.remove('hidden');
                    navUser.classList.add('flex');
                    const label = document.getElementById('nav-user-label');
                    if (label) label.innerText = cachedUser.user_metadata?.username || cachedUser.email?.split('@')[0] || 'Mi Cuenta';
                }
            }
        }
    } catch (e) { /* cache corrupta: se ignora */ }

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
        <div class="glass-card p-8 rounded-3xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-800 bg-[#0f172a]" id="auth-modal-content">
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
                <div id="web-field-legal" class="flex items-start gap-2 text-xs text-slate-400 mb-2">
                    <input type="checkbox" id="web-auth-legal" required class="mt-0.5 accent-indigo-500 w-4 h-4 shrink-0">
                    <label for="web-auth-legal" class="leading-snug">He leído y acepto la <a href="/politica-privacidad" target="_blank" class="text-indigo-400 hover:underline font-semibold">Política de Privacidad</a>, los <a href="/terminos-y-condiciones" target="_blank" class="text-indigo-400 hover:underline font-semibold">Términos y Condiciones</a> y la <a href="/politica-cookies" target="_blank" class="text-indigo-400 hover:underline font-semibold">Política de Cookies</a>.</label>
                </div>
                <div id="web-field-promo" class="flex items-start gap-2 text-xs text-slate-400 mb-3">
                    <input type="checkbox" id="web-auth-promo" class="mt-0.5 accent-indigo-500 w-4 h-4 shrink-0">
                    <label for="web-auth-promo" class="leading-snug">Quiero recibir correos promocionales, novedades y ofertas especiales.</label>
                </div>
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
            const fieldLegal = document.getElementById('web-field-legal');
            const fieldPromo = document.getElementById('web-field-promo');
            const authLegal = document.getElementById('web-auth-legal');
            if (fieldLegal) fieldLegal.classList.remove('hidden');
            if (fieldPromo) fieldPromo.classList.remove('hidden');
            if (authLegal) authLegal.setAttribute('required', 'true');
        } else {
            title.innerText = "Iniciar Sesión";
            subtitle.innerText = "Accede a tu cuenta de EchoScribe.";
            btn.innerText = "Entrar";
            switchText.innerText = "¿No tienes cuenta?";
            switchBtn.innerText = "Regístrate gratis";
            if (fieldUser) fieldUser.classList.add('hidden');
            if (fieldPwd2) fieldPwd2.classList.add('hidden');
            if (fieldForgot) fieldForgot.classList.remove('hidden');
            const fieldLegal = document.getElementById('web-field-legal');
            const fieldPromo = document.getElementById('web-field-promo');
            const authLegal = document.getElementById('web-auth-legal');
            if (fieldLegal) fieldLegal.classList.add('hidden');
            if (fieldPromo) fieldPromo.classList.add('hidden');
            if (authLegal) authLegal.removeAttribute('required');
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
                marcarCookiesYAceptacionGlobal();
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
                marcarCookiesYAceptacionGlobal();
                window.closeAuthModal();
                actualizarNavbarGlobal(data.user);
                window.location.reload();
            }
        }
        if (btn) btn.disabled = false;
    };

    sb.auth.onAuthStateChange((_, session) => {
        if (session?.user) {
            marcarCookiesYAceptacionGlobal();
        }
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });

    
    // ==========================================
    // SISTEMA UNIVERSAL DE BANNER DE COOKIES & SESION
    // ==========================================
    function marcarCookiesYAceptacionGlobal() {
        try {
            localStorage.setItem('echoscribe_cookie_consent', 'essential');
            localStorage.setItem('echoscribe_cookies_accepted', 'true');
            localStorage.setItem('echoscribe_bienvenida_vista', 'true');
            localStorage.setItem('echoscribe_visited', '1');
            document.cookie = "echoscribe_cookies_accepted=true; path=/; max-age=31536000; SameSite=Lax";
            document.cookie = "echoscribe_cookie_consent=essential; path=/; max-age=31536000; SameSite=Lax";
            document.cookie = "echoscribe_bienvenida_vista=true; path=/; max-age=31536000; SameSite=Lax";
            document.cookie = "echoscribe_visited=1; path=/; max-age=31536000; SameSite=Lax";
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.style.opacity = '0';
                banner.style.transform = 'translateY(20px)';
                banner.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => banner.remove(), 400);
            }
        } catch(e) {}
    }
    window.aceptarCookiesEchoScribe = marcarCookiesYAceptacionGlobal;

    function initCookieBanner() {
        try {
            const accepted = localStorage.getItem('echoscribe_cookies_accepted') === 'true' ||
                             localStorage.getItem('echoscribe_cookie_consent') ||
                             document.cookie.includes('echoscribe_cookies_accepted=true') ||
                             document.cookie.includes('echoscribe_cookie_consent=');
            if (accepted || document.getElementById('cookie-banner')) return;

            const banner = document.createElement('div');
            banner.id = 'cookie-banner';
            banner.setAttribute('role', 'region');
            banner.setAttribute('aria-label', 'Consentimiento de cookies');
            banner.style.cssText = `
                position: fixed;
                bottom: 1.25rem;
                right: 1.25rem;
                left: auto;
                width: calc(100% - 2.5rem);
                max-width: 440px;
                margin-left: auto;
                background: rgba(13, 19, 36, 0.94);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(168, 85, 247, 0.35);
                box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(139, 92, 246, 0.18);
                border-radius: 1.25rem;
                padding: 1.25rem 1.35rem;
                z-index: 999999;
                color: #e2e8f0;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: cookieSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            `;

            banner.innerHTML = `
                <style>
                    @keyframes cookieSlideUp {
                        from { opacity: 0; transform: translateY(30px) scale(0.96); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .cookie-btn-primary {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                        color: white;
                        font-weight: 700;
                        font-size: 0.8rem;
                        padding: 0.55rem 1.15rem;
                        border-radius: 0.75rem;
                        border: none;
                        cursor: pointer;
                        transition: all 0.25s ease;
                        box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
                    }
                    .cookie-btn-primary:hover {
                        transform: translateY(-1.5px);
                        box-shadow: 0 10px 22px rgba(139, 92, 246, 0.5);
                    }
                    .cookie-btn-secondary {
                        background: transparent;
                        color: #94a3b8;
                        font-weight: 600;
                        font-size: 0.75rem;
                        padding: 0.55rem 0.85rem;
                        border-radius: 0.75rem;
                        border: 1px solid rgba(148, 163, 184, 0.2);
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .cookie-btn-secondary:hover {
                        color: #f8fafc;
                        border-color: rgba(148, 163, 184, 0.5);
                        background: rgba(255, 255, 255, 0.05);
                    }
                </style>
                <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
                    <div style="width: 36px; height: 36px; border-radius: 0.75rem; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                            <path d="M8.5 8.5v.01"></path>
                            <path d="M16 15.5v.01"></path>
                            <path d="M12 12v.01"></path>
                            <path d="M11 17v.01"></path>
                            <path d="M7 14v.01"></path>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                            <h4 style="margin: 0; font-size: 0.875rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.01em;">Privacidad y Cookies</h4>
                            <button onclick="window.aceptarCookiesEchoScribe()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 0.2rem;" title="Cerrar">✕</button>
                        </div>
                        <p style="margin: 0 0 0.85rem 0; font-size: 0.75rem; line-height: 1.45; color: #cbd5e1;">
                            Utilizamos cookies esenciales para sincronizar tu sesión, guardar tus configuraciones de IA y asegurar una experiencia rápida. Consulta nuestra <a href="/politica-privacidad" target="_blank" style="color: #c084fc; text-decoration: underline; font-weight: 600;">Política de Privacidad</a>.
                        </p>
                        <div style="display: flex; align-items: center; gap: 0.6rem; justify-content: flex-end;">
                            <button onclick="window.aceptarCookiesEchoScribe()" class="cookie-btn-secondary">Solo esenciales</button>
                            <button onclick="window.aceptarCookiesEchoScribe()" class="cookie-btn-primary">Aceptar todas</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        } catch(e) {}
    }

    document.addEventListener('DOMContentLoaded', async () => {
        initCookieBanner();
        let session = await procesarAutoLoginUrl();
        if (!session) {
            const res = await sb.auth.getSession();
            session = res.data?.session;
        }
        actualizarNavbarGlobal(session?.user);
        window.dispatchEvent(new CustomEvent('echoscribe:auth_ready', { detail: { session } }));
    });
})();

