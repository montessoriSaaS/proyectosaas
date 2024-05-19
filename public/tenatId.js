// Importar los servicios que necesitas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, doc, setDoc  } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

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
const db = getFirestore(app);

document
  .getElementById("userRegistrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Mover la obtención del valor del correo electrónico aquí
    const userEmail = document.getElementById("userEmail").value;
    const userPassword = document.getElementById("userPassword").value;

    // Suponer que el admin está autenticado y su email es accesible
    const adminEmail = auth.currentUser ? auth.currentUser.email : null;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado:", user);
        console.log("Email del usuario:", user.email);
        const adminEmail = auth.currentUser ? auth.currentUser.email : null;
      } else {
        console.log("No hay usuario autenticado.");
      }
    });

    const adminDomain = adminEmail.split("@")[1].split(".")[0];
    const userDomain = userEmail.split("@")[1].split(".")[0];

    if (adminDomain === userDomain) {
      // Registrar el nuevo usuario ya que el dominio coincide
      createUserWithEmailAndPassword(auth, userEmail, userPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          user.tenantId = userDomain;
          const userTenantId = user.tenantId;
          setDoc(doc(db, "users", user.uid), {
            tenantId: userTenantId,
            email: userEmail
          });
          alert(
            "Se agregó el usuario " + userEmail + " al dominio " + userTenantId
          );
          console.log("Usuario registrado correctamente:", userEmail);
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

const togglePasswordButton = document.getElementById("togglePassword");
const passwordInput = document.getElementById("userPassword");

togglePasswordButton.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePasswordButton.textContent =
    type === "password" ? "Mostrar contraseña" : "Ocultar contraseña";
});
