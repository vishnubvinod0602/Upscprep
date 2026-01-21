import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvjioLErGsYSRjVj_pTv0Mp7OO-5-q96A",
  authDomain: "upsprepvishnu.firebaseapp.com",
  projectId: "upsprepvishnu",
  storageBucket: "upsprepvishnu.appspot.com",
  messagingSenderId: "145016146692",
  appId: "1:145016146692:web:4e850de02df8dbe72e5e51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function login() {
  signInWithPopup(auth, provider);
}

export function onUserReady(cb) {
  onAuthStateChanged(auth, user => {
    if (user) cb(user);
  });
}

export async function loadProgress(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().progress || {} : {};
}

export async function saveProgress(uid, progress) {
  await setDoc(doc(db, "users", uid), { progress }, { merge: true });
}