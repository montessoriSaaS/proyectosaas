// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-functions.js";

// Your web app's Firebase configuration
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
const db = getFirestore(app);
const functions = getFunctions(app);

// Handle subscription creation and payment
document
  .getElementById("payButton")
  .addEventListener("click", async function () {
    const schoolName = document.getElementById("schoolName").value;
    const adminEmail = document.getElementById("adminEmail").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    let subscriptionType = document.getElementById("subscriptionSelect").value;

    // Match subscription type with Stripe price IDs
    const subscriptionTypes = {
      "1D": "price_1PFNCKG4W5PBvrHXupfyZJJD",
      "1M": "price_1PFN9VG4W5PBvrHXAtlcriX6",
      "6M": "price_1PFNAcG4W5PBvrHX0I2NJKeR",
      "12M": "price_1PFNB9G4W5PBvrHXPuFK2dXO",
    };
    subscriptionType = subscriptionTypes[subscriptionType];

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);

      await setDoc(doc(db, `schools/${schoolName.replace(/\s+/g, "").toLowerCase()}/admins`, userCredential.user.uid), {
        tenant: schoolName,
        adminEmail: adminEmail,
        password: password,
        priceId: subscriptionType,
      });

      const checkoutSessionRef = await addDoc(collection(db, "customers", userCredential.user.uid, "checkout_sessions"), {
        price: subscriptionType,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

      onSnapshot(checkoutSessionRef, (snap) => {
        const { error, url } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
        }
        if (url) {
          window.location.assign(url);
        }
      });

      console.log("Escuela registrada con éxito en Firestore");
      alert("Procesamiento y registro de la escuela completado con éxito.");
    } catch (error) {
      console.error("Error en el proceso de registro y pago:", error);
      if (userCredential) {
        await deleteUser(userCredential.user);
        await deleteDoc(doc(db, `schools/${schoolName.replace(/\s+/g, "").toLowerCase()}/admins`, userCredential.user.uid));
      }
      alert("Error al procesar el pago y registrar la escuela. Por favor, intente nuevamente.");
    }
  });