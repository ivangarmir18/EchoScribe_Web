// EchoScribe Universal Navbar & Auth Synchronization
(function() {
    const SUPABASE_URL = 'https://ggmaiqxbidcxhbungnpx.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWFpcXhiaWRjeGhidW5nbnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjI4OTUsImV4cCI6MjEwMzIzODg5NX0.dFblpUUXInw4JLbsQQVa5NcxFWoCz3Ydff2c87_gRew'; 
    
    if (typeof supabase === 'undefined') return;
    const sb = window.sb || supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.sb = sb;

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

    sb.auth.onAuthStateChange((_, session) => {
        actualizarNavbarGlobal(session?.user);
    });

    document.addEventListener('DOMContentLoaded', async () => {
        const { data: { session } } = await sb.auth.getSession();
        actualizarNavbarGlobal(session?.user);
    });
})();

