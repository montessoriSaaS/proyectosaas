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
    loadStudents();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para agregar o actualizar un alumno
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value;
  const studentDOB = document.getElementById("studentDOB").value;
  const studentCURP = document.getElementById("studentCURP").value;
  const studentAddress = document.getElementById("studentAddress").value;
  const studentPhone = document.getElementById("studentPhone").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const studentId = doc(collection(db, `schools/${domain}/students`)).id;

  await setDoc(doc(db, `schools/${domain}/students/${studentId}`), {
    name: studentName,
    dob: studentDOB,
    curp: studentCURP,
    address: studentAddress,
    phone: studentPhone
  });

  alert("Alumno guardado exitosamente.");
  document.getElementById("studentForm").reset();
  loadStudents(); // Recargar la lista de alumnos
});

// Función para buscar alumnos por nombre completo
document.getElementById("searchButton").addEventListener("click", async () => {
  const studentName = document.getElementById("searchStudentName").value;

  if (!studentName) {
    alert("Por favor, introduzca el nombre del alumno a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/students`), where("name", "==", studentName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("studentResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const studentData = doc.data();
    resultsDiv.innerHTML += `<p>${studentData.name}, ${studentData.dob}, ${studentData.curp}, ${studentData.address}, ${studentData.phone}</p>`;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron alumnos con ese nombre.</p>";
  }
});

// Función para eliminar un alumno por nombre completo
document.getElementById("deleteButton").addEventListener("click", async () => {
  const studentName = document.getElementById("deleteStudentName").value;

  if (!studentName) {
    alert("Por favor, introduzca el nombre del alumno a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/students`), where("name", "==", studentName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron alumnos con ese nombre.");
    return;
  }

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  alert("Alumno eliminado exitosamente.");
  loadStudents(); // Recargar la lista de alumnos
});

// Función para cargar y mostrar todos los alumnos
async function loadStudents() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const studentsCollection = collection(db, `schools/${domain}/students`);
  const querySnapshot = await getDocs(studentsCollection);

  const studentsTableBody = document.getElementById("studentsTable").querySelector("tbody");
  studentsTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const studentData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${studentData.name}</td>
      <td>${studentData.dob}</td>
      <td>${studentData.curp}</td>
      <td>${studentData.address}</td>
      <td>${studentData.phone}</td>
    `;
    studentsTableBody.appendChild(row);
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
