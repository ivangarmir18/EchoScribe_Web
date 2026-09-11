/**
 * EchoScribe Security Sentinel - Protección Anti-Inspección y Antipiratería
 * Protege contra plagios, inspección no autorizada de elementos, descarga directa de recursos
 * y atajos de teclado de desarrollador (F12, Ctrl+Shift+I, etc.).
 *
 * Modo desarrollador (desactivar protección):
 * - Pulsa Ctrl + Alt + Shift + D en cualquier momento para alternar el modo desarrollador.
 * - O añade ?echoscribe_dev=1 a la URL.
 */
(function() {
    'use strict';

    // 0. Comprobación de bypass para el desarrollador / creador
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var isDevMode = urlParams.get('echoscribe_dev') === '1' || 
                        localStorage.getItem('echoscribe_dev_unlocked') === 'true' ||
                        (window.location.hostname === 'localhost' && urlParams.get('test_anti_inspect') !== '1');

        // Atajo secreto para el propietario: Ctrl + Alt + Shift + D
        window.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd' || e.code === 'KeyD')) {
                e.preventDefault();
                if (localStorage.getItem('echoscribe_dev_unlocked') === 'true') {
                    localStorage.removeItem('echoscribe_dev_unlocked');
                    alert('🛡️ EchoScribe Security: Modo protegido ACTIVADO (inspección bloqueada).');
                } else {
                    localStorage.setItem('echoscribe_dev_unlocked', 'true');
                    alert('🔓 EchoScribe Security: Modo desarrollador ACTIVADO (inspección permitida).');
                }
                window.location.reload();
            }
        }, true);

        if (isDevMode) {
            console.info('%c[EchoScribe Security] Modo desarrollador habilitado: inspección y consola permitidas.', 'color: #10b981; font-weight: bold;');
            return;
        }
    } catch (err) {}

    // 1. Bloqueo de menú contextual (clic derecho)
    // Se respetan exclusivamente inputs, textareas y editores para que el usuario pueda pegar y redactar normalmente
    document.addEventListener('contextmenu', function(e) {
        var target = e.target;
        var tag = target && target.tagName ? target.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable)) {
            return; // Permitir menú nativo en campos de texto
        }
        e.preventDefault();
        e.stopPropagation();
        mostrarAvisoProteccion();
        return false;
    }, { capture: true, passive: false });

    // 2. Bloqueo estricto de atajos de teclado de DevTools y ver código fuente
    document.addEventListener('keydown', function(e) {
        var key = e.key ? e.key.toUpperCase() : '';
        var code = e.code || '';
        var isCtrl = e.ctrlKey || e.metaKey; // Windows/Linux Ctrl o Mac Cmd
        var isShift = e.shiftKey;

        // F12
        if (key === 'F12' || code === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            mostrarAvisoProteccion();
            return false;
        }

        // Ctrl + Shift + I (Inspector)
        // Ctrl + Shift + J (Consola)
        // Ctrl + Shift + C (Inspeccionar elemento)
        if (isCtrl && isShift && (key === 'I' || key === 'J' || key === 'C' || code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')) {
            e.preventDefault();
            e.stopPropagation();
            mostrarAvisoProteccion();
            return false;
        }

        // Ctrl + U (Ver código fuente / view-source)
        if (isCtrl && (key === 'U' || code === 'KeyU')) {
            e.preventDefault();
            e.stopPropagation();
            mostrarAvisoProteccion();
            return false;
        }

        // Ctrl + S (Guardar página)
        if (isCtrl && (key === 'S' || code === 'KeyS')) {
            var tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }, { capture: true, passive: false });

    // 3. Impedir arrastre de imágenes, vídeos y SVGs para evitar descargas o clonaciones directas
    document.addEventListener('dragstart', function(e) {
        var tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
        if (tag === 'IMG' || tag === 'VIDEO' || tag === 'SVG' || tag === 'CANVAS') {
            e.preventDefault();
            return false;
        }
    }, { capture: true, passive: false });

    // 4. Cartel disuasorio y protección de consola
    var bannerMostrado = false;
    function emitirAvisoConsola() {
        if (!bannerMostrado) {
            try {
                console.clear();
                console.log(
                    "%c🛡️ EchoScribe Security Sentinel\n%cEl código fuente, arquitectura visual y algoritmos de esta aplicación están protegidos por derechos de autor y propiedad intelectual (Copyright © 2026 EchoScribe).\n\nQueda expresamente prohibida la copia, clonación, extracción o ingeniería inversa de los componentes.",
                    "color: #6366f1; font-size: 20px; font-weight: 900; text-shadow: 0 0 10px rgba(99,102,241,0.4);",
                    "color: #94a3b8; font-size: 12px; font-weight: 500; line-height: 1.5;"
                );
                bannerMostrado = true;
            } catch (e) {}
        }
    }
    emitirAvisoConsola();

    // 5. Trampa anti-debugging si se abren las DevTools desde el menú del navegador
    // Si DevTools no está abierta, debugger; se ejecuta en <0.01ms sin impacto.
    // Si está abierta, se congela la sesión de depuración impidiendo inspeccionar scripts en vivo.
    setInterval(function() {
        var t0 = performance.now();
        debugger;
        var t1 = performance.now();
        if (t1 - t0 > 100) {
            emitirAvisoConsola();
        }
    }, 1200);

    // 6. Toast elegante de notificación de protección
    var toastTimer = null;
    function mostrarAvisoProteccion() {
        var id = 'echoscribe-security-badge-toast';
        var toast = document.getElementById(id);
        if (!toast) {
            toast = document.createElement('div');
            toast.id = id;
            toast.style.cssText = [
                'position: fixed',
                'bottom: 24px',
                'left: 50%',
                'transform: translateX(-50%) translateY(12px)',
                'z-index: 999999',
                'background: rgba(11, 15, 25, 0.95)',
                'color: #f8fafc',
                'font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                'font-size: 12px',
                'font-weight: 600',
                'padding: 10px 20px',
                'border-radius: 9999px',
                'border: 1px solid rgba(99, 102, 241, 0.45)',
                'box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.25)',
                'display: flex',
                'align-items: center',
                'gap: 8px',
                'pointer-events: none',
                'opacity: 0',
                'transition: opacity 0.22s ease, transform 0.22s ease',
                'backdrop-filter: blur(12px)',
                '-webkit-backdrop-filter: blur(12px)'
            ].join(';');
            toast.innerHTML = '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#818cf8;box-shadow:0 0 8px #6366f1;"></span><span>Contenido e interfaz protegidos contra copias · EchoScribe</span>';
            document.body.appendChild(toast);
        }
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(12px)';
            }
        }, 2200);
    }

})();
