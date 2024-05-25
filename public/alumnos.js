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
    loadStudents();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para agregar o actualizar un alumno
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];

  const studentId = document.getElementById("studentId").value || doc(collection(db, `schools/${domain}/students`)).id;
  const studentFirstName = document.getElementById("studentFirstName").value;
  const studentLastName = document.getElementById("studentLastName").value;
  const studentSecondLastName = document.getElementById("studentSecondLastName").value;
  const studentDOB = document.getElementById("studentDOB").value;
  const studentCURP = document.getElementById("studentCURP").value;
  const studentAddress = document.getElementById("studentAddress").value;
  const studentMotherName = document.getElementById("studentMotherName").value;
  const studentMotherContact = document.getElementById("studentMotherContact").value;
  const studentFatherName = document.getElementById("studentFatherName").value;
  const studentFatherContact = document.getElementById("studentFatherContact").value;
  const studentNationality = document.getElementById("studentNationality").value;
  const studentObservations = document.getElementById("studentObservations").value;

  const studentRef = doc(db, `schools/${domain}/students/${studentId}`);

  await setDoc(studentRef, {
    id: studentId,
    firstName: studentFirstName,
    lastName: studentLastName,
    secondLastName: studentSecondLastName,
    dob: studentDOB,
    curp: studentCURP,
    address: studentAddress,
    motherName: studentMotherName,
    motherContact: studentMotherContact,
    fatherName: studentFatherName,
    fatherContact: studentFatherContact,
    nationality: studentNationality,
    observations: studentObservations
  });

  alert("Alumno guardado exitosamente.");
  document.getElementById("studentForm").reset();
  loadStudents(); // Recargar la lista de alumnos
});

// Función para buscar alumnos por nombre
document.getElementById("searchButton").addEventListener("click", async () => {
  const searchName = document.getElementById("searchStudentName").value;

  if (!searchName) {
    alert("Por favor, introduzca el nombre del alumno a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/students`), where("firstName", "==", searchName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("studentResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const studentData = doc.data();
    resultsDiv.innerHTML += `
      <div class="student-card">
        <h3>${studentData.firstName} ${studentData.lastName} ${studentData.secondLastName}</h3>
        <p>ID: ${studentData.id}</p>
        <p>Fecha de Nacimiento: ${studentData.dob}</p>
        <p>CURP: ${studentData.curp}</p>
        <p>Dirección: ${studentData.address}</p>
        <p>Mamá/Tutor 1: ${studentData.motherName}</p>
        <p>Contacto Mamá/Tutor 1: ${studentData.motherContact}</p>
        <p>Papá/Tutor 2: ${studentData.fatherName}</p>
        <p>Contacto Papá/Tutor 2: ${studentData.fatherContact}</p>
        <p>Nacionalidad: ${studentData.nationality}</p>
        <p>Observaciones: ${studentData.observations}</p>
        <button onclick="populateModifyForm('${studentData.id}')">Modificar</button>
      </div>
    `;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron alumnos con ese nombre.</p>";
  }
});

// Función para cargar la información de un alumno en el formulario de modificación
window.populateModifyForm = async function(studentId) {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const studentDocRef = doc(db, `schools/${domain}/students/${studentId}`);
  const studentDoc = await getDoc(studentDocRef);

  if (studentDoc.exists()) {
    const studentData = studentDoc.data();
    document.getElementById("modifyStudentId").value = studentId;
    document.getElementById("modifyStudentFirstName").value = studentData.firstName;
    document.getElementById("modifyStudentLastName").value = studentData.lastName;
    document.getElementById("modifyStudentSecondLastName").value = studentData.secondLastName;
    document.getElementById("modifyStudentDOB").value = studentData.dob;
    document.getElementById("modifyStudentCURP").value = studentData.curp;
    document.getElementById("modifyStudentAddress").value = studentData.address;
    document.getElementById("modifyStudentMotherName").value = studentData.motherName;
    document.getElementById("modifyStudentMotherContact").value = studentData.motherContact;
    document.getElementById("modifyStudentFatherName").value = studentData.fatherName;
    document.getElementById("modifyStudentFatherContact").value = studentData.fatherContact;
    document.getElementById("modifyStudentNationality").value = studentData.nationality;
    document.getElementById("modifyStudentObservations").value = studentData.observations;
  }
}

// Función para modificar la información de un alumno
document.getElementById("modifyStudentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentId = document.getElementById("modifyStudentId").value;
  const studentFirstName = document.getElementById("modifyStudentFirstName").value;
  const studentLastName = document.getElementById("modifyStudentLastName").value;
  const studentSecondLastName = document.getElementById("modifyStudentSecondLastName").value;
  const studentDOB = document.getElementById("modifyStudentDOB").value;
  const studentCURP = document.getElementById("modifyStudentCURP").value;
  const studentAddress = document.getElementById("modifyStudentAddress").value;
  const studentMotherName = document.getElementById("modifyStudentMotherName").value;
  const studentMotherContact = document.getElementById("modifyStudentMotherContact").value;
  const studentFatherName = document.getElementById("modifyStudentFatherName").value;
  const studentFatherContact = document.getElementById("modifyStudentFatherContact").value;
  const studentNationality = document.getElementById("modifyStudentNationality").value;
  const studentObservations = document.getElementById("modifyStudentObservations").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const studentRef = doc(db, `schools/${domain}/students/${studentId}`);

  await updateDoc(studentRef, {
    firstName: studentFirstName,
    lastName: studentLastName,
    secondLastName: studentSecondLastName,
    dob: studentDOB,
    curp: studentCURP,
    address: studentAddress,
    motherName: studentMotherName,
    motherContact: studentMotherContact,
    fatherName: studentFatherName,
    fatherContact: studentFatherContact,
    nationality: studentNationality,
    observations: studentObservations
  });

  alert("Información del alumno actualizada exitosamente.");
  document.getElementById("modifyStudentForm").reset();
  loadStudents(); // Recargar la lista de alumnos
});

// Función para eliminar un alumno por ID
document.getElementById("deleteButton").addEventListener("click", async () => {
  const deleteId = document.getElementById("deleteStudentId").value;

  if (!deleteId) {
    alert("Por favor, introduzca el ID del alumno a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const studentDocRef = doc(db, `schools/${domain}/students/${deleteId}`);
  const studentDoc = await getDoc(studentDocRef);

  if (!studentDoc.exists()) {
    alert("No se encontraron alumnos con ese ID.");
    return;
  }

  await deleteDoc(studentDocRef);
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
      <td>${studentData.id}</td>
      <td>${studentData.firstName}</td>
      <td>${studentData.lastName}</td>
      <td>${studentData.secondLastName}</td>
      <td>${studentData.dob}</td>
      <td>${studentData.curp}</td>
      <td>${studentData.address}</td>
      <td>${studentData.motherName}</td>
      <td>${studentData.motherContact}</td>
      <td>${studentData.fatherName}</td>
      <td>${studentData.fatherContact}</td>
      <td>${studentData.nationality}</td>
      <td>${studentData.observations}</td>
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
