<?php
// Configuración de headers para evitar problemas de caracteres
header('Content-Type: text/html; charset=UTF-8');

// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitizar y validar los datos recibidos
    $nombre = isset($_POST["nombre"]) ? trim($_POST["nombre"]) : '';
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
    $telefono = isset($_POST["telefono"]) ? trim($_POST["telefono"]) : '';
    $asunto = isset($_POST["asunto"]) ? trim($_POST["asunto"]) : '';
    $mensaje = isset($_POST["mensaje"]) ? trim($_POST["mensaje"]) : '';
    
    // Validaciones básicas
    $errores = array();
    
    if (empty($nombre)) {
        $errores[] = "El nombre es requerido";
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errores[] = "Email válido es requerido";
    }
    
    if (empty($asunto)) {
        $errores[] = "El asunto es requerido";
    }
    
    if (empty($mensaje)) {
        $errores[] = "El mensaje es requerido";
    }
    
    // Si no hay errores, proceder con el envío
    if (empty($errores)) {
        
        // Configuración del correo
        $destinatario = "danielfigueroa1879@gmail.com";
        $asunto_completo = "Contacto desde RECYBERSEG: " . $asunto;
        
        // Construir el cuerpo del mensaje
        $cuerpo = "Has recibido un nuevo mensaje desde tu sitio web RECYBERSEG:\n\n";
        $cuerpo .= "Nombre: " . $nombre . "\n";
        $cuerpo .= "Email: " . $email . "\n";
        $cuerpo .= "Teléfono: " . $telefono . "\n";
        $cuerpo .= "Asunto: " . $asunto . "\n";
        $cuerpo .= "Mensaje:\n" . $mensaje . "\n\n";
        $cuerpo .= "---\n";
        $cuerpo .= "Enviado desde: " . $_SERVER['HTTP_HOST'] . "\n";
        $cuerpo .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
        $cuerpo .= "IP: " . $_SERVER['REMOTE_ADDR'];
        
        // Headers del correo
        $headers = array();
        $headers[] = "From: " . $nombre . " <" . $email . ">";
        $headers[] = "Reply-To: " . $email;
        $headers[] = "X-Mailer: PHP/" . phpversion();
        $headers[] = "Content-Type: text/plain; charset=UTF-8";
        
        // Enviar el correo
        if (mail($destinatario, $asunto_completo, $cuerpo, implode("\r\n", $headers))) {
            // Éxito - Mostrar página de confirmación
            echo '<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mensaje Enviado - RECYBERSEG</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background-color: #f4f4f4; 
                    }
                    .success-container { 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                        max-width: 500px; 
                        margin: 0 auto; 
                    }
                    .success-icon { 
                        color: #28a745; 
                        font-size: 60px; 
                        margin-bottom: 20px; 
                    }
                    .btn { 
                        background: #007bff; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        margin-top: 20px; 
                    }
                </style>
            </head>
            <body>
                <div class="success-container">
                    <div class="success-icon">✓</div>
                    <h2>¡Mensaje Enviado Correctamente!</h2>
                    <p>Gracias <strong>' . htmlspecialchars($nombre) . '</strong>, tu mensaje ha sido enviado exitosamente.</p>
                    <p>Te responderemos a la brevedad en: <strong>' . htmlspecialchars($email) . '</strong></p>
                    <a href="index.html" class="btn">Volver al Inicio</a>
                </div>
            </body>
            </html>';
            
        } else {
            // Error en el envío
            echo '<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error - RECYBERSEG</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background-color: #f4f4f4; 
                    }
                    .error-container { 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                        max-width: 500px; 
                        margin: 0 auto; 
                    }
                    .error-icon { 
                        color: #dc3545; 
                        font-size: 60px; 
                        margin-bottom: 20px; 
                    }
                    .btn { 
                        background: #007bff; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        margin-top: 20px; 
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <div class="error-icon">✗</div>
                    <h2>Error al Enviar el Mensaje</h2>
                    <p>Lo sentimos, hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.</p>
                    <a href="index.html" class="btn">Volver al Inicio</a>
                </div>
            </body>
            </html>';
        }
        
    } else {
        // Mostrar errores de validación
        echo '<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error de Validación - RECYBERSEG</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background-color: #f4f4f4; 
                }
                .error-container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                    max-width: 500px; 
                    margin: 0 auto; 
                }
                .error-list { 
                    text-align: left; 
                    background: #f8d7da; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                }
                .btn { 
                    background: #007bff; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block; 
                    margin-top: 20px; 
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h2>Errores en el Formulario</h2>
                <div class="error-list">
                    <ul>';
        
        foreach ($errores as $error) {
            echo '<li>' . htmlspecialchars($error) . '</li>';
        }
        
        echo '      </ul>
                </div>
                <a href="index.html" class="btn">Volver al Formulario</a>
            </div>
        </body>
        </html>';
    }
    
} else {
    // Si no es POST, redirigir al inicio
    header('Location: index.html');
    exit();
}
?>
