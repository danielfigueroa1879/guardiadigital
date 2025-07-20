// PWA Installation Script para Guardia Digital
let deferredPrompt;
let installButton;
let installBanner;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Esperar a que el DOM este listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Iniciando PWA Install Script');
    console.log('📱 Es dispositivo movil:', isMobile);
    
    // Debugging: verificar estado actual
    debugPWAStatus();
    
    // Crear boton de instalacion
    createInstallButton();
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Escuchar evento beforeinstallprompt
    setupInstallPrompt();
    
    // Para moviles, mostrar banner despues de un tiempo
    if (isMobile) {
        setTimeout(() => {
            if (!checkIfInstalled()) {
                console.log('📱 Mostrando banner de instalacion en movil');
                showInstallBanner();
            }
        }, 3000);
    }
});

// Debug PWA Status
function debugPWAStatus() {
    console.log('🔍 Debugging PWA Status:');
    console.log('- URL actual:', window.location.href);
    console.log('- Es HTTPS:', window.location.protocol === 'https:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Service Worker soportado:', 'serviceWorker' in navigator);
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    console.log('- Es dispositivo movil:', isMobile);
    
    // Verificar manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('- Manifest encontrado:', !!manifestLink);
    if (manifestLink) {
        console.log('- Manifest URL:', manifestLink.href);
    }
}

// Crear banner de instalacion para moviles
function createInstallBanner() {
    installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    
    // Banner completamente blanco sin iconos ni colores
    const bannerContent = document.createElement('div');
    bannerContent.id = 'banner-content';
    bannerContent.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: white; color: black; padding: 15px 20px; z-index: 10000; display: none; align-items: center; justify-content: space-between; font-family: Arial, sans-serif; border: 2px solid red;';
    
    // Solo texto sin iconos
    const textOnly = document.createElement('div');
    textOnly.style.cssText = 'background: white; color: black; font-size: 16px;';
    textOnly.textContent = 'Guardia Digital - Instala nuestra app';
    
    // Boton simple sin estilos complejos
    const simpleBtn = document.createElement('button');
    simpleBtn.style.cssText = 'background: white; color: black; border: 2px solid black; padding: 10px; cursor: pointer;';
    simpleBtn.textContent = 'INSTALAR';
    simpleBtn.onclick = function() { 
        installApp();
    };
    
    // Boton cerrar
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background: white; color: black; border: 2px solid black; padding: 5px 10px; cursor: pointer; margin-left: 10px;';
    closeBtn.textContent = 'X';
    closeBtn.onclick = function() { 
        hideInstallBanner();
    };
    
    bannerContent.appendChild(textOnly);
    bannerContent.appendChild(simpleBtn);
    bannerContent.appendChild(closeBtn);
    installBanner.appendChild(bannerContent);
    
    // Agregar al body
    document.body.appendChild(installBanner);
    
    console.log('✅ Banner BASICO blanco creado para testing');
}

// Mostrar banner de instalacion
function showInstallBanner() {
    if (!installBanner) {
        createInstallBanner();
    }
    
    if (installBanner) {
        const bannerContent = installBanner.querySelector('#banner-content');
        bannerContent.style.display = 'flex';
        document.body.classList.add('banner-visible');
        
        console.log('🎉 Banner de instalacion mostrado');
        
        // Auto-ocultar despues de 8 segundos
        setTimeout(() => {
            hideInstallBanner();
        }, 8000);
    }
}

// Ocultar banner de instalacion
function hideInstallBanner() {
    if (installBanner) {
        const bannerContent = installBanner.querySelector('#banner-content');
        bannerContent.style.display = 'none';
        document.body.classList.remove('banner-visible');
        
        console.log('🙈 Banner de instalacion ocultado');
    }
}

// Crear boton de instalacion SOLO para moviles
function createInstallButton() {
    // NO crear boton en computadoras
    if (!isMobile) {
        console.log('💻 NO creando boton en computadora');
        return;
    }
    
    installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = 'Instalar';
    installButton.className = 'install-pwa-button';
    
    // Boton BLANCO solo para moviles
    installButton.style.cssText = 'position: fixed; bottom: 90px; left: 15px; background: white; color: black; border: 2px solid black; padding: 12px 18px; border-radius: 25px; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 1000; display: none;';
    
    // Evento de clic
    installButton.addEventListener('click', installApp);
    
    // Agregar al body
    document.body.appendChild(installButton);
    
    console.log('✅ Boton de instalacion creado SOLO para movil');
}

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker registrado:', registration);
            console.log('- Scope:', registration.scope);
            console.log('- Estado:', registration.installing ? 'installing' : registration.waiting ? 'waiting' : 'active');
            
        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
        }
    } else {
        console.warn('⚠️ Service Worker no soportado');
    }
}

