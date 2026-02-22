import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAC6_Dh5dHCEqP1omZxFMeYiiSphEMDBfM",
  authDomain: "maple-94509.firebaseapp.com",
  projectId: "maple-94509",
  storageBucket: "maple-94509.firebasestorage.app",
  messagingSenderId: "44612970360",
  appId: "1:44612970360:web:bced0fe14129e59b8c0a8d",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider };
