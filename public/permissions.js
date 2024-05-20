import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
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

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    await setMenuPermissions(user);
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para establecer los permisos del menú
async function setMenuPermissions(user) {
  const email = user.email;
  const userUID = user.uid;
  const userDomain = email.split('@')[1].split('.')[0];

  if (email.startsWith("admin")) {
    showAllMenuItems();
  } else {
    const userDocRef = doc(db, `schools/${userDomain}/users/${userUID}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const permissions = userDoc.data().permissions || [];
      showMenuItems(permissions);
    } else {
      console.error("No se encontraron permisos para el usuario.");
    }
  }
}

// Mostrar todos los elementos del menú
function showAllMenuItems() {
  document.querySelectorAll('.sidebar a').forEach((item) => {
    item.style.display = "block";
  });
}

// Mostrar elementos del menú según los permisos
function showMenuItems(permissions) {
  const permissionToMenuItem = {
    'alumnos': 'dashboard-alumnos.html',
    'docentes': 'dashboard-docentes.html',
    'materias': 'dashboard-materias.html',
    'grupos': 'dashboard-grupos.html',
    'calificaciones': 'dashboard-calificaciones.html',
    'usuarios': 'dashboard-usuarios.html'
  };

  document.querySelectorAll('.sidebar a').forEach((item) => {
    const href = item.getAttribute('href');
    if (href === 'dashboard.html' || href === 'dashboard-perfil.html' || href === 'inicioDeSesion.html') {
      item.style.display = "block"; // Siempre mostrar Inicio, Perfil y Cerrar sesión
    } else if (Object.values(permissionToMenuItem).includes(href)) {
      const permission = Object.keys(permissionToMenuItem).find(key => permissionToMenuItem[key] === href);
      if (permissions.includes(permission)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    } else {
      item.style.display = "none";
    }
  });
}

// Función para cerrar sesión
async function logout() {
  try {
    await signOut(auth);
    window.location.href = "inicioDeSesion.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Error al cerrar sesión: " + error.message);
  }
}
