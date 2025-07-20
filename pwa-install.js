// Crear boton de instalacion SOLO para moviles (NO para computadoras)
function createInstallButton() {
    // NO crear boton en computadoras
    if (!isMobile) {
        console.log('💻 NO creando boton en computadora');
        return;
    }
    
    installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = '<i class="fas fa-download" style="color: #333 !important;"></i> Instalar';
    installButton.className = 'install-pwa-button';
    
    // Boton BLANCO solo para moviles
    installButton.style.cssText = 'position: fixed !important; bottom: 90px !important; left: 15px !important; background: rgba(255, 255, 255, 0.95) !important; color: #333 !important; border: 2px solid rgba(0, 0, 0, 0.2) !important; padding: 12px 18px !important; border-radius: 25px !important; font-size: 14px !important; font-weight: 600 !important; cursor: pointer !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important; z-index: 1000 !important; display: none !important; align-items: center !important; gap: 6px !important; font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif !important; transition: all 0.3s ease !important;';
    
    // Evento de clic
    installButton.addEventListener('click', installApp);
    
    // Agregar al body
    document.body.appendChild(installButton);
    
    console.log('✅ Boton de instalacion creado SOLO para movil');
}// PWA Installation Script para Guardia Digital
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
    installBanner.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #0071e3, #005bb5); color: white; padding: 15px 20px; z-index: 10000; display: none; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4); font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif; animation: slideInBanner 0.5s ease-out;" id="banner-content"><div style="display: flex; align-items: center; gap: 12px; flex: 1;"><div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><i class="fas fa-shield-alt"></i></div><div style="flex: 1;"><div style="font-weight: 600; font-size: 16px; margin-bottom: 2px;">Guardia Digital</div><div style="font-size: 13px; opacity: 0.9;">Instala nuestra app para acceso rapido</div></div></div><div style="display: flex; gap: 10px; align-items: center;"><button onclick="window.pwaInstallBanner.install()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background=\'rgba(255,255,255,0.3)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.2)\'">Instalar</button><button onclick="window.pwaInstallBanner.close()" style="background: none; border: none; color: white; padding: 8px; border-radius: 50%; cursor: pointer; font-size: 16px; opacity: 0.8; transition: all 0.3s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity=\'1\'; this.style.background=\'rgba(255,255,255,0.2)\'" onmouseout="this.style.opacity=\'0.8\'; this.style.background=\'none\'"><i class="fas fa-times"></i></button></div></div>';
    
    // Agregar animacion
    const bannerStyle = document.createElement('style');
    bannerStyle.textContent = '@keyframes slideInBanner { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes slideOutBanner { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } } .banner-slide-out { animation: slideOutBanner 0.3s ease-in forwards !important; } body.banner-visible { padding-top: 70px !important; transition: padding-top 0.3s ease; }';
    document.head.appendChild(bannerStyle);
    
    // Agregar al body
    document.body.appendChild(installBanner);
    
    console.log('✅ Banner de instalacion creado');
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
        
        // NO mostrar el boton flotante - solo el banner
    }
}

// Ocultar banner de instalacion
function hideInstallBanner() {
    if (installBanner) {
        const bannerContent = installBanner.querySelector('#banner-content');
        bannerContent.classList.add('banner-slide-out');
        
        setTimeout(() => {
            bannerContent.style.display = 'none';
            bannerContent.classList.remove('banner-slide-out');
            document.body.classList.remove('banner-visible');
        }, 300);
        
        console.log('🙈 Banner de instalacion ocultado');
    }
}

// Crear boton de instalacion
function createInstallButton() {
    installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = isMobile ? '<i class="fas fa-download"></i> Instalar' : '<i class="fas fa-download"></i> Instalar App';
    installButton.className = 'install-pwa-button';
    
    // Estilos especificos para movil
    const mobileStyles = isMobile ? 'bottom: 90px !important; left: 15px !important; padding: 12px 18px !important; font-size: 14px !important; gap: 6px !important;' : '';
    
    installButton.style.cssText = 'position: fixed; bottom: 25px; left: 25px; background: linear-gradient(135deg, #0071e3, #005bb5); color: white; border: none; padding: 12px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4); z-index: 1000; display: none; align-items: center; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif; transition: all 0.3s ease; border: 2px solid rgba(0, 113, 227, 0.3); animation: pulseInstall 2s infinite; ' + mobileStyles;
    
    // Agregar animacion
    const style = document.createElement('style');
    style.textContent = '@keyframes pulseInstall { 0% { border-color: rgba(0, 113, 227, 0.3); box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4); } 50% { border-color: rgba(0, 113, 227, 0.8); box-shadow: 0 4px 25px rgba(0, 113, 227, 0.6), 0 0 15px rgba(0, 113, 227, 0.4); } 100% { border-color: rgba(0, 113, 227, 0.3); box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4); } } .install-pwa-button:hover { transform: scale(1.05); box-shadow: 0 6px 30px rgba(0, 113, 227, 0.7); } .install-pwa-button:active { transform: scale(0.95); }';
    document.head.appendChild(style);
    
    // Evento de clic
    installButton.addEventListener('click', installApp);
    
    // Agregar al body
    document.body.appendChild(installButton);
    
    console.log('✅ Boton de instalacion creado');
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
            
            // Manejar actualizaciones
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Actualizacion de SW encontrada');
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 Nueva version disponible');
                    }
                });
            });
            
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
        // NO mostrar boton en computadoras
        
        // Analiticas (opcional)
        trackEvent('PWA', 'install_prompt_shown');
    });
    
    // Escuchar cuando la app se instala
    window.addEventListener('appinstalled', (e) => {
        console.log('🎉 PWA instalada exitosamente');
        console.log('- Event details:', e);
        hideInstallButton();
        hideInstallBanner();
        
        // Mostrar mensaje de exito
        showInstallSuccessMessage();
        
        // Analiticas (opcional)
        trackEvent('PWA', 'app_installed');
    });
    
    // Verificar si ya esta instalada al cargar
    window.addEventListener('load', () => {
        setTimeout(checkIfInstalled, 1000);
    });
    
    // NO mostrar boton en computadoras - eliminar fallback
}

