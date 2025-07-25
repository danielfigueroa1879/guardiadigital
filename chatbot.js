const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;
const chatHistory = []; // Array to store conversation history

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
    // This function uses the Gemini API and maintains conversation history
    const messageElement = chatElement.querySelector("p");

    // Add the user's message to the history
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    // System instruction to give the chatbot context about its role
    const systemInstruction = {
        parts: [{ text: "Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa: Auditorías de Seguridad, Consultoría, Implementación de Controles y Monitoreo de Seguridad." }]
    };

    // Gemini API details. The API key is handled by the environment.
    const apiKey = "AIzaSyDwJx2U16H39dxdCN9SXkn-_AWyydTAx7U"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // **FIX:** Construct the payload with the 'system_instruction' field separate from 'contents'.
    const payload = {
        contents: chatHistory,
        system_instruction: systemInstruction
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
            // If the response is not OK, try to get more details from the body
            const errorBody = await response.json().catch(() => null);
            let errorDetail = `Error HTTP: ${response.status}`;
            if (errorBody && errorBody.error && errorBody.error.message) {
                errorDetail = errorBody.error.message;
            }
            throw new Error(errorDetail);
        }
        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
            const botResponse = result.candidates[0].content.parts[0].text.trim();
            messageElement.textContent = botResponse;
            // Add the bot's response to the history
            chatHistory.push({ role: "model", parts: [{ text: botResponse }] });
        } else {
            // Handle cases where the response structure is unexpected
            throw new Error("Respuesta de API no válida o vacía.");
        }
    } catch (error) {
        console.error("Error al conectar con el asistente:", error);
        messageElement.classList.add("error");
        // Display a more detailed error message to the user
        messageElement.textContent = `Hubo un problema al conectar con el asistente. Detalle: ${error.message}. Por favor, intenta de nuevo más tarde.`;
        // On failure, remove the last user message from history to allow a retry
        chatHistory.pop();
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
