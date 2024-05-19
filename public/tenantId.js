// Importar los servicios necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser,
  updatePassword,
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

listUsers();

document
  .getElementById("userRegistrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const userEmail = document.getElementById("userEmail").value;
    const userPassword = document.getElementById("userPassword").value;
    const adminEmail = auth.currentUser ? auth.currentUser.email : null;
    const adminDomain = adminEmail.split("@")[1].split(".")[0];
    const userDomain = userEmail.split("@")[1].split(".")[0];

    if (adminDomain === userDomain) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userEmail,
          userPassword
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          tenantId: userDomain,
          email: userEmail,
          password: userPassword,
          permissions: collectPermissions(),
        });
        try {
          await signInWithEmailAndPassword(
            auth,
            prompt(
              "Para la confirmación.\n Por favor, ingresa el email de admin:"
            ),
            prompt("Por favor, ingresa la contraseña de admin:")
          );
          alert("Usuario registrado correctamente.");
          listUsers(); // Actualizar la lista de usuarios
        } catch (error) {
          alert("Vuelve a intentarlo");
        }
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error al registrar usuario: " + error.message);
      }
    } else {
      alert(
        "El correo electrónico del usuario debe estar en el mismo dominio que el del administrador."
      );
    }
  });

document
  .getElementById("modifyUserButton")
  .addEventListener("click", async () => {
    const userEmail = document.getElementById("userEmail").value;
    const newPassword = document.getElementById("userPassword").value;
    const userDoc = await getDocByEmail(userEmail);

    if (userDoc) {
      const userAuth = await signInWithEmailAndPassword(
        auth,
        userEmail,
        prompt("Por favor, ingresa la contraseña del usuario a modificar:")
      );
      const user = userAuth.user;

      // Actualizar la contraseña
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      // Actualizar otros datos en Firestore
      await updateDoc(doc(db, "users", userDoc.id), {
        permissions: collectPermissions(),
      });
      if (inicioSesionAdmin() == ture) {
        alert("Usuario modificado correctamente.");
      } else {
        inicioSesionAdmin();
      }
      alert("Usuario modificado correctamente.");
      listUsers(); // Actualizar la lista de usuarios
    } else {
      alert("Usuario no encontrado.");
    }
  });

document
  .getElementById("deleteUserButton")
  .addEventListener("click", async () => {
    const userEmail = document.getElementById("userEmailDelete").value;
    const userDoc = await getDocByEmail(userEmail);

    if (userDoc) {
      try {
        // Asegúrate de llamar correctamente a signInWithEmailAndPassword
        const userCredential = await signInWithEmailAndPassword(
          auth,
          userEmail,
          prompt(
            "Por favor, ingresa la contraseña de usuario para la eliminación:"
          )
        );
        const userToDelete = userCredential.user;

        // Procede a eliminar el usuario de Firebase Auth y Firestore
        await firebaseDeleteUser(userToDelete);
        await deleteDoc(doc(db, "users", userDoc.id));
        await signInWithEmailAndPassword(
          auth,
          prompt(
            "Para la confirmación.\n Por favor, ingresa el email de admin:"
          ),
          prompt("Por favor, ingresa la contraseña de admin:")
        );
        alert("Usuario eliminado correctamente.");
        listUsers(); // Actualizar la lista de usuarios
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar usuario: " + error.message);
      }
    } else {
      alert("Usuario no encontrado.");
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

// Función para listar todos los usuarios
async function listUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = ""; // Limpiar el contenido existente antes de actualizar

  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    const permissions = userData.permissions
      ? userData.permissions.join(", ")
      : "Sin permisos";
    usersList.innerHTML += `<tr><td>${userData.email}</td><td>${permissions}</td><td>${userData.password}</td></tr>`;
  });
}

// Función para recoger los permisos del formulario
function collectPermissions() {
  const permissions = [];
  document
    .querySelectorAll('input[name="permissions"]:checked')
    .forEach((checkbox) => {
      permissions.push(checkbox.value);
    });
  return permissions;
}

// Suponga que esta función obtiene un documento de usuario basado en el correo electrónico
async function getDocByEmail(email) {
  const usersSnapshot = await getDocs(collection(db, "users"));
  let userDoc = null;
  usersSnapshot.forEach((doc) => {
    if (doc.data().email === email) {
      userDoc = { id: doc.id, ...doc.data() };
    }
  });
  return userDoc;
}

async function inicioSesionAdmin() {
  try {
    alert("Vuelve a intentar");
    await signInWithEmailAndPassword(
      auth,
      prompt("Para la confirmación.\n Por favor, ingresa el email de admin:"),
      prompt("Por favor, ingresa la contraseña de admin:")
    );
    return true;
  } catch (error) {
    inicioSesionAdmin();
  }
}
