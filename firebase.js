import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  const firebaseConfig = {
  apiKey: "AIzaSyDvjioLErGsYSRjVj_pTv0Mp7OO-5-q96A",
  authDomain: "upsprepvishnu.firebaseapp.com",
  projectId: "upsprepvishnu",
  storageBucket: "upsprepvishnu.firebasestorage.app",
  messagingSenderId: "145016146692",
  appId: "1:145016146692:web:4e850de02df8dbe72e5e51"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  signInWithRedirect(auth, provider);
}

export async function handleRedirect() {
  try { await getRedirectResult(auth); }
  catch (e) { console.error(e); }
}

export function onAuthReady(cb) {
  onAuthStateChanged(auth, cb);
}

export function logout() {
  signOut(auth);
}

export function getUID() {
  return auth.currentUser?.uid;
}