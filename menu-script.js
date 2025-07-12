// SOLUCIÓN SIMPLE Y FLUIDA PARA FORMULARIO MÓVIL
console.log('🔧 Iniciando solución SIMPLE para formulario móvil...');

// Variables globales simplificadas
let isFormActive = false;
let currentInput = null;
let originalHeaderStyle = {};

// FUNCIÓN 1: Detectar si es móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// FUNCIÓN 2: Guardar estilo original del header
function saveOriginalHeaderStyle() {
    const header = document.querySelector('.header');
    if (header && Object.keys(originalHeaderStyle).length === 0) {
        originalHeaderStyle = {
            position: header.style.position || 'fixed',
            top: header.style.top || '0',
            zIndex: header.style.zIndex || '1000',
            transform: header.style.transform || 'translateY(0)'
        };
    }
}

// FUNCIÓN 3: Ocultar header suavemente
function hideHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    console.log('📱 Ocultando header suavemente');
    
    header.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    header.style.transform = 'translateY(-100%)';
    header.style.opacity = '0.3';
    
    // Reducir padding del body
    document.body.style.transition = 'padding-top 0.3s ease';
    document.body.style.paddingTop = '0';
}

// FUNCIÓN 4: Mostrar header suavemente
function showHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    console.log('📱 Mostrando header suavemente');
    
    header.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    header.style.transform = originalHeaderStyle.transform;
    header.style.opacity = '1';
    
    // Restaurar padding del body
    document.body.style.transition = 'padding-top 0.3s ease';
    document.body.style.paddingTop = '';
}

// FUNCIÓN 5: Scroll suave al input
function scrollToInput(input) {
    if (!input) return;
    
    // Esperar un poco para que el teclado se abra
    setTimeout(() => {
        const rect = input.getBoundingClientRect();
        const scrollY = window.pageYOffset;
        const targetY = scrollY + rect.top - 20; // 20px desde arriba
        
        window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
        });
    }, 150);
}

// FUNCIÓN 6: Manejar focus de input
function handleInputFocus(event) {
    if (!isMobile()) return;
    
    const input = event.target;
    console.log('📝 Input enfocado');
    
    isFormActive = true;
    currentInput = input;
    
    // Guardar estilo original si no se ha hecho
    saveOriginalHeaderStyle();
    
    // Ocultar header y hacer scroll
    hideHeader();
    scrollToInput(input);
    
    // Mejorar visibilidad del input
    input.style.transition = 'all 0.3s ease';
    input.style.borderColor = '#E0FD2C';
    input.style.backgroundColor = 'rgba(255,255,255,0.15)';
    input.style.boxShadow = '0 0 10px rgba(224, 253, 44, 0.3)';
}

// FUNCIÓN 7: Manejar blur de input
function handleInputBlur(event) {
    if (!isMobile()) return;
    
    console.log('📝 Input desenfocado');
    
    const input = event.target;
    
    // Limpiar estilos del input
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    input.style.boxShadow = '';
    
    // Verificar si hay otros inputs activos
    setTimeout(() => {
        const activeInput = document.querySelector('input:focus, textarea:focus');
        
        if (!activeInput) {
            console.log('📝 No hay inputs activos - mostrando header');
            isFormActive = false;
            currentInput = null;
            showHeader();
        }
    }, 100);
}

// FUNCIÓN 8: Inicializar eventos de formulario
function initFormFix() {
    if (!isMobile()) return;
    
    console.log('📱 Inicializando corrección simple de formulario');
    
    // Buscar todos los inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    
    inputs.forEach((input, index) => {
        console.log(`🔧 Configurando input ${index + 1}`);
        
        // Remover listeners previos
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('blur', handleInputBlur);
        
        // Agregar nuevos listeners
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        
        // Mejorar propiedades táctiles
        input.style.touchAction = 'manipulation';
        input.style.fontSize = '16px'; // Prevenir zoom en iOS
        input.style.minHeight = '48px'; // Mejor área de toque
    });
}

