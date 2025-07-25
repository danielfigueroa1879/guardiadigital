// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("Chatbot script inicializado.");

    // Obtener referencias a los elementos del DOM existentes en tu HTML de GuardiaDigital
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    if (!chatbotToggler || !closeBtn || !chatbox || !chatInput || !sendChatBtn) {
        console.error("Error: No se encontraron uno o más elementos del chatbot en el DOM.");
        return;
    }

    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;
    let welcomeMessageShown = false; // Flag para mostrar el mensaje de bienvenida solo una vez

    // --- RESPUESTAS PREDETERMINADAS ---
    const predefinedResponses = {
        "saludos": {
            keywords: ["hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches"],
            response: "¡Hola! Soy el asistente virtual de GuardiaDigital. ¿En qué puedo ayudarte hoy?"
        },
        "despedidas": {
            keywords: ["adios", "chao", "hasta luego", "nos vemos"],
            response: "¡Hasta luego! Que tengas un excelente día. Si tienes más dudas, aquí estaré."
        },
        "agradecimientos": {
            keywords: ["gracias", "muchas gracias", "te pasaste", "agradecido"],
            response: "¡De nada! Estoy para ayudarte. ¿Hay algo más que necesites saber?"
        },
        "servicios": {
            keywords: ["servicios", "ofrecen", "hacen", "planes"],
            response: "En GuardiaDigital ofrecemos: Auditorías de Seguridad, Consultoría, Implementación de Controles y Monitoreo de Seguridad. ¿Te gustaría que te detalle alguno de estos servicios?"
        },
        "phishing": {
            keywords: ["phishing", "phisng", "fishing"],
            response: "El phishing es un ciberataque que usa correos o mensajes fraudulentos para robar tu información personal. Siempre verifica el remitente y nunca hagas clic en enlaces sospechosos. ¿Quieres saber más sobre cómo protegerte?"
        },
        "malware": {
            keywords: ["malware", "virus", "troyano", "ransomware"],
            response: "El malware es un software malicioso diseñado para dañar tu sistema. Para protegerte, mantén tu antivirus actualizado y no descargues archivos de fuentes no confiables. Nuestros servicios de monitoreo pueden ayudarte a detectar estas amenazas a tiempo."
        },
        "contraseña": {
            keywords: ["contraseña", "clave", "password"],
            response: "Una contraseña segura debe tener al menos 12 caracteres, mezclando mayúsculas, minúsculas, números y símbolos (!@#$%). Evita usar datos personales. ¿Te gustaría que te dé un ejemplo de una contraseña segura?"
        }
    };

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    };

    /**
     * Muestra un mensaje de bienvenida adicional con sugerencias.
     */
    const showWelcomeMessage = () => {
        setTimeout(() => {
            const welcomeLi = createChatLi("Puedes preguntarme sobre nuestros servicios como Auditorías, o sobre temas de ciberseguridad como 'phishing' o 'malware'.", "incoming");
            chatbox.appendChild(welcomeLi);
            chatbox.scrollTop = chatbox.scrollHeight;
        }, 800); // Se muestra 800ms después de abrir el chat
    };

    const getPredefinedResponse = (input) => {
        for (const key in predefinedResponses) {
            const category = predefinedResponses[key];
            for (const keyword of category.keywords) {
                if (input.includes(keyword)) {
                    return category.response;
                }
            }
        }
        return null;
    };

    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");
        const prompt = `Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa. Aquí está la pregunta del usuario: "${userMessage}"`;
        const apiKey = "AIzaSyB2Gv6BvDX5UpWUMnIsx-CxyL5s8fWezyc";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
            messageElement.textContent = botResponse;
        } catch (error) {
            console.error('Error al contactar la IA:', error);
            messageElement.classList.add("error");
            messageElement.textContent = `Hubo un problema al conectar con el asistente. (Error: ${error.message})`;
        } finally {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    };

    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const userMessageLower = userMessage.toLowerCase();
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTop = chatbox.scrollHeight;

        setTimeout(() => {
            const predefinedResponse = getPredefinedResponse(userMessageLower);
            const incomingChatLi = createChatLi(predefinedResponse || "Pensando...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTop = chatbox.scrollHeight;

            if (!predefinedResponse) {
                generateResponse(incomingChatLi);
            }
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
    
    // Modificado para mostrar el mensaje de bienvenida dinámico
    chatbotToggler.addEventListener("click", () => {
        document.body.classList.toggle("show-chatbot");
        // Si el chatbot se está mostrando y el mensaje de bienvenida no ha aparecido
        if (document.body.classList.contains("show-chatbot") && !welcomeMessageShown) {
            showWelcomeMessage();
            welcomeMessageShown = true; // Marcar como mostrado para esta sesión
        }
    });
});
