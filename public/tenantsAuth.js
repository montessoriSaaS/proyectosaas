import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
//import { initializeApp } from 'firebase-admin/app';

const admin = require('firebase-admin');
const serviceAccount = require('./deskmontessori-a3cb2-firebase-adminsdk-8vcub-d70fb0e941.json'); // Update the path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Now you can use the Admin SDK to interact with Firebase services


const firebaseConfig = {
  apiKey: "AIzaSyAEy6y6RQvOsZWW1OHQMxwT7dLZvIzMV3I",
  authDomain: "deskmontessori-a3cb2.firebaseapp.com",
  projectId: "deskmontessori-a3cb2",
  storageBucket: "deskmontessori-a3cb2.appspot.com",
  messagingSenderId: "325693574028",
  appId: "1:325693574028:web:272bfa54294c335d6d64a9",
  measurementId: "G-RLJVEHLMY5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

var admin = require('firebase-admin');
// Initialize the default app
var admin = require('firebase-admin');
var applicationDefault = admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const serviceAccount = require('./deskmontessori-a3cb2-firebase-adminsdk-8vcub-d70fb0e941.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth1 = admin.auth();

async function listAllTenants() {
    let tenants = [];
    let listTenantsResult = await auth1.tenantManager().listTenants();
    tenants = tenants.concat(listTenantsResult.tenants);
  
    while (listTenantsResult.pageToken) {
      listTenantsResult = await auth1.tenantManager().listTenants(listTenantsResult.pageToken);
      tenants = tenants.concat(listTenantsResult.tenants);
    }
  
    return tenants;
  }
  
  listAllTenants()
    .then(tenants => {
      tenants.forEach(tenant => {
        console.log('Tenant ID:', tenant.tenantId);
        console.log('Tenant Name:', tenant.displayName);
        // Additional tenant details can be logged here
      });
    })
    .catch(error => {
      console.error('Error listing tenants:', error);
    });

if (!tenantId) {
  console.error("Tenant ID is required");
}

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const tenantId = document.getElementById("tenantId").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Signing in user:", tenantId, email, password);
    alert("Signing in user:", tenantId, email, password);

    // Assuming you set the tenant ID on auth instance, and have enabled multi-tenancy
    // This might require handling depending on how you've set up Identity Platform
    auth.tenantId = tenantId;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Signed in user:", user.tenantId);
        // Handle post-sign-in actions here
        console.log("Inicio de sesión exitoso", userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
        alert("Error en el inicio de sesión: Usuario o contraseña incorrectos");
        // Handle errors here
      });
  });
