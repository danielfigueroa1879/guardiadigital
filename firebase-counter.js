// 1. Tu configuración específica de Firebase.
// ¡Ya está lista para usar!
const firebaseConfig = {
  apiKey: "AIzaSyClZpIPRn5ADVNHeosThfjWusTi6vhemJw",
  authDomain: "recyberseg.firebaseapp.com",
  // He añadido la URL de tu base de datos aquí
  databaseURL: "https://recyberseg-default-rtdb.firebaseio.com",
  projectId: "recyberseg",
  storageBucket: "recyberseg.appspot.com",
  messagingSenderId: "426720276050",
  appId: "1:426720276050:web:e48319ef893e06d41b398b"
};

// 2. Inicializar la aplicación de Firebase
// Esto establece la conexión con tu proyecto de Firebase.
firebase.initializeApp(firebaseConfig);

// 3. Obtener una referencia a la base de datos en tiempo real
// Esto nos permite interactuar con la Realtime Database.
const database = firebase.database();

// 4. Definir la ruta donde se guardará el contador
// Puedes pensar en esto como una "carpeta" en tu base de datos.
// 'page_visits' es el nombre del nodo donde se almacena el número.
const visitsRef = database.ref('page_visits');

// 5. Obtener el elemento del HTML donde mostraremos el contador
const visitorCountElement = document.getElementById('visitor-count');

// 6. Usar una transacción para actualizar el contador de forma segura
// Una transacción previene que dos visitantes actualicen el contador al mismo tiempo,
// lo que podría causar un conteo incorrecto.
visitsRef.transaction(function(currentValue) {
  // La función recibe el valor actual del contador desde Firebase.
  // Si es la primera vez que alguien visita, currentValue será `null`.
  
  if (currentValue === null) {
    // Si no hay valor, lo inicializamos en 1.
    return 1;
  } else {
    // Si ya existe un valor, simplemente le sumamos 1.
    return currentValue + 1;
  }
}, function(error, committed, snapshot) {
  // Esta función se ejecuta después de que la transacción termina.
  if (error) {
    // Si hubo un error, lo mostramos en la consola.
    console.error('La transacción de Firebase falló: ', error);
    if (visitorCountElement) {
        visitorCountElement.innerText = 'Error';
    }
  } else if (!committed) {
    // Esto ocurre si otro usuario estaba actualizando el contador al mismo tiempo.
    // Firebase maneja esto automáticamente, así que no necesitamos hacer nada.
    console.log('La transacción no se completó (otro usuario actualizó), Firebase lo reintentará.');
  } else {
    // Si la transacción fue exitosa...
    console.log('¡Contador de visitas actualizado en Firebase!');
    // ...actualizamos el texto en la página con el nuevo valor.
    if (visitorCountElement) {
        // Usamos toLocaleString() para formatear el número con separadores de miles.
        visitorCountElement.innerText = snapshot.val().toLocaleString();
    }
  }
});
