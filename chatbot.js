// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    console.log("Chatbot script loaded and DOM is ready.");

    // Obtener referencias a todos los elementos HTML necesarios por ID
    const chatToggleButton = document.getElementById('chat-toggle-button');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const loadingIndicator = document.getElementById('chatbot-loading');

    // Verificar si todos los elementos del chatbot existen
    if (!chatToggleButton || !chatbotContainer || !closeChatBtn || !chatbotForm || !chatbotInput || !chatbotMessages || !loadingIndicator) {
        console.error("Error: No se encontraron uno o más elementos del chatbot en el DOM. Verifica los IDs en tu HTML.");
        return; // Detener la ejecución si falta un elemento crucial
    }

    // --- Event Listeners ---

    // Alternar la visibilidad del chatbot al hacer clic en el botón flotante
    chatToggleButton.addEventListener('click', () => {
        chatbotContainer.classList.toggle('active');
        // Reemplaza el icono del toggler si es necesario
        const toggler = document.querySelector(".chatbot-toggler");
        if(toggler) toggler.classList.toggle("active");
    });

    // Cerrar el chatbot al hacer clic en el botón de cerrar
    closeChatBtn.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
        const toggler = document.querySelector(".chatbot-toggler");
        if(toggler) toggler.classList.remove("active");
    });

    // Manejar el envío del formulario para enviar un mensaje
    chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir que el formulario recargue la página
        const userInput = chatbotInput.value.trim(); // Obtener la entrada del usuario

        if (userInput) {
            // Si hay entrada, agregar el mensaje del usuario al chat y obtener una respuesta de la IA
            addMessage(userInput, 'user');
            chatbotInput.value = ''; // Limpiar el campo de entrada
            getAIResponse(userInput); // Llamar a la función que usa la API
        }
    });

    // --- Funciones Principales ---

    /**
     * Agrega un mensaje a la ventana del chat.
     * @param {string} text - El texto del mensaje.
     * @param {string} sender - El remitente del mensaje ('user' o 'bot').
     */
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const p = document.createElement('p');
        p.textContent = text;
        messageElement.appendChild(p);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    /**
     * Obtiene una respuesta de la IA de Gemini.
     * @param {string} userInput - El texto de entrada del usuario.
     */
    async function getAIResponse(userInput) {
        loadingIndicator.style.display = 'flex';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Contexto e instrucción para el modelo de IA, adaptado para GuardiaDigital
        const prompt = `Eres un asistente virtual para GuardiaDigital, una empresa de ciberseguridad. Responde de manera profesional, amigable y concisa. Ayuda a los usuarios con sus consultas sobre ciberseguridad y los servicios de la empresa, que son:
        1.  **Auditorías de Seguridad**: Evaluación completa de infraestructura digital.
        2.  **Consultoría**: Asesoramiento experto y personalizado.
        3.  **Implementación de Controles**: Configuración de firewalls, sistemas de detección, etc.
        4.  **Monitoreo de Seguridad**: Supervisión 24/7 para detectar y responder a amenazas.
        
        Sé amable y profesional. Si no sabes la respuesta, di que consultarás con un especialista. No inventes información. Responde siempre en español.
        
        Aquí está la pregunta del usuario: "${userInput}"`;

        // Clave de API del ejemplo que funciona
        const apiKey = "AIzaSyB2Gv6BvDX5UpWUMnIsx-CxyL5s8fWezyc";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            let botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
            
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Error al contactar la IA:', error);
            addMessage(`Hubo un problema al conectar con el asistente. (Error: ${error.message})`, 'bot');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
});

