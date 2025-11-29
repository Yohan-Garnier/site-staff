// js/auth-guard.js
// Protection universelle pour toutes les pages staff
// Compatible avec Netlify, mobile, et Firebase COMPAT

(function () {
  // 🔥 Charger Firebase si ce n'est pas déjà fait
  if (typeof firebase === 'undefined') {
    console.error('Firebase non chargé. Incluez firebase-app-compat.js et firebase-auth-compat.js dans votre HTML.');
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyBcB45diMSO7rWWzp25EdqLHrhgENM7jj0",
    authDomain: "marseille-rp-73905.firebaseapp.com",
    projectId: "marseille-rp-73905",
    storageBucket: "marseille-rp-73905.firebasestorage.app",
    messagingSenderId: "633653493501",
    appId: "1:633653493501:web:94210bcc5a99d6fd114894"
  };

  // Initialiser Firebase (idempotent)
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    // Ignore si déjà initialisé
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // 🔐 Fonction de déconnexion globale
  window.signOut = function () {
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  };

  // 🛡️ Fonction de protection principale
  window.protectPage = function (userCallback = null) {
    auth.onAuthStateChanged(async (user) => {
      const currentPath = window.location.pathname;

      if (user) {
        // Liste des pages accessibles SANS vérification de mot de passe
        const ALLOWED_PAGES = [
          '/changement-mdp-obligatoire.html'
        ];

        const isAllowedPage = ALLOWED_PAGES.some(page => currentPath.endsWith(page));

        if (!isAllowedPage) {
          // Vérifier si le changement de mot de passe est requis
          try {
            const docSnap = await db.collection('users').doc(user.uid).get();
            if (docSnap.exists && docSnap.data().mustChangePassword === true) {
              // 🔒 Bloquer l'accès → rediriger vers changement obligatoire
              window.location.href = 'changement-mdp-obligatoire.html';
              return;
            }
          } catch (error) {
            console.warn('Erreur Firestore (lecture mustChangePassword) :', error);
            // Optionnel : bloquer ou laisser passer
          }
        }

        // ✅ Accès autorisé
        if (userCallback) userCallback(user);
      } else {
        // ❌ Non connecté → rediriger vers login
        window.location.href = 'login.html';
      }
    });
  };
})();