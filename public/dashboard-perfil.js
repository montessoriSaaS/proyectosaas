import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
  authDomain: "deskmontessori-a3cb2.firebaseapp.com",
  projectId: "deskmontessori-a3cb2",
  storageBucket: "deskmontessori-a3cb2.appspot.com",
  messagingSenderId: "325693574028",
  appId: "1:325693574028:web:272bfa54294c335d6d64a9",
  measurementId: "G-RLJVEHLMY5",
};

// Inicializa Firebase Auth y Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("profile-email").textContent = user.email;

    // Mostrar elementos específicos solo para administradores
    if (user.email.startsWith("admin@")) {
      document.getElementById("admin-controls").style.display = "block";
    } else {
      document.getElementById("admin-controls").style.display = "none";
    }

    // Obtener información de suscripción del usuario
    const subscriptionsRef = collection(
      db,
      `customers/${user.uid}/subscriptions`
    );
    const q = query(subscriptionsRef, where("status", "==", "active"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const subscriptionData = doc.data();
        const currentPeriodEnd =
          subscriptionData.current_period_end.seconds * 1000;
        const now = Date.now();

        document.getElementById("subscription-end-date").textContent = new Date(
          currentPeriodEnd
        ).toLocaleDateString();

        if (now < currentPeriodEnd) {
          document.getElementById("subscription-status").textContent = "Activa";
        } else {
          document.getElementById("subscription-status").textContent =
            "Suspendida";
        }
      });
    } else {
      document.getElementById("subscription-status").textContent =
        "Sin suscripción";
      document.getElementById("subscription-end-date").textContent = "N/A";
    }
  } else {
    window.location.href = "inicioDeSesion.html"; // Redirigir si no hay un usuario autenticado
  }
});

// Cambiar contraseña
document
  .getElementById("change-password-button")
  .addEventListener("click", async () => {
    const newPassword = document.getElementById("new-password").value;
    const confirmNewPassword = document.getElementById(
      "confirm-new-password"
    ).value;

    if (newPassword !== confirmNewPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      alert("Contraseña cambiada exitosamente.");
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert(
        "Error al cambiar la contraseña.\n Por favor, cierre sesión e ingrese de nuevo."
      );
    }
  });

// Actualizar suscripción
document
  .getElementById("update-subscription-button")
  .addEventListener("click", async () => {
    const subscriptionTypeKey =
      document.getElementById("subscriptionSelect").value;
    const subscriptionTypes = {
      "1D": "price_1PFNCKG4W5PBvrHXupfyZJJD",
      "1M": "price_1PFN9VG4W5PBvrHXAtlcriX6",
      "6M": "price_1PFNAcG4W5PBvrHX0I2NJKeR",
      "12M": "price_1PFNB9G4W5PBvrHXPuFK2dXO",
    };
    const subscriptionType = subscriptionTypes[subscriptionTypeKey];
    const user = auth.currentUser;
    const emailParts = user.email.split("@");
    const domain = emailParts[1].split(".")[0];

    // Acceder a la colección de contraseñas de admin y obtener la contraseña
    const adminPasswordSnapshot = await getDocs(
      collection(db, `schools/${domain}/admins`)
    );
    const adminPassword = adminPasswordSnapshot.docs[0]?.data().password || "";

    await setDoc(doc(db, `schools/${domain}/admins`, user.uid), {
      tenantId: domain,
      adminEmail: user.email,
      password: adminPassword, // Asegurarse de que sea una cadena
      priceId: subscriptionType,
      subscription: "Activa",
      permissions: [
        "alumnos",
        "docentes",
        "materias",
        "grupos",
        "calificaciones",
        "usuarios",
      ],
    });

    try {
      // Manejo del pago en Stripe
      const checkoutSessionRef = await addDoc(
        collection(db, "customers", user.uid, "checkout_sessions"),
        {
          price: subscriptionType,
          success_url: window.location.origin + "/dashboard-perfil.html", // Redirección al dashboard
          cancel_url: window.location.origin + "/dashboard-perfil.html", // Redirección al registro de Escuelas
        }
      );

      onSnapshot(checkoutSessionRef, (snap) => {
        const { error, url } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
          return;
        }
        if (url) {
          window.location.assign(url);
        }
      });
    } catch (error) {
      console.error("Error en el proceso de registro y pago:", error);
      alert(
        "Error al actualizar el plan de suscripción.\n Por favor, inténtelo de nuevo."
      );
    }
  });

// Cancelar suscripción
document
  .getElementById("cancel-subscription-button")
  .addEventListener("click", async () => {
    const user = auth.currentUser;
    if (confirm("¿Está seguro de que desea cancelar su suscripción?")) {
      try {
        await deleteDoc(doc(db, `customers/${user.uid}`));
        alert("Subscripción eliminada correctamente.");
        window.location.href = "dashboard-perfil.html";
      } catch (error) {
        console.log("Error al cancelar subscripción:", error);
        alert("Error al cancelar subscripción.");
      }
    }
  });

// Eliminar cuenta
document
  .getElementById("delete-account-button")
  .addEventListener("click", async () => {
    const user = auth.currentUser;

    if (
      confirm(
        "¿Está seguro de que desea cancelar su suscripción y eliminar su cuenta permanentemente?\nEsta acción borrará todos sus datos y no es reversible."
      )
    ) {
      try {
        const subscriptionsRef = collection(
          db,
          `customers/${user.uid}/subscriptions`
        );
        const q = query(subscriptionsRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        }

        const emailParts = user.email.split("@");
        const domain = emailParts[1].split(".")[0];

        await deleteDoc(doc(db, `schools/${domain}/admins`, user.uid));
        const usersCollectionRef = collection(db, `schools/${domain}/users`);
        const usersSnapshot = await getDocs(usersCollectionRef);
        for (const userDoc of usersSnapshot.docs) {
          await deleteDoc(doc(db, `schools/${domain}/users`, userDoc.id));
        }
        await deleteDoc(doc(db, `customers/${user.uid}`));
        await deleteUser(user); // Eliminar cuenta de usuario
        alert("Cuenta eliminada exitosamente.");

        window.location.href = "index.html"; // Redirigir a la pantalla principal
      } catch (error) {
        console.error(
          "Error al cancelar la suscripción y eliminar la cuenta:",
          error
        );
        alert(
          "Error al cancelar la suscripción y eliminar la cuenta.\n Por favor, cierre sesión y vuelva a acceder."
        );
      }
    }
  });

// Mostrar y ocultar contraseñas
const toggleNewPasswordButton = document.getElementById("toggleNewPassword");
const toggleConfirmPasswordButton = document.getElementById(
  "toggleConfirmPassword"
);
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-new-password");

toggleNewPasswordButton.addEventListener("click", () => {
  const type =
    newPasswordInput.getAttribute("type") === "password" ? "text" : "password";
  newPasswordInput.setAttribute("type", type);
  toggleNewPasswordButton.textContent =
    type === "password" ? "Mostrar contraseña" : "Ocultar contraseña";
});

toggleConfirmPasswordButton.addEventListener("click", () => {
  const type =
    confirmPasswordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmPasswordInput.setAttribute("type", type);
  toggleConfirmPasswordButton.textContent =
    type === "password" ? "Mostrar contraseña" : "Ocultar contraseña";
});
