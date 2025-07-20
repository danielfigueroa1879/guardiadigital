// PWA Installation Script para Guardia Digital
let deferredPrompt;
let installButton;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Iniciando PWA Install Script');
    console.log('📱 Es dispositivo móvil:', isMobile);
    
    // Debugging: verificar estado actual
    debugPWAStatus();
    
    // Crear botón de instalación
    createInstallButton();
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Escuchar evento beforeinstallprompt
    setupInstallPrompt();
    
    // Para móviles, mostrar el botón después de un tiempo
    if (isMobile) {
        setTimeout(() => {
            if (!checkIfInstalled()) {
                console.log('📱 Mostrando botón de instalación en móvil');
                showInstallButton();
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
    console.log('- Es dispositivo móvil:', isMobile);
    
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
    installButton.innerHTML = isMobile ? 
        '<i class="fas fa-download"></i> Instalar' : 
        '<i class="fas fa-download"></i> Instalar App';
    installButton.className = 'install-pwa-button';
    
    // Estilos específicos para móvil
    const mobileStyles = isMobile ? `
        bottom: 90px !important;
        left: 15px !important;
        padding: 12px 18px !important;
        font-size: 14px !important;
        gap: 6px !important;
    ` : '';
    
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
        ${mobileStyles}
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
        
        .install-pwa-button:active {
            transform: scale(0.95);
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
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
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
    
    // Verificar si ya está instalada al cargar
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
    console.log('📱 Es móvil:', isMobile);
    
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
        
        // Mostrar instrucciones específicas según dispositivo
        if (isMobile) {
            showMobileInstallInstructions();
        } else {
            showDesktopInstallInstructions();
        }
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
        
        // Fallback para móviles
        if (isMobile) {
            showMobileInstallInstructions();
        }
    } finally {
        // Limpiar el prompt
        deferredPrompt = null;
        
        // Ocultar el botón
        hideInstallButton();
    }
}

// Instrucciones para móviles
function showMobileInstallInstructions() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let instructions = '';
    if (isAndroid) {
        instructions = `
            <p><strong>En Chrome Android:</strong></p>
            <p>1. Toca el menú (⋮) en la esquina superior derecha</p>
            <p>2. Selecciona "Agregar a pantalla de inicio"</p>
            <p>3. Confirma tocando "Agregar"</p>
        `;
    } else if (isIOS) {
        instructions = `
            <p><strong>En Safari iOS:</strong></p>
            <p>1. Toca el botón de compartir <i class="fas fa-share"></i></p>
            <p>2. Selecciona "Agregar a pantalla de inicio"</p>
            <p>3. Toca "Agregar" para confirmar</p>
        `;
    } else {
        instructions = `
            <p><strong>Para instalar:</strong></p>
            <p>1. Busca la opción "Agregar a pantalla de inicio" en el menú de tu navegador</p>
            <p>2. Confirma la instalación</p>
        `;
    }
    
    showInstallModal('📱 Instalar Guardia Digital', instructions);
}

// Instrucciones para desktop
function showDesktopInstallInstructions() {
    const instructions = `
        <p><strong>Para instalar en tu computadora:</strong></p>
        <p>1. En <strong>Chrome/Edge:</strong> Busca el ícono de instalación <i class="fas fa-plus"></i> en la barra de direcciones</p>
        <p>2. En <strong>Firefox:</strong> Menú → "Instalar"</p>
        <p>3. O busca "Instalar Guardia Digital" en el menú del navegador (⋮)</p>
    `;
    
    showInstallModal('💻 Instalar Guardia Digital', instructions);
}

// Modal genérico de instalación
function showInstallModal(title, content) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        " onclick="this.parentElement.remove()">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 100%;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                position: relative;
            " onclick="event.stopPropagation()">
                <h3 style="color: #0071e3; margin-bottom: 20px; font-size: 20px;">
                    ${title}
                </h3>
                <div style="text-align: left; margin-bottom: 25px; line-height: 1.6; color: #333;">
                    ${content}
                </div>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                    background: #0071e3;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#005bb5'" onmouseout="this.style.background='#0071e3'">
                    Entendido
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
            max-width: 300px;
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
        if (successMsg.parentNode) {
            successMsg.remove();
        }
        if (successStyle.parentNode) {
            successStyle.remove();
        }
    }, 5000);
}

// Función de analíticas (opcional)
function trackEvent(category, action, label = '') {
    console.log(`📊 Evento: ${category} - ${action} - ${label}`);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Detectar si ya está instalada
function checkIfInstalled() {
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
    forceShow: function() {
        console.log('🧪 Forzando mostrar botón para testing');
        showInstallButton();
    }
};¿Cómo instalar?
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
    forceShow: function() {
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
