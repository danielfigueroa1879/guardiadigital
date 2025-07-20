// PWA Installation Script LIMPIO para Guardia Digital
let deferredPrompt;
let installBanner;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 PWA Script LIMPIO iniciado');
    console.log('📱 Es dispositivo movil:', isMobile);
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Configurar instalacion
    setupInstallation();
    
    // Solo en moviles: mostrar banner despues de 3 segundos
    if (isMobile) {
        setTimeout(() => {
            if (!isAppInstalled()) {
                console.log('📱 Mostrando banner en movil');
                showBanner();
            }
        }, 3000);
    }
});

// Registrar Service Worker
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

// Configurar instalacion
function setupInstallation() {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 beforeinstallprompt detectado');
        e.preventDefault();
        deferredPrompt = e;
        
        // Solo en moviles mostrar banner
        if (isMobile) {
            setTimeout(() => showBanner(), 1000);
        }
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('🎉 App instalada exitosamente');
        hideBanner();
    });
}

// Crear y mostrar banner BLANCO
function showBanner() {
    // Si ya existe, no crear otro
    if (document.getElementById('install-banner-clean')) return;
    
    // Crear banner
    const banner = document.createElement('div');
    banner.id = 'install-banner-clean';
    banner.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); padding: 15px 20px; z-index: 10000; display: flex; align-items: center; justify-content: space-between; font-family: Arial, sans-serif; color: #333; border-bottom: 1px solid #ddd; backdrop-filter: blur(10px);';
    
    // Texto
    const text = document.createElement('div');
    text.textContent = 'Guardia Digital - Instala nuestra app para acceso rápido';
    text.style.cssText = 'flex: 1; font-size: 14px; color: #333;';
    
    // Contenedor botones
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 10px;';
    
    // Boton instalar
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Instalar';
    installBtn.style.cssText = 'background: rgba(255,255,255,0.9); border: 1px solid #ccc; color: #333; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px;';
    installBtn.onclick = () => installApp();
    
    // Boton cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background: rgba(255,255,255,0.8); border: 1px solid #ccc; color: #666; padding: 8px 12px; border-radius: 50%; cursor: pointer; font-size: 14px;';
    closeBtn.onclick = () => hideBanner();
    
    // Ensamblar
    buttons.appendChild(installBtn);
    buttons.appendChild(closeBtn);
    banner.appendChild(text);
    banner.appendChild(buttons);
    document.body.appendChild(banner);
    
    console.log('✅ Banner blanco mostrado');
    
    // Auto-ocultar en 8 segundos
    setTimeout(() => hideBanner(), 8000);
}

// Ocultar banner
function hideBanner() {
    const banner = document.getElementById('install-banner-clean');
    if (banner) {
        banner.remove();
        console.log('🙈 Banner ocultado');
    }
}

// Instalar app
async function installApp() {
    console.log('🚀 Iniciando instalacion...');
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        alert('Para instalar: ve al menú de tu navegador y busca "Instalar" o "Agregar a pantalla de inicio"');
        hideBanner();
        return;
    }
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('👤 Usuario eligió:', outcome);
        
        if (outcome === 'accepted') {
            console.log('✅ Instalación aceptada');
        } else {
            console.log('❌ Instalación rechazada');
        }
        
    } catch (error) {
        console.error('❌ Error en instalación:', error);
    } finally {
        deferredPrompt = null;
        hideBanner();
    }
}

// Verificar si app esta instalada
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
}

// Funciones globales para testing
window.pwaClean = {
    showBanner: showBanner,
    hideBanner: hideBanner,
    install: installApp,
    isInstalled: isAppInstalled
};
