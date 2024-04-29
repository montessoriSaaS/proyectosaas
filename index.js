import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
  authDomain: "deskmontessori-a3cb2.firebaseapp.com",
  projectId: "deskmontessori-a3cb2",
  storageBucket: "deskmontessori-a3cb2.appspot.com",
  messagingSenderId: "325693574028",
  appId: "1:325693574028:web:272bfa54294c335d6d64a9",
  measurementId: "G-RLJVEHLMY5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevenir el envío predeterminado

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const auth = getAuth();
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        console.log("Inicio de sesión exitoso", userCredential.user);
        // Redirige a la página principal
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        console.error("Error en el inicio de sesión: ", error.message);
        alert("Error en el inicio de sesión: Usuario o contraseña incorrectos");
      });
  });
});