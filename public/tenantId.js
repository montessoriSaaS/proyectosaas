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
  getDoc
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

// Variables globales para almacenar las credenciales del administrador
let adminEmail = null;
let adminPassword = null;

listUsers();
fetchAdminCredentials();

// Función para obtener las credenciales del administrador y almacenarlas en variables globales
async function fetchAdminCredentials() {
  const user = auth.currentUser;
  if (user) {
    const adminDomain = user.email.split("@")[1].split(".")[0];
    const adminCredentialSnapshot = await getDocs(collection(db, `schools/${adminDomain}/admins`));
    adminCredentialSnapshot.forEach((doc) => {
      if (doc.exists()) {
        const adminData = doc.data();
        adminEmail = adminData.adminEmail;
        adminPassword = adminData.password;
      }
    });
    if (!adminEmail || !adminPassword) {
      throw new Error("No se encontraron las credenciales del administrador.");
    }
  }
}

// Función para listar los usuarios registrados dentro de la escuela
async function listUsers() {
  const user = auth.currentUser;
  if (!user) return;

  const domain = user.email.split("@")[1].split(".")[0];
  const usersSnapshot = await getDocs(collection(db, `schools/${domain}/users`));
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = ""; // Limpiar el contenido existente antes de actualizar

  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    const permissions = userData.permissions ? userData.permissions.join(", ") : "Sin permisos";
    usersList.innerHTML += `<tr><td>${userData.email}</td><td>${permissions}</td><td>${userData.password}</td></tr>`;
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    await fetchAdminCredentials();
    listUsers();
  } else {
    window.location.href = "dashboard-usuarios.html";
  }
});

// Registrar a los usuarios
document.getElementById("userRegistrationForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  const userEmail = document.getElementById("userEmail").value;
  const userPassword = document.getElementById("userPassword").value;
  const adminDomain = adminEmail.split("@")[1].split(".")[0];
  const userDomain = userEmail.split("@")[1].split(".")[0];

  if (adminDomain !== userDomain) {
    alert("El correo electrónico del usuario debe estar en el mismo dominio que el del administrador.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
    const newUser = userCredential.user;
    await setDoc(doc(db, `schools/${adminDomain}/users`, newUser.uid), {
      tenantId: userDomain,
      email: userEmail,
      password: userPassword,
      permissions: collectPermissions(),
    });

    // Reautenticar al administrador
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    alert("Usuario registrado correctamente.");
    listUsers();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Error al registrar usuario: " + error.message);
  }
});

// Modificar un usuario
document.getElementById("modifyUserButton").addEventListener("click", async () => {
  const userEmail = document.getElementById("userEmail").value;
  const newPassword = document.getElementById("userPassword").value;

  try {
    const userDoc = await getDocByEmail(userEmail);
    if (!userDoc) {
      alert("Usuario no encontrado.");
      return;
    }

    // Obtener la contraseña actual del usuario de Firestore
    const userPasswordDoc = await getDoc(doc(db, `schools/${userDoc.tenantId}/users/${userDoc.id}`));
    const userPassword = userPasswordDoc.data().password;

    // Autenticar al usuario para poder cambiar su contraseña
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;

    // Actualizar la contraseña
    if (newPassword) {
      await updatePassword(user, newPassword);
    }

    // Actualizar otros datos en Firestore
    await updateDoc(doc(db, `schools/${userDoc.tenantId}/users/${user.uid}`), {
      permissions: collectPermissions(),
    });

    // Reautenticar al administrador
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    alert("Usuario modificado correctamente.");
    listUsers();
  } catch (error) {
    console.error("Error al modificar usuario:", error);
    alert("Error al modificar usuario: " + error.message);
  }
});

// Eliminar un usuario
document.getElementById("deleteUserButton").addEventListener("click", async () => {
  const userEmail = document.getElementById("userEmailDelete").value;

  try {
    const userDoc = await getDocByEmail(userEmail);
    if (!userDoc) {
      alert("Usuario no encontrado.");
      return;
    }

    // Obtener la contraseña actual del usuario de Firestore
    const userPasswordDoc = await getDoc(doc(db, `schools/${userDoc.tenantId}/users/${userDoc.id}`));
    const userPassword = userPasswordDoc.data().password;
    console.log(userPassword);

    // Autenticar al usuario para poder eliminar su cuenta
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const userToDelete = userCredential.user;

    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    // Proceder a eliminar el usuario de Firebase Auth y Firestore
    await deleteDoc(doc(db, `schools/${userDoc.tenantId}/users/${userToDelete.uid}`));
    await firebaseDeleteUser(userToDelete);

    await signInWithEmailAndPassword(auth, adminEmail, adminPassword); 

    alert("Usuario eliminado correctamente.");
    window.location.href = "dashboard-usuarios.html";
    listUsers();

    // Reautenticar al administrador
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    window.location.href = "dashboard-usuarios.html";    
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
});

document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("userPassword");
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  document.getElementById("togglePassword").textContent = type === "password" ? "Mostrar contraseña" : "Ocultar contraseña";
});

// Función para recoger los permisos del formulario
function collectPermissions() {
  const permissions = [];
  document.querySelectorAll('input[name="permissions"]:checked').forEach((checkbox) => {
    permissions.push(checkbox.value);
  });
  return permissions;
}

// Suponga que esta función obtiene un documento de usuario basado en el correo electrónico
async function getDocByEmail(email) {
  const domain = email.split("@")[1].split(".")[0];
  const usersSnapshot = await getDocs(collection(db, `schools/${domain}/users`));
  let userDoc = null;

  usersSnapshot.forEach((doc) => {
    if (doc.data().email === email) {
      userDoc = { id: doc.id, tenantId: domain, ...doc.data() };
    }
  });

  return userDoc;
}
