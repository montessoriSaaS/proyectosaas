// Importar los servicios que necesitas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevenir el envío predeterminado

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Establecer la persistencia del usuario
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Autenticar al usuario
        signInWithEmailAndPassword(auth, username, password)
          .then((userCredential) => {
            // Usuario autenticado correctamente
            console.log("Usuario autenticado:", userCredential.user);
            auth.updateCurrentUser(userCredential.user);
            // Esperar un momento antes de acceder a currentUser
            setTimeout(() => {
              console.log("Usuario actual después de iniciar sesión:", auth.currentUser);
            }, 1000); // Esperar 1 segundo antes de acceder a currentUser
            window.location.href = "dashboard.html";
          })
          .catch((error) => {
            console.error("Error al autenticar:", error.message);
          });
      })
      .catch((error) => {
        console.error("Error al establecer la persistencia:", error.message);
      });
  });
});

const addAdminRole = firebase.functions().httpsCallable('addAdminRole');

addAdminRole({ uid: 'FTqipjzNvaUFuECW25uETrMcNVj2' })
    .then(result => {
        console.log("Admin:", result.data.message);
    })
    .catch(error => {
        console.error('Error al asignar rol de administrador:', error);
    });