// Configurar prompt de instalacion
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 Evento beforeinstallprompt disparado');
        console.log('- Event details:', e);
        
        // Prevenir que el navegador muestre su propio prompt
        e.preventDefault();
        
        // Guardar el evento para usarlo despues
        deferredPrompt = e;
        
        // SOLO en moviles mostrar banner, en computadoras NO mostrar nada
        if (isMobile) {
            setTimeout(() => showInstallBanner(), 1000);
        }
        
        // Analiticas
        trackEvent('PWA', 'install_prompt_shown');
    });
    
    // Escuchar cuando la app se instala
    window.addEventListener('appinstalled', (e) => {
        console.log('🎉 PWA instalada exitosamente');
        hideInstallButton();
        hideInstallBanner();
        
        // Mostrar mensaje de exito
        showInstallSuccessMessage();
        
        // Analiticas
        trackEvent('PWA', 'app_installed');
    });
    
    // Verificar si ya esta instalada al cargar
    window.addEventListener('load', () => {
        setTimeout(checkIfInstalled, 1000);
    });
}

// Mostrar boton de instalacion SOLO en moviles
function showInstallButton() {
    // NO mostrar boton en computadoras
    if (!isMobile) {
        console.log('💻 NO mostrando boton en computadora');
        return;
    }
    
    if (installButton) {
        installButton.style.display = 'block';
        console.log('👀 Boton de instalacion mostrado en movil');
    }
}

// Ocultar boton de instalacion
function hideInstallButton() {
    if (installButton) {
        installButton.style.display = 'none';
        console.log('🙈 Boton de instalacion ocultado');
    }
}

// Funcion para instalar la app
async function installApp() {
    console.log('🚀 Intentando instalar PWA...');
    
    // Ocultar banner Y boton si estan visibles
    hideInstallBanner();
    hideInstallButton();
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        alert('Para instalar: usa el menu de tu navegador y busca "Instalar" o "Agregar a pantalla de inicio"');
        return;
    }
    
    try {
        // Mostrar el prompt de instalacion
        console.log('📱 Mostrando prompt de instalacion');
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('👤 Usuario eligio: ' + outcome);
        
        if (outcome === 'accepted') {
            console.log('✅ Usuario acepto instalar la PWA');
        } else {
            console.log('❌ Usuario rechazo instalar la PWA');
        }
        
        // Analiticas
        trackEvent('PWA', 'install_button_clicked', outcome);
        
    } catch (error) {
        console.error('❌ Error durante instalacion:', error);
    } finally {
        // Limpiar el prompt
        deferredPrompt = null;
        
        // Asegurar que todo este oculto
        hideInstallButton();
        hideInstallBanner();
    }
}

// Mostrar mensaje de exito
function showInstallSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = '<div style="position: fixed; top: 20px; right: 20px; background: green; color: white; padding: 15px 20px; border-radius: 10px; z-index: 10000;">¡Guardia Digital instalada exitosamente!</div>';
    
    document.body.appendChild(successMsg);
    
    // Remover despues de 5 segundos
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.remove();
        }
    }, 5000);
}

// Funcion de analiticas
function trackEvent(category, action, label) {
    label = label || '';
    console.log('📊 Evento: ' + category + ' - ' + action + ' - ' + label);
}

// Detectar si ya esta instalada
function checkIfInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
    
    console.log('🔍 Verificando instalacion:');
    console.log('- Display mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('- Navigator standalone:', window.navigator.standalone);
    console.log('- Referrer:', document.referrer);
    console.log('- Es PWA instalada:', isStandalone);
    
    if (isStandalone) {
        console.log('📱 App ya esta instalada');
        hideInstallButton();
        hideInstallBanner();
        return true;
    }
    return false;
}

// Exportar funciones para debug y control
window.pwaInstall = {
    show: showInstallButton,
    hide: hideInstallButton,
    install: installApp,
    checkInstalled: checkIfInstalled,
    debug: debugPWAStatus,
    forceShow: function() {
        console.log('🧪 Forzando mostrar boton para testing');
        if (isMobile) {
            showInstallButton();
        } else {
            console.log('💻 No se puede mostrar boton en computadora');
        }
    }
};

// Funciones especificas del banner
window.pwaInstallBanner = {
    show: showInstallBanner,
    hide: hideInstallBanner,
    install: installApp,
    close: hideInstallBanner,
    debugColors: function() {
        console.log('🔍 Debug de colores - Banner basico solo usa blanco y negro');
        const banner = document.querySelector('#banner-content');
        if (banner) {
            console.log('✅ Banner encontrado - debe ser blanco con borde rojo');
        } else {
            console.log('❌ Banner no encontrado');
        }
    }
};
