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
  apiKey: "YOUR_API_KEY",
  authDomain: "upsprepvishnu.firebaseapp.com",
  projectId: "upsprepvishnu",
  storageBucket: "upsprepvishnu.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  signInWithRedirect(auth, provider);
}

export async function handleRedirect() {
  try {
    await getRedirectResult(auth);
  } catch (e) {
    console.error("Auth redirect error:", e);
  }
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