// Mostrar boton de instalacion SOLO en moviles
function showInstallButton() {
    // NO mostrar boton en computadoras
    if (!isMobile) {
        console.log('💻 NO mostrando boton en computadora');
        return;
    }
    
    if (installButton) {
        installButton.style.display = 'flex';
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
    console.log('📱 Es movil:', isMobile);
    
    // Ocultar banner Y boton si estan visibles
    hideInstallBanner();
    hideInstallButton();
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        
        // Mostrar instrucciones especificas segun dispositivo
        if (isMobile) {
            showMobileInstallInstructions();
        } else {
            showDesktopInstallInstructions();
        }
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
            // Asegurar que todo se oculte cuando se instala
            hideInstallBanner();
            hideInstallButton();
        } else {
            console.log('❌ Usuario rechazo instalar la PWA');
            // Si rechazo, no mostrar mas elementos de instalacion
            hideInstallBanner();
            hideInstallButton();
        }
        
        // Analiticas
        trackEvent('PWA', 'install_button_clicked', outcome);
        
    } catch (error) {
        console.error('❌ Error durante instalacion:', error);
        
        // En caso de error, ocultar elementos
        hideInstallBanner();
        hideInstallButton();
        
        // Fallback para moviles
        if (isMobile) {
            showMobileInstallInstructions();
        }
    } finally {
        // Limpiar el prompt
        deferredPrompt = null;
        
        // Asegurar que todo este oculto
        hideInstallButton();
        hideInstallBanner();
    }
}

// Instrucciones para moviles
function showMobileInstallInstructions() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let instructions = '';
    if (isAndroid) {
        instructions = '<p><strong>En Chrome Android:</strong></p><p>1. Toca el menu (⋮) en la esquina superior derecha</p><p>2. Selecciona "Agregar a pantalla de inicio"</p><p>3. Confirma tocando "Agregar"</p>';
    } else if (isIOS) {
        instructions = '<p><strong>En Safari iOS:</strong></p><p>1. Toca el boton de compartir <i class="fas fa-share"></i></p><p>2. Selecciona "Agregar a pantalla de inicio"</p><p>3. Toca "Agregar" para confirmar</p>';
    } else {
        instructions = '<p><strong>Para instalar:</strong></p><p>1. Busca la opcion "Agregar a pantalla de inicio" en el menu de tu navegador</p><p>2. Confirma la instalacion</p>';
    }
    
    showInstallModal('📱 Instalar Guardia Digital', instructions);
}

// Instrucciones para desktop
function showDesktopInstallInstructions() {
    const instructions = '<p><strong>Para instalar en tu computadora:</strong></p><p>1. En <strong>Chrome/Edge:</strong> Busca el icono de instalacion <i class="fas fa-plus"></i> en la barra de direcciones</p><p>2. En <strong>Firefox:</strong> Menu → "Instalar"</p><p>3. O busca "Instalar Guardia Digital" en el menu del navegador (⋮)</p>';
    
    showInstallModal('💻 Instalar Guardia Digital', instructions);
}

// Modal generico de instalacion
function showInstallModal(title, content) {
    const modal = document.createElement('div');
    modal.innerHTML = '<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;" onclick="this.parentElement.remove()"><div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 400px; width: 100%; text-align: center; font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif; position: relative;" onclick="event.stopPropagation()"><h3 style="color: #0071e3; margin-bottom: 20px; font-size: 20px;">' + title + '</h3><div style="text-align: left; margin-bottom: 25px; line-height: 1.6; color: #333;">' + content + '</div><button onclick="this.closest(\'[style*=\\\"position: fixed\\\"]\').remove()" style="background: #0071e3; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s ease;" onmouseover="this.style.background=\'#005bb5\'" onmouseout="this.style.background=\'#0071e3\'">Entendido</button></div></div>';
    
    document.body.appendChild(modal);
}

// Mostrar mensaje de exito
function showInstallSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = '<div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif; font-weight: 600; animation: slideInSuccess 0.5s ease-out; max-width: 300px;"><i class="fas fa-check-circle"></i> ¡Guardia Digital instalada exitosamente!</div>';
    
    // Agregar animacion
    const successStyle = document.createElement('style');
    successStyle.textContent = '@keyframes slideInSuccess { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(successStyle);
    
    document.body.appendChild(successMsg);
    
    // Remover despues de 5 segundos
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.remove();
        }
        if (successStyle.parentNode) {
            successStyle.remove();
        }
    }, 5000);
}

// Funcion de analiticas (opcional)
function trackEvent(category, action, label) {
    label = label || '';
    console.log('📊 Evento: ' + category + ' - ' + action + ' - ' + label);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
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

// Exportar funciones para debug y control del banner
window.pwaInstall = {
    show: showInstallButton,
    hide: hideInstallButton,
    install: installApp,
    checkInstalled: checkIfInstalled,
    debug: debugPWAStatus,
    forceShow: function() {
        console.log('🧪 Forzando mostrar boton para testing');
        showInstallButton();
    }
};

// Funciones especificas del banner
window.pwaInstallBanner = {
    show: showInstallBanner,
    hide: hideInstallBanner,
    install: installApp,
    close: hideInstallBanner,
    debugColors: debugBannerColors
};
