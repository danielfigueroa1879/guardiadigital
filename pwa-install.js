// PWA Installation Script para Guardia Digital
let deferredPrompt;
let installButton;

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Iniciando PWA Install Script');
    
    // Debugging: verificar estado actual
    debugPWAStatus();
    
    // Crear botón de instalación
    createInstallButton();
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Escuchar evento beforeinstallprompt
    setupInstallPrompt();
});

// Debug PWA Status
function debugPWAStatus() {
    console.log('🔍 Debugging PWA Status:');
    console.log('- URL actual:', window.location.href);
    console.log('- Es HTTPS:', window.location.protocol === 'https:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Service Worker soportado:', 'serviceWorker' in navigator);
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    
    // Verificar manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('- Manifest encontrado:', !!manifestLink);
    if (manifestLink) {
        console.log('- Manifest URL:', manifestLink.href);
    }
}

// Crear botón de instalación
function createInstallButton() {
    installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installButton.className = 'install-pwa-button';
    installButton.style.cssText = `
        position: fixed;
        bottom: 25px;
        left: 25px;
        background: linear-gradient(135deg, #0071e3, #005bb5);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4);
        z-index: 1000;
        display: none;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        transition: all 0.3s ease;
        border: 2px solid rgba(0, 113, 227, 0.3);
        animation: pulseInstall 2s infinite;
    `;
    
    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulseInstall {
            0% {
                border-color: rgba(0, 113, 227, 0.3);
                box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4);
            }
            50% {
                border-color: rgba(0, 113, 227, 0.8);
                box-shadow: 0 4px 25px rgba(0, 113, 227, 0.6), 0 0 15px rgba(0, 113, 227, 0.4);
            }
            100% {
                border-color: rgba(0, 113, 227, 0.3);
                box-shadow: 0 4px 20px rgba(0, 113, 227, 0.4);
            }
        }
        
        .install-pwa-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(0, 113, 227, 0.7);
        }
        
        @media (max-width: 768px) {
            .install-pwa-button {
                bottom: 90px !important;
                left: 15px !important;
                padding: 10px 16px !important;
                font-size: 13px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Evento de clic
    installButton.addEventListener('click', installApp);
    
    // Agregar al body
    document.body.appendChild(installButton);
    
    console.log('✅ Botón de instalación creado');
}

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // Registrar con scope específico
            const registration = await navigator.serviceWorker.register('./sw.js', {
                scope: './'
            });
            
            console.log('✅ Service Worker registrado:', registration);
            console.log('- Scope:', registration.scope);
            console.log('- Estado:', registration.installing ? 'installing' : registration.waiting ? 'waiting' : 'active');
            
            // Manejar actualizaciones
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Actualización de SW encontrada');
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 Nueva versión disponible');
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

// Configurar prompt de instalación
function setupInstallPrompt() {
    // Mostrar botón temporalmente para testing (en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            console.log('🧪 Modo desarrollo: mostrando botón de instalación');
            showInstallButton();
        }, 2000);
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 Evento beforeinstallprompt disparado');
        console.log('- Event details:', e);
        
        // Prevenir que el navegador muestre su propio prompt
        e.preventDefault();
        
        // Guardar el evento para usarlo después
        deferredPrompt = e;
        
        // Mostrar nuestro botón de instalación
        showInstallButton();
        
        // Analíticas (opcional)
        trackEvent('PWA', 'install_prompt_shown');
    });
    
    // Escuchar cuando la app se instala
    window.addEventListener('appinstalled', (e) => {
        console.log('🎉 PWA instalada exitosamente');
        console.log('- Event details:', e);
        hideInstallButton();
        
        // Mostrar mensaje de éxito
        showInstallSuccessMessage();
        
        // Analíticas (opcional)
        trackEvent('PWA', 'app_installed');
    });
    
    // Verificar si ya está instalada
    window.addEventListener('load', () => {
        setTimeout(checkIfInstalled, 1000);
    });
}

// Mostrar botón de instalación
function showInstallButton() {
    if (installButton) {
        installButton.style.display = 'flex';
        console.log('👀 Botón de instalación mostrado');
    }
}

// Ocultar botón de instalación
function hideInstallButton() {
    if (installButton) {
        installButton.style.display = 'none';
        console.log('🙈 Botón de instalación ocultado');
    }
}

