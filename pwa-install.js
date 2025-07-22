// PWA Installation Script con nuevo diseño de botón flotante
let deferredPrompt;
let installBanner;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Función para verificar si la app ya está instalada
function isAppInstalled() {
    // Comprueba si la app se está ejecutando en modo standalone (instalada)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Comprobación adicional para iOS
    const isNavigatorStandalone = window.navigator.standalone === true;
    // Comprobación para apps de Android
    const isAndroidApp = document.referrer.includes('android-app://');
    
    return isStandalone || isNavigatorStandalone || isAndroidApp;
}

// Función para inyectar los estilos de la animación
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDownAndFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function() {
    // CAMBIO CLAVE: Primero, verificar si la app ya está instalada.
    if (isAppInstalled()) {
        console.log('✅ La PWA ya está instalada. No se mostrará el botón de instalación.');
        return; // Detiene la ejecución del script si la app ya está instalada.
    }
    
    console.log('🔧 PWA Script con botón flotante iniciado (la app no está instalada).');
    console.log('📱 Es dispositivo movil:', isMobile);
    
    addAnimationStyles();
    registerServiceWorker();
    setupInstallation();
    
    if (isMobile) {
        setTimeout(() => {
            // La comprobación aquí es una segunda seguridad, pero la principal está arriba.
            if (!isAppInstalled()) {
                console.log('📱 Mostrando botón de instalación en movil');
                showInstallButton();
            }
        }, 3000);
    }
});

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado correctamente');
        } catch (error) {
            console.error('❌ Error Service Worker:', error);
        }
    }
}

function setupInstallation() {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 beforeinstallprompt detectado');
        e.preventDefault();
        deferredPrompt = e;
        
        if (isMobile) {
            setTimeout(() => showInstallButton(), 1000);
        }
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('🎉 App instalada exitosamente');
        hideInstallButton();
    });
}

// NUEVA FUNCIÓN: Crear y mostrar el botón de instalación flotante
function showInstallButton() {
    if (document.getElementById('install-button-pwa')) return;
    
    const promptButton = document.createElement('div');
    promptButton.id = 'install-button-pwa';
    
    // Estilos para el botón flotante
    promptButton.style.cssText = `
        position: fixed;
        top: 90px; /* Distancia desde arriba, debajo de tu header */
        left: 50%;
        transform: translateX(-50%);
        width: 320px; 
        max-width: 90%; /* Límite para pantallas muy pequeñas */
        background: rgba(255, 255, 255, 0.85) !important;
        color: #333;
        padding: 16px 20px;
        border-radius: 16px;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between; 
        font-family: Arial, sans-serif;
        border: 1px solid rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        animation: slideDownAndFadeIn 0.5s ease-out forwards;
        box-sizing: border-box;
    `;
    
    // Texto del botón
    const text = document.createElement('span');
    text.textContent = 'Instalar App';
    text.style.cssText = 'font-size: 14px; font-weight: bold; color: #333;';
    
    // Contenedor para los botones de acción para mantenerlos juntos
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    // Botón de instalar (ahora el principal)
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Instalar';
    installBtn.style.cssText = `
        background: #0071e3 !important;
        color: white !important;
        border: none;
        padding: 8px 16px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
        flex-shrink: 0;
    `;
    installBtn.onclick = (e) => {
        e.stopPropagation();
        installApp();
    };

    // Botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.style.cssText = `
        background: transparent !important;
        border: none !important;
        color: #999 !important;
        font-size: 16px;
        cursor: pointer;
        padding: 5px;
        flex-shrink: 0;
    `;
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        hideInstallButton();
    };
    
    // Ensamblar el botón
    actionButtons.appendChild(installBtn);
    actionButtons.appendChild(closeBtn);

    promptButton.appendChild(text);
    promptButton.appendChild(actionButtons);
    document.body.appendChild(promptButton);
    
    console.log('✅ Botón de instalación flotante mostrado');
    
    // Ocultar automáticamente después de 12 segundos
    setTimeout(() => hideInstallButton(), 12000);
}

// Ocultar el botón
function hideInstallButton() {
    const promptButton = document.getElementById('install-button-pwa');
    if (promptButton) {
        promptButton.remove();
        console.log('🙈 Botón de instalación ocultado');
    }
}

// Lógica para instalar la app
async function installApp() {
    hideInstallButton();
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        alert('Para instalar: ve al menú de tu navegador y busca "Instalar" o "Agregar a pantalla de inicio"');
        return;
    }
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ Instalación aceptada');
        } else {
            console.log('❌ Instalación rechazada');
        }
        
    } catch (error) {
        console.error('❌ Error en instalación:', error);
    } finally {
        deferredPrompt = null;
    }
}
