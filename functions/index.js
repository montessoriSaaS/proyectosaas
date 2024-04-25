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

exports.getTenants = functions.https.onRequest(async (req, res) => {
  try {
    const tenantId = req.query.tenantId;
    console.log(tenantId);
    // Obtener el ID del inquilino desde la consulta URL

    if (!tenantId) {
      res.status(400).send("ID del inquilino faltante en la consulta URL");
      return;
    }

    const tenantManager = admin.auth().tenantManager();
    // const tenantAuth = tenantManager.authForTenant(tenantId);

    const tenant = await tenantManager.getTenant(tenantId);
    res.status(200).json({tenant: tenant.toJSON()});
    console.log(tenant.toJSON());
  } catch (error) {
    console.error("Error al obtener información del inquilino:", error);
    res.status(500).send("Error al obtener información del inquilino");
  }
});

exports.createTenant = functions.https.onRequest(async (req, res) => {
  try {
    const {displayName} = req.body;

    const tenantConfig = {
      displayName,
      emailSignInConfig: {
        signInOption: "EMAIL_PASSWORD",
        allowPasswordSignup: true,
        requireDisplayName: true,
      },
    };

    const tenant = await admin
        .auth()
        .tenantManager()
        .createTenant(tenantConfig)
        .then((createdTenant) => {
          console.log(createdTenant.toJSON());
        });
    res.status(201).json({tenant});
  } catch (error) {
    console.error("Error al crear el inquilino:", error);
    res.status(500).send("Error al crear el inquilino");
  }
});

exports.addTenantClaim = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https
        .HttpsError("unauthenticated",
            "The function must be called while authenticated.");
  }

  const userEmail = data.email;
  if (!userEmail) {
    throw new functions.https
        .HttpsError("invalid-argument",
            "The function must be called with an email argument.");
  }

  const emailDomain = userEmail.split("@")[1].split(".")[0];

  try {
    const tenantRef = admin.firestore()
        .collection("tenantMappings").doc(emailDomain);
    const doc = await tenantRef.get();

    if (!doc.exists) {
      throw new functions.https
          .HttpsError("not-found",
              "Tenant mapping not found.");
    }

    // const tenantId = doc.data().tenantId;
    // await admin.auth()
    //    .setCustomUserClaims(context.auth.uid, {tenant_id: tenantId});
    // return {tenantId: tenantId};
    return admin.auth().setCustomUserClaims(data.email, data.uid, {tenantId: data.tenantId})
        .then(() => {
          return {message: `Tenant ID ${data.tenantId} 
          set for user ${data.uid}`};
        })
        .catch((error) => {
          console.error("Failed to set custom claims:", error);
          throw new functions.https
              .HttpsError("internal", "Unable to set custom claims.");
        });
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new functions.https
        .HttpsError("internal",
            "Unable to set custom claims.", error);
  }
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
