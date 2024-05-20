import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
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

// Manejo de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    loadSubjects();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para agregar o actualizar una materia
document.getElementById("subjectForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const subjectName = document.getElementById("subjectName").value;
  const subjectCode = document.getElementById("subjectCode").value;
  const subjectDescription = document.getElementById("subjectDescription").value;
  const subjectCredits = document.getElementById("subjectCredits").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const subjectId = doc(collection(db, `schools/${domain}/subjects`)).id;

  await setDoc(doc(db, `schools/${domain}/subjects/${subjectId}`), {
    name: subjectName,
    code: subjectCode,
    description: subjectDescription,
    credits: subjectCredits
  });

  alert("Materia guardada exitosamente.");
  document.getElementById("subjectForm").reset();
  loadSubjects(); // Recargar la lista de materias
});

// Función para buscar materias por nombre completo
document.getElementById("searchButton").addEventListener("click", async () => {
  const subjectName = document.getElementById("searchSubjectName").value;

  if (!subjectName) {
    alert("Por favor, introduzca el nombre de la materia a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/subjects`), where("name", "==", subjectName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("subjectResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const subjectData = doc.data();
    resultsDiv.innerHTML += `<p>${subjectData.name}, ${subjectData.code}, ${subjectData.description}, ${subjectData.credits}</p>`;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron materias con ese nombre.</p>";
  }
});

// Función para eliminar una materia por nombre completo
document.getElementById("deleteButton").addEventListener("click", async () => {
  const subjectName = document.getElementById("deleteSubjectName").value;

  if (!subjectName) {
    alert("Por favor, introduzca el nombre de la materia a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/subjects`), where("name", "==", subjectName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron materias con ese nombre.");
    return;
  }

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  alert("Materia eliminada exitosamente.");
  loadSubjects(); // Recargar la lista de materias
});

// Función para cargar y mostrar todas las materias
async function loadSubjects() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const subjectsCollection = collection(db, `schools/${domain}/subjects`);
  const querySnapshot = await getDocs(subjectsCollection);

  const subjectsTableBody = document.getElementById("subjectsTable").querySelector("tbody");
  subjectsTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const subjectData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${subjectData.name}</td>
      <td>${subjectData.code}</td>
      <td>${subjectData.description}</td>
      <td>${subjectData.credits}</td>
    `;
    subjectsTableBody.appendChild(row);
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
