// registroEscuelas.js
// Se importan las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

// Configuración de Firebase de mi aplicación web
const firebaseConfig = {
  apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
  authDomain: "deskmontessori-a3cb2.firebaseapp.com",
  projectId: "deskmontessori-a3cb2",
  storageBucket: "deskmontessori-a3cb2.appspot.com",
  messagingSenderId: "325693574028",
  appId: "1:325693574028:web:272bfa54294c335d6d64a9",
  measurementId: "G-RLJVEHLMY5",
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document
  .getElementById("payButton")
  .addEventListener("click", async function () {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "block";

    const schoolName = document.getElementById("schoolName").value.trim();
    const adminEmail = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const subscriptionTypeKey =
      document.getElementById("subscriptionSelect").value;

    // Match subscription type with Stripe price IDs
    const subscriptionTypes = {
      "1D": "price_1PFNCKG4W5PBvrHXupfyZJJD",
      "1M": "price_1PFN9VG4W5PBvrHXAtlcriX6",
      "6M": "price_1PFNAcG4W5PBvrHX0I2NJKeR",
      "12M": "price_1PFNB9G4W5PBvrHXPuFK2dXO",
    };
    const subscriptionType = subscriptionTypes[subscriptionTypeKey];

    if (
      !schoolName ||
      !adminEmail ||
      !password ||
      !confirmPassword ||
      !subscriptionType
    ) {
      alert("Por favor, complete todos los campos.");
      loadingElement.style.display = "none";
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      loadingElement.style.display = "none";
      return; // No se hace registros si las contraseñas no coinciden
    }

    let userCredential;
    try {
      // Creación del usuario en Auth
      userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        password
      );

      // Creación del usuario en Firestore
      await setDoc(
        doc(
          db,
          `schools/${schoolName.replace(/\s+/g, "").toLowerCase()}/admins`,
          userCredential.user.uid
        ),
        {
          tenantId: schoolName.replace(/\s+/g, "").toLowerCase(),
          adminEmail: adminEmail,
          password: password,
          priceId: subscriptionType,
          subscription: "Activa",
        }
      );

      // Manejo del pago en Stripe
      const checkoutSessionRef = await addDoc(
        collection(
          db,
          "customers",
          userCredential.user.uid,
          "checkout_sessions"
        ),
        {
          price: subscriptionType,
          success_url: window.location.origin + "/dashboard.html", // Redirección al dashboard en origin/dashboard.html
          cancel_url: window.location.origin + "/registroEscuelas.html", // Redirección al registro de Escuelas
        }
      );

      onSnapshot(checkoutSessionRef, (snap) => {
        const { error, url } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
          loadingElement.style.display = "none";
          return;
        }
        if (url) {
          window.location.assign(url);
        }
      });

      console.log("Escuela registrada con éxito en Firestore");
      alert(
        "Procesamiento y registro de la escuela completado con éxito.\n Se redirigen para realizar el pago."
      );
    } catch (error) {
      console.error("Error en el proceso de registro y pago:", error);
      // Si la transacción del pago se cancela, se elimina el usuario creado de Auth y Firestore
      if (userCredential) {
        await deleteUser(userCredential.user);
        await deleteDoc(
          doc(
            db,
            `schools/${schoolName.replace(/\s+/g, "").toLowerCase()}/admins`,
            userCredential.user.uid
          )
        );
      }
      alert(
        "Error al procesar el pago y registrar la escuela. Por favor, intente nuevamente."
      );
    } finally {
      loadingElement.style.display = "none";
    }
  });