// Función para instalar la app
async function installApp() {
    console.log('🚀 Intentando instalar PWA...');
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        
        // Mostrar instrucciones manuales
        showManualInstallInstructions();
        return;
    }
    
    try {
        // Mostrar el prompt de instalación
        console.log('📱 Mostrando prompt de instalación');
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`👤 Usuario eligió: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ Usuario aceptó instalar la PWA');
        } else {
            console.log('❌ Usuario rechazó instalar la PWA');
        }
        
        // Analíticas
        trackEvent('PWA', 'install_button_clicked', outcome);
        
    } catch (error) {
        console.error('❌ Error durante instalación:', error);
    } finally {
        // Limpiar el prompt
        deferredPrompt = null;
        
        // Ocultar el botón
        hideInstallButton();
    }
}

// Mostrar instrucciones manuales
function showManualInstallInstructions() {
    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        ">
            <h3 style="color: #0071e3; margin-bottom: 15px;">
                <i class="fas fa-mobile-alt"></i> ¿Cómo instalar?
            </h3>
            <p style="margin-bottom: 20px; color: #333; line-height: 1.5;">
                Para instalar Guardia Digital en tu dispositivo:
            </p>
            <div style="text-align: left; margin-bottom: 20px;">
                <p style="margin: 10px 0;"><strong>Chrome/Edge:</strong> Menú (⋮) → "Instalar Guardia Digital"</p>
                <p style="margin: 10px 0;"><strong>Safari iOS:</strong> Compartir → "Agregar a inicio"</p>
                <p style="margin: 10px 0;"><strong>Firefox:</strong> Menú → "Instalar"</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #0071e3;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Entendido</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        " onclick="this.parentElement.remove()"></div>
    `;
    
    document.body.appendChild(instructions);
}

// Mostrar mensaje de éxito
function showInstallSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            font-weight: 600;
            animation: slideInSuccess 0.5s ease-out;
        ">
            <i class="fas fa-check-circle"></i>
            ¡Guardia Digital instalada exitosamente!
        </div>
    `;
    
    // Agregar animación
    const successStyle = document.createElement('style');
    successStyle.textContent = `
        @keyframes slideInSuccess {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(successStyle);
    
    document.body.appendChild(successMsg);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        successMsg.remove();
        successStyle.remove();
    }, 5000);
}

// Función de analíticas (opcional)
function trackEvent(category, action, label = '') {
    // Puedes integrar con Google Analytics o cualquier otra herramienta
    console.log(`📊 Evento: ${category} - ${action} - ${label}`);
    
    // Ejemplo para Google Analytics (si lo tienes configurado)
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Detectar si ya está instalada
function checkIfInstalled() {
    // Verificar si se ejecuta como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
    
    console.log('🔍 Verificando instalación:');
    console.log('- Display mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('- Navigator standalone:', window.navigator.standalone);
    console.log('- Referrer:', document.referrer);
    console.log('- Es PWA instalada:', isStandalone);
    
    if (isStandalone) {
        console.log('📱 App ya está instalada');
        hideInstallButton();
        return true;
    }
    return false;
}

// Exportar funciones para debug
window.pwaInstall = {
    show: showInstallButton,
    hide: hideInstallButton,
    install: installApp,
    checkInstalled: checkIfInstalled,
    debug: debugPWAStatus,
    forceShow: () => {
        console.log('🧪 Forzando mostrar botón para testing');
        showInstallButton();
    }
};.log('❌ No hay prompt disponible');
        return;
    }
    
    // Mostrar el prompt de instalación
    deferredPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 Usuario eligió: ${outcome}`);
    
    if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
    } else {
        console.log('❌ Usuario rechazó instalar la PWA');
    }
    
    // Limpiar el prompt
    deferredPrompt = null;
    
    // Ocultar el botón
    hideInstallButton();
    
    // Analíticas
    trackEvent('PWA', 'install_button_clicked', outcome);
}

// Mostrar mensaje de éxito
function showInstallSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            font-weight: 600;
            animation: slideInSuccess 0.5s ease-out;
        ">
            <i class="fas fa-check-circle"></i>
            ¡Guardia Digital instalada exitosamente!
        </div>
    `;
    
    // Agregar animación
    const successStyle = document.createElement('style');
    successStyle.textContent = `
        @keyframes slideInSuccess {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(successStyle);
    
    document.body.appendChild(successMsg);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        successMsg.remove();
        successStyle.remove();
    }, 5000);
}

// Función de analíticas (opcional)
function trackEvent(category, action, label = '') {
    // Puedes integrar con Google Analytics o cualquier otra herramienta
    console.log(`📊 Evento: ${category} - ${action} - ${label}`);
    
    // Ejemplo para Google Analytics (si lo tienes configurado)
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Detectar si ya está instalada
function checkIfInstalled() {
    // Verificar si se ejecuta como PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone || 
        document.referrer.includes('android-app://')) {
        console.log('📱 App ya está instalada');
        hideInstallButton();
        return true;
    }
    return false;
}

// Verificar al cargar
document.addEventListener('DOMContentLoaded', checkIfInstalled);

// Exportar funciones para debug
window.pwaInstall = {
    show: showInstallButton,
    hide: hideInstallButton,
    install: installApp,
    checkInstalled: checkIfInstalled
};
