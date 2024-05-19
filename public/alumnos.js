import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let studentsRef;

onAuthStateChanged(auth, (user) => {
  if (user && user.tenantId) {
    studentsRef = collection(db, `${user.tenantId}_students`);
  } else {
    console.log("No user signed in or tenant ID missing");
    // Opcional: redirigir al login
  }
});

document.getElementById("studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentId = document.getElementById("studentId").value;
  const studentName = document.getElementById("studentName").value;
  const studentAge = parseInt(document.getElementById("studentAge").value);

  try {
    if (studentId) {
      const studentDoc = doc(db, `${studentsRef.path}`, studentId);
      await updateDoc(studentDoc, { name: studentName, age: studentAge });
      console.log("Alumno actualizado");
    } else {
      await addDoc(studentsRef, { name: studentName, age: studentAge });
      console.log("Alumno agregado");
    }
  } catch (error) {
    console.error("Error al guardar datos del alumno:", error);
  }
});

document.getElementById("deleteButton").addEventListener("click", async () => {
  const studentId = document.getElementById("deleteStudentId").value;

  try {
    const studentDoc = doc(db, `${studentsRef.path}`, studentId);
    await deleteDoc(studentDoc);
    console.log("Alumno eliminado");
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
  }
});
