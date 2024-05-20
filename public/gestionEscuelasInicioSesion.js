// Importar los servicios que necesitas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-functions.js";

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

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      if (username === "admin@deskmontessori.com" && password === "proyectoMonte!") {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          username,
          password
        );

        // Usuario autenticado correctamente
        console.log("Usuario autenticado:", userCredential.user);
        auth.updateCurrentUser(userCredential.user);

        console.log(
          "Usuario actual después de iniciar sesión:",
          auth.currentUser
        );

        // Redirigir al usuario a la página del dashboard
        window.location.href = "gestionEscuelas.html";
      } else {
        alert("Usuario y/o contraseña incorrecta.¿\nIntenta de nuevo.");
        return;
      }
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        console.error("Contraseña incorrecta:", error.message);
        alert("Contraseña incorrecta");
      } else if (error.code === "auth/user-not-found") {
        console.error("Usuario no encontrado:", error.message);
        alert("Usuario no encontrado");
      } else {
        console.error("Error al autenticar:", error.message);
        alert("Error al autenticar.\nIntente Nuevamente.");
      }
    }
  });
});
