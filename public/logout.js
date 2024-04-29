import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
  authDomain: "deskmontessori-a3cb2.firebaseapp.com",
  projectId: "deskmontessori-a3cb2",
  storageBucket: "deskmontessori-a3cb2.appspot.com",
  messagingSenderId: "325693574028",
  appId: "1:325693574028:web:272bfa54294c335d6d64a9",
  measurementId: "G-RLJVEHLMY5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("auth:", auth);
console.log("auth.currentUser:", auth.currentUser);
console.log("auth.userCredentials", auth.userCredentials);

function logout() {
  console.log("Entrando a la función logout");
  // Confirmar el logout antes de continuar
  const auth = getAuth();
  console.log("auth: ", auth);
  console.log("auth.currentUser: ", auth.currentUser);
  // Confirmar el logout antes de continuar
  const confirmed = confirm("¿Estás seguro de que quieres cerrar sesión?");
  if (!confirmed) {
    return; // Cancelar logout si el usuario no confirma
  }
  signOut(auth)
    .then(() => {
      // Redirige al usuario al formulario de inicio de sesión
      console.log("Sesión cerrada exitosamente");
    })
    .catch((error) => {
      console.error("Error al cerrar sesión", error);
    });
}

window.logout = logout; // Hace la función accesible globalmente para ser llamada desde el HTML
