// PWA Installation Script para Guardia Digital
let deferredPrompt;
let installButton;

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Iniciando PWA Install Script');
    
    // Crear botón de instalación
    createInstallButton();
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Escuchar evento beforeinstallprompt
    setupInstallPrompt();
});

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
}

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado:', registration);
        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
        }
    }
}

// Configurar prompt de instalación
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 Evento beforeinstallprompt disparado');
        
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
        hideInstallButton();
        
        // Mostrar mensaje de éxito
        showInstallSuccessMessage();
        
        // Analíticas (opcional)
        trackEvent('PWA', 'app_installed');
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
    if (!deferredPrompt) {
        console.log('❌ No hay prompt disponible');
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
