document.addEventListener('DOMContentLoaded', function () {
    const loadEl = document.querySelector('#load');
    // // The Firebase SDK is initialized and available here!
    //
    firebase.auth().onAuthStateChanged(user => {
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