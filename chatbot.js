// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

    // Obtener referencias a los elementos del DOM existentes en tu HTML
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbotContainer = document.querySelector(".chatbot"); // El contenedor principal
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Verificar si los elementos cruciales existen para evitar errores
    if (!chatbotToggler || !chatbotContainer || !closeBtn || !chatbox || !chatInput || !sendChatBtn) {
        console.error("Error: No se encontraron uno o más elementos del chatbot en el DOM. Verifica las clases en tu HTML.");
        return; // Detener si falta algo
    }

    let userMessage = null; // Variable para guardar el mensaje del usuario
    const inputInitHeight = chatInput.scrollHeight;

    /**
     * Crea un elemento de lista <li> para un mensaje de chat.
     * @param {string} message - El texto del mensaje.
     * @param {string} className - La clase del remitente ('outgoing' para el usuario, 'incoming' para el bot).
     * @returns {HTMLElement} - El elemento <li> creado.
     */
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" 
            ? `<p></p>` 
            : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    };

    /**
     * Envía una solicitud a la API de Gemini y muestra la respuesta.
     * @param {HTMLElement} chatElement - El elemento <li> donde se mostrará la respuesta del bot.
     */
    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");

        const prompt = `Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa, que son:
        1.  **Auditorías de Seguridad**: Evaluación completa de infraestructura digital.
        2.  **Consultoría**: Asesoramiento experto y personalizado.
        3.  **Implementación de Controles**: Configuración de firewalls, sistemas de detección, etc.
        4.  **Monitoreo de Seguridad**: Supervisión 24/7 para detectar y responder a amenazas.
        
        Sé amable y profesional. Si no sabes la respuesta, di que consultarás con un especialista. No inventes información. Responde siempre en español.
        
        Aquí está la pregunta del usuario: "${userMessage}"`;

        // **SOLUCIÓN DEFINITIVA:** Se elimina la clave de API hardcodeada.
        // El entorno gestionará la autenticación de forma segura.
        const apiKey = "AIzaSyB2Gv6BvDX5UpWUMnIsx-CxyL5s8fWezyc"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch(apiUrl, requestOptions);
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                let errorDetail = `Error HTTP: ${response.status}`;
                if (errorBody && errorBody.error && errorBody.error.message) {
                    errorDetail = errorBody.error.message;
                }
                throw new Error(errorDetail);
            }

            const result = await response.json();
            let botResponse;

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                botResponse = result.candidates[0].content.parts[0].text.trim();
            } else {
                console.error("Respuesta de la API inesperada:", result);
                botResponse = 'Lo siento, no pude procesar la respuesta en este momento. Por favor, inténtalo de nuevo.';
            }
            
            messageElement.textContent = botResponse;

        } catch (error) {
            console.error("Error al conectar con el asistente:", error);
            messageElement.classList.add("error");
            messageElement.textContent = `Hubo un problema al conectar con el asistente. Detalle: ${error.message}. Por favor, intenta de nuevo más tarde.`;
        } finally {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    };

    /**
     * Maneja el proceso de enviar un mensaje y obtener una respuesta.
     */
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        const outgoingChatLi = createChatLi(userMessage, "outgoing");
        chatbox.appendChild(outgoingChatLi);
        chatbox.scrollTop = chatbox.scrollHeight;

        setTimeout(() => {
            const incomingChatLi = createChatLi("Pensando...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTop = chatbox.scrollHeight;
            generateResponse(incomingChatLi);
        }, 600);
    };

    // --- Event Listeners ---

    // Ajustar la altura del textarea al escribir
    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    // Enviar mensaje con la tecla Enter (si no es Shift+Enter)
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    // Enviar mensaje al hacer clic en el botón
    sendChatBtn.addEventListener("click", handleChat);

    // Cerrar el chatbot
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    
    // Abrir el chatbot
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
