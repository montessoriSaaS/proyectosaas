// Import the functions you need from the SDKs you need
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
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-functions.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});

document
  .getElementById("payButton")
  .addEventListener("click", async function () {
    const schoolName = document.getElementById("schoolName").value;
    const adminEmail = document.getElementById("adminEmail").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const subscriptionType =
      document.getElementById("subscriptionSelect").value;

    if (subscriptionType === "1D") {
      subscriptionType = "price_1PFNCKG4W5PBvrHXupfyZJJD";
    } else if (subscriptionType === "1M") {
      subscriptionType = "price_1PFN9VG4W5PBvrHXAtlcriX6";
    } else if (subscriptionType === "6M") {
      subscriptionType = "price_1PFNAcG4W5PBvrHX0I2NJKeR";
    } else if (subscriptionType === "12M") {
      subscriptionType = "price_1PFNB9G4W5PBvrHXPuFK2dXO";
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        password
      );
      // Registrar en Firestore la información del tenant una vez completado el pago
      await setDoc(
        doc(
          db,
          `schools - ${schoolName.replace(/\s+/g, "").toLowerCase()}`,
          userCredential.user.uid
        ),
        {
          tenant: schoolName,
          adminEmail: adminEmail,
          subscriptionType: subscriptionType,
        }
      );

      const docRef = await db
        .collection("customers")
        .doc(currentUser.uid)
        .collection("checkout_sessions")
        .add({
          price: subscriptionType,
          success_url: window.location.origin,
          cancel_url: window.location.origin,
        });
      // Wait for the CheckoutSession to get attached by the extension
      docRef.onSnapshot((snap) => {
        const { error, url } = snap.data();
        if (error) {
          // Show an error to your customer and
          // inspect your Cloud Function logs in the Firebase console.
          alert(`An error occured: ${error.message}`);
        }
        if (url) {
          // We have a Stripe Checkout URL, let's redirect.
          window.location.assign(url);
        }
      });

      // Redirigir al Checkout de Stripe
      const checkoutSession = await payments.createCheckoutSession({
        priceId: subscriptionType,
        successUrl: (window.location.href = "inicioDeSesion.html"),
        cancelUrl: window.location.href,
      });

      const stripe = await loadStripe(
        "pk_test_51PFMprG4W5PBvrHX61Mx5dpflJ0rx00bQ3Wvhr0cLBkoXmCzgqFgzTefHmTNk6McxnijpvRvCmyWtT1iIpK7slPX00jtOsIPXP"
      );
      stripe.redirectToCheckout({ sessionId: checkoutSession.id });

      console.log("Escuela registrada con éxito en Firestore");
      alert("Procesamiento y registro de la escuela completado con éxito.");
    } catch (error) {
      console.error("Error en el proceso de registro y pago:", error);
      await deleteUser(userCredential.user);
      await deleteDoc(
        doc(
          db,
          `schools - ${schoolName.replace(/\s+/g, "").toLowerCase()}`,
          userDoc.id
        )
      );
      alert(
        "Error al procesar el pago y registrar la escuela. Por favor, intente nuevamente."
      );
    }
  });

window.onload = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  const productContainer = document.getElementById("product-container");
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.description}</p>
            <p>${data.price / 100} ${data.currency.toUpperCase()}</p>
            <button onclick="startCheckout('${doc.id}')">Comprar</button>
        `;
    productContainer.appendChild(productDiv);
  });
};

window.startCheckout = async (priceId) => {
  const createCheckoutSession = httpsCallable(
    functions,
    "ext-firestore-stripe-payments-createCheckoutSession"
  );
  const { data } = await createCheckoutSession({ priceId });
  window.location.href = data.url;
};
