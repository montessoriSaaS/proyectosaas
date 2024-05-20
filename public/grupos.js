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
    loadGroups();
  } else {
    window.location.href = "inicioDeSesion.html";
  }
});

// Función para poblar los selectores de alumnos, docentes y materias
async function populateSelects() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];

  // Poblar select de alumnos
  const studentsSelect = document.getElementById("groupStudents");
  const studentsSnapshot = await getDocs(collection(db, `schools/${domain}/students`));
  studentsSnapshot.forEach((doc) => {
    const student = doc.data();
    const option = document.createElement("option");
    option.value = student.name; // Guardar el nombre del estudiante
    option.textContent = student.name;
    studentsSelect.appendChild(option);
  });

  // Poblar select de docentes
  const teachersSelect = document.getElementById("groupTeacher");
  const teachersSnapshot = await getDocs(collection(db, `schools/${domain}/teachers`));
  teachersSnapshot.forEach((doc) => {
    const teacher = doc.data();
    const option = document.createElement("option");
    option.value = teacher.name; // Guardar el nombre del docente
    option.textContent = teacher.name;
    teachersSelect.appendChild(option);
  });

  // Poblar select de materias
  const subjectsSelect = document.getElementById("groupSubject");
  const subjectsSnapshot = await getDocs(collection(db, `schools/${domain}/subjects`));
  subjectsSnapshot.forEach((doc) => {
    const subject = doc.data();
    const option = document.createElement("option");
    option.value = subject.name; // Guardar el nombre de la materia
    option.textContent = subject.name;
    subjectsSelect.appendChild(option);
  });
}

// Función para agregar o actualizar un grupo
document.getElementById("groupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const groupName = document.getElementById("groupName").value;
  const groupStudents = Array.from(document.getElementById("groupStudents").selectedOptions).map(option => option.value);
  const groupTeacher = document.getElementById("groupTeacher").value;
  const groupSubject = document.getElementById("groupSubject").value;
  const groupSchedule = document.getElementById("groupSchedule").value;
  const groupGrade = document.getElementById("groupGrade").value;
  const groupDays = Array.from(document.querySelectorAll("#groupDays input[type=checkbox]:checked")).map(input => input.value);

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const groupId = doc(collection(db, `schools/${domain}/groups`)).id;

  await setDoc(doc(db, `schools/${domain}/groups/${groupId}`), {
    name: groupName,
    students: groupStudents,
    teacher: groupTeacher,
    subject: groupSubject,
    schedule: groupSchedule,
    grade: groupGrade,
    days: groupDays
  });

  alert("Grupo guardado exitosamente.");
  document.getElementById("groupForm").reset();
  loadGroups(); // Recargar la lista de grupos
});

// Función para buscar grupos por nombre
document.getElementById("searchButton").addEventListener("click", async () => {
  const groupName = document.getElementById("searchGroupName").value;

  if (!groupName) {
    alert("Por favor, introduzca el nombre del grupo a buscar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/groups`), where("name", "==", groupName));

  const querySnapshot = await getDocs(q);
  const resultsDiv = document.getElementById("groupResults");
  resultsDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const groupData = doc.data();
    resultsDiv.innerHTML += `<p>${groupData.name}, ${groupData.students.join(", ")}, ${groupData.teacher}, ${groupData.subject}, ${groupData.schedule}, ${groupData.grade}, ${groupData.days.join(", ")}</p>`;
  });

  if (querySnapshot.empty) {
    resultsDiv.innerHTML = "<p>No se encontraron grupos con ese nombre.</p>";
  }
});

// Función para eliminar un grupo por nombre
document.getElementById("deleteButton").addEventListener("click", async () => {
  const groupName = document.getElementById("deleteGroupName").value;

  if (!groupName) {
    alert("Por favor, introduzca el nombre del grupo a eliminar.");
    return;
  }

  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const q = query(collection(db, `schools/${domain}/groups`), where("name", "==", groupName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron grupos con ese nombre.");
    return;
  }

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  alert("Grupo eliminado exitosamente.");
  loadGroups(); // Recargar la lista de grupos
});

// Función para cargar y mostrar todos los grupos
async function loadGroups() {
  const user = auth.currentUser;
  const domain = user.email.split("@")[1].split(".")[0];
  const groupsCollection = collection(db, `schools/${domain}/groups`);
  const querySnapshot = await getDocs(groupsCollection);

  const groupsTableBody = document.getElementById("groupsTable").querySelector("tbody");
  groupsTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const groupData = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${groupData.name}</td>
      <td>${groupData.students.join(", ")}</td>
      <td>${groupData.teacher}</td>
      <td>${groupData.subject}</td>
      <td>${groupData.schedule}</td>
      <td>${groupData.grade}</td>
      <td>${groupData.days.join(", ")}</td>
    `;
    groupsTableBody.appendChild(row);
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
