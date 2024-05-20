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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    await populateSelects();
    loadGrades();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para poblar los selectores de alumnos, docentes, materias y grupos
async function populateSelects() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];

  // Poblar select de alumnos
  const studentsSelect = document.getElementById("gradeStudent");
  const studentsSnapshot = await getDocs(collection(db, `schools/${domain}/students`));
  studentsSnapshot.forEach((doc) => {
    const student = doc.data();
    const option = document.createElement("option");
    option.value = student.name; // Guardar el nombre del estudiante
    option.textContent = student.name;
    studentsSelect.appendChild(option);
  });

  // Poblar select de docentes
  const teachersSelect = document.getElementById("gradeTeacher");
  const teachersSnapshot = await getDocs(collection(db, `schools/${domain}/teachers`));
  teachersSnapshot.forEach((doc) => {
    const teacher = doc.data();
    const option = document.createElement("option");
    option.value = teacher.name; // Guardar el nombre del docente
    option.textContent = teacher.name;
    teachersSelect.appendChild(option);
  });

  // Poblar select de materias
  const subjectsSelect = document.getElementById("gradeSubject");
  const subjectsSnapshot = await getDocs(collection(db, `schools/${domain}/subjects`));
  subjectsSnapshot.forEach((doc) => {
    const subject = doc.data();
    const option = document.createElement("option");
    option.value = subject.name; // Guardar el nombre de la materia
    option.textContent = subject.name;
    subjectsSelect.appendChild(option);
  });

  // Poblar select de grupos
  const groupsSelect = document.getElementById("gradeGroup");
  const groupsSnapshot = await getDocs(collection(db, `schools/${domain}/groups`));
  groupsSnapshot.forEach((doc) => {
    const group = doc.data();
    const option = document.createElement("option");
    option.value = group.name; // Guardar el nombre del grupo
    option.textContent = group.name;
    groupsSelect.appendChild(option);
  });
}

// Función para agregar o actualizar una calificación
document.getElementById("gradeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const gradeStudent = document.getElementById("gradeStudent").value;
  const gradeTeacher = document.getElementById("gradeTeacher").value;
  const gradeSubject = document.getElementById("gradeSubject").value;
  const gradeGroup = document.getElementById("gradeGroup").value;
  const gradeValue = document.getElementById("gradeValue").value;

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const gradeId = doc(collection(db, `schools/${domain}/grades`)).id;

  await setDoc(doc(db, `schools/${domain}/grades/${gradeId}`), {
    student: gradeStudent,
    teacher: gradeTeacher,
    subject: gradeSubject,
    group: gradeGroup,
    value: gradeValue
  });

  alert("Calificación guardada exitosamente.");
  document.getElementById("gradeForm").reset();
  loadGrades(); // Recargar la lista de calificaciones
});

// Función para buscar calificaciones por nombre de alumno
document.getElementById("searchButton").addEventListener("click", async () => {
  const gradeStudent = document.getElementById("searchGradeStudent").value;

  if (!gradeStudent) {
    alert("Por favor, introduzca el nombre del alumno a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/grades`), where("student", "==", gradeStudent));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("gradeResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const gradeData = doc.data();
    resultsDiv.innerHTML += `<p>${gradeData.student}, ${gradeData.teacher}, ${gradeData.subject}, ${gradeData.group}, ${gradeData.value}</p>`;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron calificaciones para ese alumno.</p>";
  }
});

// Función para eliminar una calificación por nombre de alumno
document.getElementById("deleteButton").addEventListener("click", async () => {
  const gradeStudent = document.getElementById("deleteGradeStudent").value;

  if (!gradeStudent) {
    alert("Por favor, introduzca el nombre del alumno para eliminar la calificación.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/grades`), where("student", "==", gradeStudent));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron calificaciones para ese alumno.");
    return;
  }

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  alert("Calificación eliminada exitosamente.");
  loadGrades(); // Recargar la lista de calificaciones
});

// Función para cargar y mostrar todas las calificaciones
async function loadGrades() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const gradesCollection = collection(db, `schools/${domain}/grades`);
  const querySnapshot = await getDocs(gradesCollection);

  const gradesTableBody = document.getElementById("gradesTable").querySelector("tbody");
  gradesTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const gradeData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${gradeData.student}</td>
      <td>${gradeData.teacher}</td>
      <td>${gradeData.subject}</td>
      <td>${gradeData.group}</td>
      <td>${gradeData.value}</td>
    `;
    gradesTableBody.appendChild(row);
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
