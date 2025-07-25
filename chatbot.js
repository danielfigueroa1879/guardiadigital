// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    console.log("Chatbot script loaded and DOM is ready.");

    // Obtener referencias a todos los elementos HTML necesarios
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
    });

    // Cerrar el chatbot al hacer clic en el botón de cerrar
    closeChatBtn.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Manejar el envío del formulario para enviar un mensaje
    chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir que el formulario recargue la página
        const userInput = chatbotInput.value.trim(); // Obtener la entrada del usuario y eliminar espacios en blanco

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
        p.innerHTML = text;
        messageElement.appendChild(p);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    /**
     * Obtiene una respuesta de la IA de Gemini usando la clave de API proporcionada.
     * @param {string} userInput - El texto de entrada del usuario.
     */
    async function getAIResponse(userInput) {
        loadingIndicator.style.display = 'flex';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Contexto e instrucción para el modelo de IA
        const prompt = `Eres un asistente virtual para Guardia Digital, una empresa chilena de ciberseguridad. Tu nombre es 'Cyber Asistente'. Responde a las preguntas de los usuarios sobre nuestros servicios, que incluyen:
        1.  <b>Auditorías de Seguridad</b>: Evaluación completa de infraestructura digital.
        2.  <b>Monitoreo de Redes</b>: Supervisión 24/7.
        3.  <b>Consultoría en Ciberseguridad</b>: Asesoramiento experto y personalizado.
        4.  <b>Implementación de Sistemas de Seguridad</b>: Configuración de firewalls, etc.
        5.  <b>Seguridad IoT</b>: Protección de dispositivos inteligentes.
        
        Nuestra misión es proteger el ecosistema digital de nuestros clientes con soluciones innovadoras.
        Nuestra visión es ser líderes en soluciones tecnológicas de seguridad digital.
        
        Sé amable, profesional y conciso. Si no sabes la respuesta, di que consultarás con un especialista. No inventes información. Responde en español.
        
        Aquí está la pregunta del usuario: "${userInput}"`;

        // Clave de API proporcionada por el usuario
        const apiKey = "AIzaSyDwJx2U16H39dxdCN9SXkn-_AWyydTAx7U";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            // Preparar el payload para la API de Gemini
            const payload = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            };

            // Realizar la llamada a la API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Extraer el texto de la respuesta de la API de forma segura
            let botResponse;
            if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
                botResponse = result.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            } else {
                console.error("Respuesta de la API inesperada:", result);
                botResponse = 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
            }
            
            // Agregar la respuesta del bot al chat
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Error al contactar la IA:', error);
            addMessage(`Hubo un problema al conectar con el asistente. Por favor, intenta de nuevo más tarde. (Error: ${error.message})`, 'bot');
        } finally {
            // Ocultar el indicador de carga
            loadingIndicator.style.display = 'none';
        }
    }
});
