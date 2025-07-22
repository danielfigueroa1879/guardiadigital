// PWA Installation Script - Solución Definitiva
let deferredPrompt;
const PWA_INSTALLED_KEY = 'pwaInstalled'; // Clave para localStorage

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Función para verificar si la app ya está instalada (con diagnóstico y localStorage)
function isAppInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = window.navigator.standalone === true;
    const isLocalStorageFlagged = localStorage.getItem(PWA_INSTALLED_KEY) === 'true';

    // Log de diagnóstico para depuración
    console.log('🔍 Verificando estado de instalación:');
    console.log(`- Modo Standalone (Android): ${isStandalone}`);
    console.log(`- Navigator Standalone (iOS): ${isNavigatorStandalone}`);
    console.log(`- Flag en localStorage: ${isLocalStorageFlagged}`);
    
    const result = isStandalone || isNavigatorStandalone || isLocalStorageFlagged;
    console.log(`- Resultado final: ${result ? 'Instalada' : 'No instalada'}`);
    
    return result;
}

// Función para inyectar los estilos de la animación
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDownAndFadeIn {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function() {
    if (isAppInstalled()) {
        console.log('✅ La PWA ya está instalada. No se mostrará el botón.');
        return;
    }
    
    console.log('🔧 PWA Script iniciado (la app no está instalada).');
    addAnimationStyles();
    registerServiceWorker();
    setupInstallation();
    
    if (isMobile) {
        setTimeout(() => {
            if (deferredPrompt) { // Solo mostrar si el prompt está disponible
                 console.log('📱 Mostrando botón de instalación en movil');
                 showInstallButton();
            }
        }, 3000);
    }
});

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado.');
        } catch (error) {
            console.error('❌ Error Service Worker:', error);
        }
    }
}

function setupInstallation() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        if (isAppInstalled()) {
            console.log('🚫 Evento beforeinstallprompt ignorado porque la app ya está instalada.');
            return;
        }
        console.log('🎯 Evento beforeinstallprompt detectado y guardado.');
        deferredPrompt = e;
        
        // Muestra el botón inmediatamente si el evento se dispara y estamos en móvil
        if (isMobile) {
            showInstallButton();
        }
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('🎉 App instalada exitosamente. Guardando estado.');
        // CAMBIO CLAVE: Guardar el estado de instalación de forma permanente
        localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        hideInstallButton();
    });
}

function showInstallButton() {
    if (document.getElementById('install-button-pwa')) return;
    
    const promptButton = document.createElement('div');
    promptButton.id = 'install-button-pwa';
    
    promptButton.style.cssText = `
        position: fixed; top: 90px; left: 50%;
        transform: translateX(-50%); width: 320px; max-width: 90%;
        background: rgba(255, 255, 255, 0.85) !important; color: #333;
        padding: 16px 20px; border-radius: 16px; z-index: 10000;
        display: flex; align-items: center; justify-content: space-between; 
        font-family: Arial, sans-serif; border: 1px solid rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        animation: slideDownAndFadeIn 0.5s ease-out forwards; box-sizing: border-box;
    `;
    
    const text = document.createElement('span');
    text.textContent = 'Instalar App';
    text.style.cssText = 'font-size: 14px; font-weight: bold; color: #333;';
    
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const installBtn = document.createElement('button');
    installBtn.textContent = 'Instalar';
    installBtn.style.cssText = `
        background: #0071e3 !important; color: white !important; border: none;
        padding: 8px 16px; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-weight: bold; flex-shrink: 0;
    `;
    installBtn.onclick = (e) => { e.stopPropagation(); installApp(); };

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.style.cssText = `
        background: transparent !important; border: none !important; color: #999 !important;
        font-size: 16px; cursor: pointer; padding: 5px; flex-shrink: 0;
    `;
    closeBtn.onclick = (e) => { e.stopPropagation(); hideInstallButton(); };
    
    actionButtons.appendChild(installBtn);
    actionButtons.appendChild(closeBtn);
    promptButton.appendChild(text);
    promptButton.appendChild(actionButtons);
    document.body.appendChild(promptButton);
    
    console.log('✅ Botón de instalación flotante mostrado');
    setTimeout(() => hideInstallButton(), 12000);
}

function hideInstallButton() {
    const promptButton = document.getElementById('install-button-pwa');
    if (promptButton) {
        promptButton.remove();
        console.log('🙈 Botón de instalación ocultado');
    }
}

async function installApp() {
    hideInstallButton();
    if (!deferredPrompt) return;
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 Elección del usuario: ${outcome}`);
    } catch (error) {
        console.error('❌ Error en el prompt de instalación:', error);
    } finally {
        deferredPrompt = null;
    }
}
