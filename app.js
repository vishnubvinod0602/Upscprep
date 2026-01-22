import { SYLLABUS } from "./syllabus.js";
import { db } from "./firebase.js";
import {
  loginWithGoogle,
  handleRedirect,
  onAuthReady,
  getUID,
  logout
} from "./firebase.js";

import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/* ---------- AUTH UI ---------- */
const authBox = document.getElementById("authBox");

function renderLogin() {
  authBox.innerHTML = `<button id="googleLogin">🔐 Login with Google</button>`;
  document.getElementById("googleLogin").onclick = loginWithGoogle;
}

function renderUser(user) {
  authBox.innerHTML = `✅ ${user.email} <button id="logoutBtn">Logout</button>`;
  document.getElementById("logoutBtn").onclick = logout;
}

/* ---------- STATE ---------- */
let appIsActive = true;
let reminderShown = false;

/* ---------- APP ACTIVE ---------- */
document.addEventListener("visibilitychange", async () => {
  appIsActive = document.visibilityState === "visible";
  reminderShown = false;

  if (getUID()) {
    await setDoc(doc(db, "system", "status"), {
      appActive: appIsActive,
      lastActive: new Date().toISOString()
    }, { merge: true });
  }
});

/* ---------- ALERT ---------- */
function showAlert(msg) {
  if (appIsActive && reminderShown) return;
  const v = document.getElementById("viewContainer");
  const d = document.createElement("div");
  d.className = "alert";
  d.innerText = msg;
  v.prepend(d);
  reminderShown = true;
  setTimeout(() => d.remove(), 6000);
}

/* ---------- SCHEDULE ---------- */
const BASE_WEEK = {
  0: ["REVISION"],
  1: ["Polity", "Geography"],
  2: ["History", "Economy"],
  3: ["Geography", "Environment"],
  4: ["Polity", "CSAT"],
  5: ["History", "Science"],
  6: ["Economy"]
};

function todaySubjects() {
  const d = new Date().getDay();
  return d === 0 ? ["REVISION"] : BASE_WEEK[d];
}

/* ---------- TODAY VIEW ---------- */
async function renderToday() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Today</h3>";

  const subjects = todaySubjects();
  const uid = getUID();

  await setDoc(doc(db, "system", "status"), { todaySubjects: subjects }, { merge: true });

  if (subjects.includes("REVISION")) {
    showAlert("🔁 Sunday: Revision + PYQs");
    v.innerHTML += `<div class="card">Revise last week</div>`;
    return;
  }

  subjects.forEach(s => v.innerHTML += `<div class="card">${s}</div>`);

  const date = new Date().toISOString().slice(0, 10);
  const snap = await getDoc(doc(db, "users", uid, "checkins", date));

  if (!snap.exists()) {
    v.innerHTML += `
      <div class="card">
        <button onclick="markCheckin('done')">✅ Done</button>
        <button onclick="markCheckin('missed')">❌ Missed</button>
      </div>`;
  } else {
    v.innerHTML += `<div class="card">Check-in: ${snap.data().status}</div>`;
  }
}

/* ---------- CHECK-IN ---------- */
window.markCheckin = async status => {
  const uid = getUID();
  const date = new Date().toISOString().slice(0, 10);

  await setDoc(doc(db, "users", uid, "checkins", date), {
    status,
    subjects: todaySubjects(),
    timestamp: new Date().toISOString()
  });

  showAlert(status === "done" ? "✅ Saved" : "❌ Missed");
};

/* ---------- ANALYTICS ---------- */
function renderAnalytics() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Analytics</h3>";
  Object.keys(SYLLABUS).forEach(s => {
    v.innerHTML += `<div class="card">${s}</div>`;
  });
}

/* ---------- POMODORO ---------- */
document.getElementById("btnPomodoro").onclick = () => {
  let t = 25 * 60;
  const d = document.getElementById("timerDisplay");
  const i = setInterval(() => {
    d.innerText = `Focus: ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
    if (--t < 0) {
      clearInterval(i);
      showAlert("✅ Focus complete");
    }
  }, 1000);
};

/* ---------- NAV ---------- */
window.showView = v => v === "today" ? renderToday() : renderAnalytics();

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await handleRedirect();
  onAuthReady(user => {
    if (!user) renderLogin();
    else {
      renderUser(user);
      showView("today");
    }
  });
});