import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import {
  getFirestore,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  collection,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

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

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    listSchools();
  } else {
    window.location.href = "gestionEscuelasInicioSesion.html";
  }
});

// Función para listar las escuelas registradas
async function listSchools() {
  const schoolsList = document
    .getElementById("schoolsList")
    .querySelector("tbody");
  schoolsList.innerHTML = ""; // Limpiar el contenido existente antes de actualizar

  try {
    const querySnapshot = await getDocs(collection(db, "schools"));
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });
    console.log("Intentando obtener la colección de escuelas...");
    const schoolsCollection = await getDocs(collection(db, "schools"));

    if (schoolsCollection.empty) {
      console.log("No se encontraron escuelas.");
      return;
    }

    console.log("Escuelas encontradas:");
    for (const schoolDomainDoc of schoolsCollection.docs) {
      const schoolDomain = schoolDomainDoc.id;
      console.log(`Dominio de la escuela: ${schoolDomain}`);

      const adminDocs = await getDocs(
        query(collection(db, `schools/${schoolDomain}/admins`))
      );

      for (const adminDoc of adminDocs.docs) {
        const adminData = adminDoc.data();
        const adminEmail = adminData.adminEmail || "Email no encontrado";

        const usersSnapshot = await getDocs(
          collection(db, `schools/${schoolDomain}/users`)
        );
        const userCount = usersSnapshot.size;

        // Obtener el estado de la suscripción
        const subscriptionsSnapshot = await getDocs(
          collection(db, `customers/${adminDoc.id}/subscriptions`)
        );
        let schoolStatus = "Sin suscripción";
        subscriptionsSnapshot.forEach((subDoc) => {
          const subscriptionData = subDoc.data();
          const currentPeriodEnd =
            subscriptionData.current_period_end?.seconds * 1000 || 0;
          const now = Date.now();
          if (now < currentPeriodEnd) {
            schoolStatus = "Activa";
          } else {
            schoolStatus = "Suspendida";
          }
        });

        schoolsList.innerHTML += `
          <tr>
            <td>${adminEmail}</td>
            <td>${userCount}</td>
            <td>${schoolStatus}</td>
            <td>
              <button onclick="modifySchool('${schoolDomain}')">Modificar</button>
              <br>
              <!-- <button onclick="deleteSchool('${schoolDomain}')">Eliminar</button> -->
            </td>
          </tr>
        `;
      }
    }
  } catch (error) {
    console.error("Error al listar las escuelas:", error);
  }
}

// Función para eliminar una escuela
async function deleteSchool(schoolDomain) {
  try {
    // Eliminar los usuarios de la escuela
    const usersSnapshot = await getDocs(
      collection(db, `schools/${schoolDomain}/users`)
    );
    usersSnapshot.forEach(async (userDoc) => {
      await deleteDoc(doc(db, `schools/${schoolDomain}/users/${userDoc.id}`));
    });

    // Eliminar las suscripciones de la escuela
    const subscriptionsSnapshot = await getDocs(
      collection(db, `customers/${schoolDomain}/subscriptions`)
    );
    subscriptionsSnapshot.forEach(async (subDoc) => {
      await deleteDoc(
        doc(db, `customers/${schoolDomain}/subscriptions/${subDoc.id}`)
      );
    });

    // Eliminar el documento del administrador
    const adminDocs = await getDocs(
      collection(db, `schools/${schoolDomain}/admins`)
    );
    adminDocs.forEach(async (adminDoc) => {
      await deleteDoc(doc(db, `schools/${schoolDomain}/admins/${adminDoc.id}`));
    });

    alert("Escuela eliminada correctamente.");
    listSchools();
  } catch (error) {
    console.error("Error al eliminar escuela:", error);
    alert("Error al eliminar escuela: " + error.message);
  }
}

// Función para modificar una escuela (esto puede incluir lógica adicional según sea necesario)
function modifySchool(schoolDomain) {
  alert(`Función de modificación para la escuela con dominio: ${schoolDomain}`);
  // Aquí puedes implementar la lógica para modificar la escuela
}

// Función para cerrar sesión
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "gestionEscuelasInicioSesion.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Error al cerrar sesión: " + error.message);
  }
});
