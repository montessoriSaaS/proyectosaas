// Importar los servicios que necesitas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-functions.js";

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
const functions = getFunctions(app);

document
  .getElementById("userRegistrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userEmail = document.getElementById("userEmail").value;
    const userPassword = document.getElementById("userPassword").value;

    // Suponer que el admin está autenticado y su email es accesible
    const adminEmail = auth.currentUser ? auth.currentUser.email : null;
    if (!adminEmail) {
      alert("Administrador no autenticado o email no disponible");
      return; // Detener ejecución si no hay admin autenticado
    }

    const adminDomain = adminEmail.split("@")[1].split(".")[0];
    const userDomain = userEmail.split("@")[1].split(".")[0];

    if (adminDomain === userDomain) {
      // Registrar el nuevo usuario ya que el dominio coincide
      createUserWithEmailAndPassword(auth, userEmail, userPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Usuario registrado correctamente:", userEmail);
          console.log(userCredential);
          console.log(user);
          console.log(userDomain, user.tenantId);
          // Llamar a la función invocable para añadir custom claims
          const addTenantClaim = httpsCallable(functions, "addTenantClaim");
          addTenantClaim({ email: userEmail, uid: user.uid, tenantId: userDomain })
            .then((result) => {
              console.log("Tenant ID set:", result.data);
            })
            .catch((error) => {
              console.error("Error setting tenant ID:", error.message);
            });
        })
        .catch((error) => {
          // Manejo específico del error cuando el email ya está registrado
          if (error.code === "auth/email-already-in-use") {
            alert(
              "Error: El correo electrónico ya está registrado. Por favor, utiliza otro correo."
            );
          } else {
            console.error("Error al registrar usuario:", error);
            alert("Error al registrar usuario: " + error.message);
          }
        });
    } else {
      alert(
        "El correo electrónico del usuario debe estar en el mismo dominio que el del administrador."
      );
    }
  });
