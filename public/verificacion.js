 // verificacion.js
 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
 import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

 // Your web app's Firebase configuration
 const firebaseConfig = {
   apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
   authDomain: "deskmontessori-a3cb2.firebaseapp.com",
   projectId: "deskmontessori-a3cb2",
   storageBucket: "deskmontessori-a3cb2.appspot.com",
   messagingSenderId: "325693574028",
   appId: "1:325693574028:web:272bfa54294c335d6d64a9",
   measurementId: "G-RLJVEHLMY5",
 };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);

 // Verify authentication state
 document.addEventListener('DOMContentLoaded', function () {
   const loadEl = document.querySelector('#load');

   onAuthStateChanged(auth, user => {
     if (user != null) {
       console.log(user.email);
       console.log("Logged in!");
     } else {
       console.log("No user");
     }
   });

   try {
     loadEl.textContent = `Sitio web actualizado y sin errores`;
   } catch (e) {
     console.error(e);
     loadEl.textContent = 'Error en sitio web, contactar a mantenimiento';
   }
 });