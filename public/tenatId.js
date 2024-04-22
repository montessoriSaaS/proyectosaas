// Importar los servicios que necesitas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
    authDomain: "deskmontessori-a3cb2.firebaseapp.com",
    projectId: "deskmontessori-a3cb2",
    storageBucket: "deskmontessori-a3cb2.appspot.com",
    messagingSenderId: "325693574028",
    appId: "1:325693574028:web:272bfa54294c335d6d64a9",
    measurementId: "G-RLJVEHLMY5",
};

// Inicialización de Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('userRegistrationForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const adminEmail = auth.currentUser.email;
    const adminDomain = adminEmail.split('@')[1].split(".")[0];
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;
    const userDomain = userEmail.split('@')[1].split(".")[0];

    if (adminDomain === userDomain) {
        // Registrar el nuevo usuario ya que el dominio coincide
        createUserWithEmailAndPassword(auth, userEmail, userPassword)
            .then((userCredential) => {
                console.log('Usuario registrado correctamente:', userEmail);
                // Aquí puedes hacer más gestiones, como enviar un email de bienvenida o establecer claims
            })
            .catch((error) => {
                console.error('Error al registrar usuario:', error);
            });
    } else {
        alert('El correo electrónico del usuario debe estar en el mismo dominio que el del administrador.');
    }
});