// FUNCIÓN 9: Manejar menú hamburguesa
function initMenuFix() {
    const menuButton = document.getElementById('mobile-menu');
    const mobileMenu = document.getElementById('nav-menu');
    let isMenuOpen = false;
    
    if (!menuButton || !mobileMenu) return;
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            console.log('📂 Abriendo menú');
            
            // Desenfocar cualquier input activo
            if (currentInput) {
                currentInput.blur();
            }
            
            // Mostrar header para el menú
            showHeader();
            
            // Activar menú
            menuButton.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            
        } else {
            console.log('📁 Cerrando menú');
            
            // Desactivar menú
            menuButton.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            // Si hay formulario activo, volver a ocultar header
            if (isFormActive) {
                setTimeout(() => {
                    hideHeader();
                }, 100);
            }
        }
    }
    
    // Event listener del botón
    menuButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Cerrar menú al hacer click en enlaces
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', function(e) {
        if (isMenuOpen && 
            !menuButton.contains(e.target) && 
            !mobileMenu.contains(e.target)) {
            toggleMenu();
        }
    });
}

// FUNCIÓN 10: Manejar redimensionamiento
function handleResize() {
    if (window.innerWidth > 768) {
        // Desktop: limpiar todo
        isFormActive = false;
        currentInput = null;
        showHeader();
        document.body.style.overflow = '';
    } else {
        // Móvil: reinicializar
        setTimeout(() => {
            initFormFix();
        }, 300);
    }
}

// FUNCIÓN 11: Manejar orientación
function handleOrientationChange() {
    setTimeout(() => {
        if (isMobile() && currentInput) {
            scrollToInput(currentInput);
        }
    }, 500);
}

// FUNCIÓN 12: Click fuera del formulario
function handleClickOutside() {
    document.addEventListener('click', function(e) {
        if (!isMobile() || !isFormActive) return;
        
        const isFormElement = e.target.closest('input, textarea, .newsletter-form, .contact-form, button');
        
        if (!isFormElement) {
            // Desenfocar input activo
            const activeInput = document.activeElement;
            if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
                activeInput.blur();
            }
        }
    });
}

// FUNCIÓN 13: Inicialización principal
function init() {
    console.log('🚀 Iniciando solución simple');
    
    setTimeout(() => {
        initFormFix();
        initMenuFix();
        handleClickOutside();
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
        
        console.log('✅ Solución simple inicializada');
    }, 100);
}

// ESTILOS DINÁMICOS SIMPLES
const simpleStyles = document.createElement('style');
simpleStyles.innerHTML = `
    /* Estilos simples para formulario móvil */
    @media screen and (max-width: 768px) {
        /* Transiciones suaves para header */
        .header {
            transition: transform 0.3s ease, opacity 0.3s ease !important;
        }
        
        /* Inputs mejorados */
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        textarea {
            -webkit-appearance: none !important;
            border-radius: 8px !important;
            min-height: 48px !important;
            font-size: 16px !important;
            touch-action: manipulation !important;
            transition: all 0.3s ease !important;
        }
        
        /* Focus mejorado */
        input:focus,
        textarea:focus {
            outline: none !important;
            border-color: #E0FD2C !important;
            background-color: rgba(255,255,255,0.15) !important;
            box-shadow: 0 0 10px rgba(224, 253, 44, 0.3) !important;
        }
        
        /* Body con transición suave */
        body {
            transition: padding-top 0.3s ease !important;
        }
        
        /* Menú activo */
        .nav-menu.active {
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        /* Prevenir scroll cuando menú abierto */
        body:has(.nav-menu.active) {
            overflow: hidden !important;
        }
    }
`;

// Agregar estilos
document.head.appendChild(simpleStyles);

// Inicialización automática
document.addEventListener('DOMContentLoaded', init);

// Exportar para debug
window.mobileFormSimple = {
    hideHeader,
    showHeader,
    isActive: () => isFormActive,
    currentInput: () => currentInput
};

console.log('📜 Solución simple cargada');
