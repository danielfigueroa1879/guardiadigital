// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("Chatbot script inicializado.");

    // Obtener referencias a los elementos del DOM existentes en tu HTML de GuardiaDigital
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Verificar si los elementos cruciales existen
    if (!chatbotToggler || !closeBtn || !chatbox || !chatInput || !sendChatBtn) {
        console.error("Error: No se encontraron uno o más elementos del chatbot en el DOM. Verifica las clases en tu HTML.");
        return;
    }

    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;

    /**
     * Crea un elemento <li> para un mensaje de chat.
     * @param {string} message - El texto del mensaje.
     * @param {string} className - 'outgoing' para el usuario, 'incoming' para el bot.
     * @returns {HTMLElement}
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
     * Obtiene una respuesta de la IA de Gemini.
     * Esta función imita la lógica del archivo chatbot.js que sí funciona.
     * @param {HTMLElement} chatElement - El elemento <li> donde se mostrará la respuesta.
     */
    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");

        // Contexto e instrucción para el modelo, adaptado para GuardiaDigital
        const prompt = `Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa, que son:
        1.  **Auditorías de Seguridad**: Evaluación completa de infraestructura digital.
        2.  **Consultoría**: Asesoramiento experto y personalizado.
        3.  **Implementación de Controles**: Configuración de firewalls, sistemas de detección, etc.
        4.  **Monitoreo de Seguridad**: Supervisión 24/7 para detectar y responder a amenazas.
        
        Sé amable y profesional. Si no sabes la respuesta, di que consultarás con un especialista. No inventes información. Responde siempre en español.
        
        Aquí está la pregunta del usuario: "${userMessage}"`;

        // Usamos la clave de API del ejemplo que funciona, como se solicitó.
        const apiKey = "AIzaSyB2Gv6BvDX5UpWUMnIsx-CxyL5s8fWezyc";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            let botResponse;

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                botResponse = result.candidates[0].content.parts[0].text.trim();
            } else {
                console.error("Respuesta de la API inesperada:", result);
                botResponse = 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
            }
            
            messageElement.textContent = botResponse;

        } catch (error) {
            console.error('Error al contactar la IA:', error);
            messageElement.classList.add("error");
            messageElement.textContent = `Hubo un problema al conectar con el asistente. (Error: ${error.message})`;
        } finally {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    };

    /**
     * Maneja el proceso de enviar un mensaje.
     */
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTop = chatbox.scrollHeight;

        setTimeout(() => {
            const incomingChatLi = createChatLi("Pensando...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTop = chatbox.scrollHeight;
            generateResponse(incomingChatLi);
        }, 600);
    };

    // --- Event Listeners ---

    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
