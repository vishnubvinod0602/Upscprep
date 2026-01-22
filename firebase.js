// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/* 🔴 REPLACE VALUES FROM FIREBASE CONSOLE */
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "upsprepvishnu.firebaseapp.com",
  projectId: "upsprepvishnu",
  storageBucket: "upsprepvishnu.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID_HERE",
  appId: "PASTE_APP_ID_HERE"
};

/* INIT */
const app = initializeApp(firebaseConfig);

/* SERVICES */
export const auth = getAuth(app);
export const db = getFirestore(app);

/* PROVIDER */
const provider = new GoogleAuthProvider();

/* AUTH HELPERS */
export function loginWithGoogle() {
  signInWithRedirect(auth, provider);
}

export async function handleRedirect() {
  try {
    await getRedirectResult(auth);
  } catch (e) {
    console.error("Redirect error:", e);
  }
}

export function onAuthReady(cb) {
  onAuthStateChanged(auth, cb);
}

export function logout() {
  signOut(auth);
}

export function getUID() {
  return auth.currentUser ? auth.currentUser.uid : null;
}