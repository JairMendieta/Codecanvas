import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "codecanvas-ai-ba40p",
  appId: "1:897952649272:web:5c5e3386717057ba5b96cd",
  storageBucket: "codecanvas-ai-ba40p.firebasestorage.app",
  apiKey: "AIzaSyAFf_nQKTYFHmTPMbwcu4skUDFYrtBE7-U",
  authDomain: "codecanvas-ai-ba40p.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "897952649272"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
