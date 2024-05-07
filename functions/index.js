/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {logger} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
// const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");

// initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

/* exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
}); */

const functions = require("firebase-functions");
// const functions = require("firebase-admin/functions");
const admin = require("firebase-admin/app");
// const auth = require("firebase-admin/auth");
admin.initializeApp();

exports.addDomainOnUserCreation =
functions.auth.user().onCreate(async (user) => {
  const userEmail = user.email;
  if (!userEmail) {
    console.error("El usuario no tiene un correo electrónico válido.");
    return null;
  }

  const emailDomain = userEmail.split("@")[1].split(".")[0];

  try {
    const tenantRef = admin.firestore()
        .collection("tenantMappings").doc(emailDomain);
    const doc = await tenantRef.get();

    if (!doc.exists) {
      // Si el dominio no existe,
      // agrega un documento con el dominio como ID
      await tenantRef.set({
        domain: emailDomain,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Se agregó el dominio " +
      emailDomain + " a tenantMappings.");

      // Aquí puedes realizar otras acciones
      // que desees al crear un nuevo usuario
      console.log("Se ha creado un nuevo usuario:", userEmail);

      return null; // La función se ejecutó correctamente
    } else {
      console.log("El dominio " + emailDomain +
      " ya existe en tenantMappings.");
      return null;
      // La función se ejecutó correctamente
    }
  } catch (error) {
    console.error("Error al procesar la creación de usuario:", error);
    throw new Error("Error al procesar la creación de usuario: " +
    error.message);
  }
});

exports.addAdminRole = functions.https.onCall((data, context) => {
  // Obtener el UID del usuario y asignar el rol de admin
  const uid = data.uid;
  return admin.auth().setCustomUserClaims(uid, {admin: true})
      .then(() => {
        return {message: `Éxito! ${uid} ha sido hecho administrador.`};
      })
      .catch((error) => {
        return {error: error.message};
      });
});
/* exports.setTenantClaim = functions.auth.user().onCreate((user) => {
  const email = user.email || '';
  const tenantId = email.split('@')[1].split('.')[0];
  return admin.auth().setCustomUserClaims(user.uid, {tenantId: tenantId});
}); */

/* exports.signIn = functions.https.onRequest(async (req, res) => {
  try {
    const {tenant, email, password} = req.body;

    // Obtener el tenant ID basado en el nombre del inquilino
    const tenantId = await getTenantIdFromName(tenant);

    // Autenticar al usuario dentro del inquilino especificado
    const userCredential = await admin
        .auth()
        .tenantManager()
        .signInWithEmailAndPassword(tenantId, email, password);
    const user = userCredential.user;

    res.status(200).json({user});
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(401).send("Credenciales inválidas");
  }
}); */

/**
 * Obtiene el ID del inquilino basado en su nombre.
 * @param {string} tenantName El nombre del inquilino.
 * @return {string|null}
 * El ID del inquilino si se encuentra, o null si no se encuentra.
 */
/* async function getTenantIdFromName(tenantName) {
  try {
    const tenantRecords = await admin.auth().tenants.list();

    for (const tenant of tenantRecords.tenants) {
      if (tenant.displayName === tenantName) {
        return tenant.tenantId;
      }
    }
    return null; // Si no se encuentra el inquilino, retorna null
  } catch (error) {
    console.error("Error al obtener la lista de inquilinos:", error);
    return null;
  }
}
*/
