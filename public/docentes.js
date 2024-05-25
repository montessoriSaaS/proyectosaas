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
  deleteDoc,
  updateDoc
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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    loadDocentes();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para agregar o actualizar un docente
document.getElementById("docenteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];

  const docenteId = document.getElementById("docenteId").value || doc(collection(db, `schools/${domain}/docentes`)).id;
  const docenteFirstName = document.getElementById("docenteFirstName").value;
  const docenteLastName = document.getElementById("docenteLastName").value;
  const docenteSecondLastName = document.getElementById("docenteSecondLastName").value;
  const docenteDOB = document.getElementById("docenteDOB").value;
  const docenteCURP = document.getElementById("docenteCURP").value;
  const docenteAddress = document.getElementById("docenteAddress").value;
  const docenteNationality = document.getElementById("docenteNationality").value;
  const docenteCedula = document.getElementById("docenteCedula").value;
  const docenteContact = document.getElementById("docenteContact").value;
  const docenteEspecialidad = document.getElementById("docenteEspecialidad").value;

  const docenteRef = doc(db, `schools/${domain}/docentes/${docenteId}`);

  await setDoc(docenteRef, {
    id: docenteId,
    firstName: docenteFirstName,
    lastName: docenteLastName,
    secondLastName: docenteSecondLastName,
    dob: docenteDOB,
    curp: docenteCURP,
    address: docenteAddress,
    nationality: docenteNationality,
    cedula: docenteCedula,
    contact: docenteContact,
    especialidad: docenteEspecialidad
  });

  alert("Docente guardado exitosamente.");
  document.getElementById("docenteForm").reset();
  loadDocentes(); // Recargar la lista de docentes
});

// Función para buscar docentes por nombre
document.getElementById("searchButton").addEventListener("click", async () => {
  const searchName = document.getElementById("searchDocenteName").value;

  if (!searchName) {
    alert("Por favor, introduzca el nombre del docente a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/docentes`), where("firstName", "==", searchName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("docenteResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const docenteData = doc.data();
    resultsDiv.innerHTML += `
      <div class="docente-card">
        <h3>${docenteData.firstName} ${docenteData.lastName} ${docenteData.secondLastName}</h3>
        <p>ID: ${docenteData.id}</p>
        <p>Fecha de Nacimiento: ${docenteData.dob}</p>
        <p>CURP: ${docenteData.curp}</p>
        <p>Dirección: ${docenteData.address}</p>
        <p>Nacionalidad: ${docenteData.nationality}</p>
        <p>Cédula Profesional: ${docenteData.cedula}</p>
        <p>Contacto: ${docenteData.contact}</p>
        <p>Especialidad: ${docenteData.especialidad}</p>
        <button onclick="populateModifyForm('${docenteData.id}')">Modificar</button>
      </div>
    `;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron docentes con ese nombre.</p>";
  }
});

// Función para cargar la información de un docente en el formulario de modificación
window.populateModifyForm = async function(docenteId) {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const docenteDocRef = doc(db, `schools/${domain}/docentes/${docenteId}`);
  const docenteDoc = await getDoc(docenteDocRef);

  if (docenteDoc.exists()) {
    const docenteData = docenteDoc.data();
    document.getElementById("modifyDocenteId").value = docenteId;
    document.getElementById("modifyDocenteFirstName").value = docenteData.firstName;
    document.getElementById("modifyDocenteLastName").value = docenteData.lastName;
    document.getElementById("modifyDocenteSecondLastName").value = docenteData.secondLastName;
    document.getElementById("modifyDocenteDOB").value = docenteData.dob;
    document.getElementById("modifyDocenteCURP").value = docenteData.curp;
    document.getElementById("modifyDocenteAddress").value = docenteData.address;
    document.getElementById("modifyDocenteNationality").value = docenteData.nationality;
    document.getElementById("modifyDocenteCedula").value = docenteData.cedula;
    document.getElementById("modifyDocenteContact").value = docenteData.contact;
    document.getElementById("modifyDocenteEspecialidad").value = docenteData.especialidad;
  }
}

// Función para modificar la información de un docente
document.getElementById("modifyDocenteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const docenteId = document.getElementById("modifyDocenteId").value;
  const docenteFirstName = document.getElementById("modifyDocenteFirstName").value;
  const docenteLastName = document.getElementById("modifyDocenteLastName").value;
  const docenteSecondLastName = document.getElementById("modifyDocenteSecondLastName").value;
  const docenteDOB = document.getElementById("modifyDocenteDOB").value;
  const docenteCURP = document.getElementById("modifyDocenteCURP").value;
  const docenteAddress = document.getElementById("modifyDocenteAddress").value;
  const docenteNationality = document.getElementById("modifyDocenteNationality").value;
  const docenteCedula = document.getElementById("modifyDocenteCedula").value;
  const docenteContact = document.getElementById("modifyDocenteContact").value;
  const docenteEspecialidad = document.getElementById("modifyDocenteEspecialidad").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const docenteRef = doc(db, `schools/${domain}/docentes/${docenteId}`);

  await updateDoc(docenteRef, {
    firstName: docenteFirstName,
    lastName: docenteLastName,
    secondLastName: docenteSecondLastName,
    dob: docenteDOB,
    curp: docenteCURP,
    address: docenteAddress,
    nationality: docenteNationality,
    cedula: docenteCedula,
    contact: docenteContact,
    especialidad: docenteEspecialidad
  });

  alert("Información del docente actualizada exitosamente.");
  document.getElementById("modifyDocenteForm").reset();
  loadDocentes(); // Recargar la lista de docentes
});

// Función para eliminar un docente por ID
document.getElementById("deleteButton").addEventListener("click", async () => {
  const deleteId = document.getElementById("deleteDocenteId").value;

  if (!deleteId) {
    alert("Por favor, introduzca el ID del docente a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const docenteDocRef = doc(db, `schools/${domain}/docentes/${deleteId}`);
  const docenteDoc = await getDoc(docenteDocRef);

  if (!docenteDoc.exists()) {
    alert("No se encontraron docentes con ese ID.");
    return;
  }

  await deleteDoc(docenteDocRef);
  alert("Docente eliminado exitosamente.");
  loadDocentes(); // Recargar la lista de docentes
});

// Función para cargar y mostrar todos los docentes
async function loadDocentes() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const docentesCollection = collection(db, `schools/${domain}/docentes`);
  const querySnapshot = await getDocs(docentesCollection);

  const docentesTableBody = document.getElementById("docentesTable").querySelector("tbody");
  docentesTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const docenteData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${docenteData.id}</td>
      <td>${docenteData.firstName}</td>
      <td>${docenteData.lastName}</td>
      <td>${docenteData.secondLastName}</td>
      <td>${docenteData.dob}</td>
      <td>${docenteData.curp}</td>
      <td>${docenteData.address}</td>
      <td>${docenteData.nationality}</td>
      <td>${docenteData.cedula}</td>
      <td>${docenteData.contact}</td>
      <td>${docenteData.especialidad}</td>
    `;
    docentesTableBody.appendChild(row);
  });
}
