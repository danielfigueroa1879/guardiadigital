const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = async (chatElement) => {
    // This function uses the simplified logic from the working chatbot
    const messageElement = chatElement.querySelector("p");
    const thinkingElement = messageElement; // The element that shows "Pensando..."

    // **ADAPTED LOGIC:** Create a single, detailed prompt for each request.
    const prompt = `Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa, que son:
    1.  **Auditorías de Seguridad**: Evaluación completa de infraestructura digital.
    2.  **Consultoría**: Asesoramiento experto y personalizado.
    3.  **Implementación de Controles**: Configuración de firewalls, sistemas de detección, etc.
    4.  **Monitoreo de Seguridad**: Supervisión 24/7 para detectar y responder a amenazas.
    
    Sé amable y profesional. Si no sabes la respuesta, di que consultarás con un especialista. No inventes información. Responde siempre en español.
    
    Aquí está la pregunta del usuario: "${userMessage}"`;

    // Use the API Key from the working example, as requested.
    const apiKey = "AIzaSyB2Gv6BvDX5UpWUMnIsx-CxyL5s8fWezyc";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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

        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
            botResponse = result.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Respuesta de la API inesperada:", result);
            botResponse = 'Lo siento, no pude procesar la respuesta en este momento. Por favor, inténtalo de nuevo.';
        }
        
        thinkingElement.textContent = botResponse;

    } catch (error) {
        console.error("Error al conectar con el asistente:", error);
        thinkingElement.classList.add("error");
        thinkingElement.textContent = `Hubo un problema al conectar con el asistente. Detalle: ${error.message}. Por favor, intenta de nuevo más tarde.`;
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Pensando...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.add("show-chatbot"));

