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
    loadTeachers();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para agregar o actualizar un docente
document.getElementById("teacherForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherName = document.getElementById("teacherName").value;
  const teacherDOB = document.getElementById("teacherDOB").value;
  const teacherCURP = document.getElementById("teacherCURP").value;
  const teacherAddress = document.getElementById("teacherAddress").value;
  const teacherPhone = document.getElementById("teacherPhone").value;
  const teacherProfessionalID = document.getElementById("teacherProfessionalID").value;
  const teacherSpecialty = document.getElementById("teacherSpecialty").value;
  const teacherDepartment = document.getElementById("teacherDepartment").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const teacherId = doc(collection(db, `schools/${domain}/teachers`)).id;

  await setDoc(doc(db, `schools/${domain}/teachers/${teacherId}`), {
    name: teacherName,
    dob: teacherDOB,
    curp: teacherCURP,
    address: teacherAddress,
    phone: teacherPhone,
    professionalID: teacherProfessionalID,
    specialty: teacherSpecialty,
    department: teacherDepartment
  });

  alert("Docente guardado exitosamente.");
  document.getElementById("teacherForm").reset();
  loadTeachers(); // Recargar la lista de docentes
});

// Función para buscar docentes por nombre completo
document.getElementById("searchButton").addEventListener("click", async () => {
  const teacherName = document.getElementById("searchTeacherName").value;

  if (!teacherName) {
    alert("Por favor, introduzca el nombre del docente a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/teachers`), where("name", "==", teacherName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("teacherResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const teacherData = doc.data();
    resultsDiv.innerHTML += `<p>${teacherData.name}, ${teacherData.dob}, ${teacherData.curp}, ${teacherData.address}, ${teacherData.phone}, ${teacherData.professionalID}, ${teacherData.specialty}, ${teacherData.department}</p>`;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron docentes con ese nombre.</p>";
  }
});

// Función para eliminar un docente por nombre completo
document.getElementById("deleteButton").addEventListener("click", async () => {
  const teacherName = document.getElementById("deleteTeacherName").value;

  if (!teacherName) {
    alert("Por favor, introduzca el nombre del docente a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/teachers`), where("name", "==", teacherName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron docentes con ese nombre.");
    return;
  }

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  alert("Docente eliminado exitosamente.");
  loadTeachers(); // Recargar la lista de docentes
});

// Función para cargar y mostrar todos los docentes
async function loadTeachers() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const teachersCollection = collection(db, `schools/${domain}/teachers`);
  const querySnapshot = await getDocs(teachersCollection);

  const teachersTableBody = document.getElementById("teachersTable").querySelector("tbody");
  teachersTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const teacherData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teacherData.name}</td>
      <td>${teacherData.dob}</td>
      <td>${teacherData.curp}</td>
      <td>${teacherData.address}</td>
      <td>${teacherData.phone}</td>
      <td>${teacherData.professionalID}</td>
      <td>${teacherData.specialty}</td>
      <td>${teacherData.department}</td>
    `;
    teachersTableBody.appendChild(row);
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
