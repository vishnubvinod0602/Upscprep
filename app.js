import { SYLLABUS } from "./syllabus.js";
import {
  loginWithGoogle,
  handleRedirect,
  onAuthReady,
  getUID,
  logout
} from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { db } from "./firebase.js";

/* ================= AUTH UI ================= */

const authBox = document.getElementById("authBox");

function renderLogin() {
  authBox.innerHTML = `
    <button id="googleLogin">🔐 Login with Google</button>
  `;
  document.getElementById("googleLogin").onclick = loginWithGoogle;
}

function renderUser(user) {
  authBox.innerHTML = `
    ✅ ${user.email}
    <button id="logoutBtn">Logout</button>
  `;
  document.getElementById("logoutBtn").onclick = logout;
}

/* ================= APP STATE ================= */

let appIsActive = true;
let reminderShown = false;

/* ================= APP VISIBILITY ================= */

document.addEventListener("visibilitychange", async () => {
  appIsActive = document.visibilityState === "visible";
  reminderShown = false;

  const uid = getUID();
  if (!uid) return;

  await setDoc(
    doc(db, "system", "status"),
    {
      appActive: appIsActive,
      lastActive: new Date().toISOString()
    },
    { merge: true }
  );
});

/* ================= ALERT ================= */

function showAlert(message) {
  if (appIsActive && reminderShown) return;

  const container = document.getElementById("viewContainer");
  const div = document.createElement("div");
  div.className = "alert";
  div.innerText = message;

  container.prepend(div);
  reminderShown = true;

  setTimeout(() => div.remove(), 6000);
}

/* ================= SCHEDULE ================= */

const BASE_WEEK = {
  0: ["REVISION"], // Sunday
  1: ["Polity", "Geography"],
  2: ["History", "Economy"],
  3: ["Geography", "Environment"],
  4: ["Polity", "CSAT"],
  5: ["History", "Science"],
  6: ["Economy"]
};

function todaySubjects() {
  const day = new Date().getDay();
  return day === 0 ? ["REVISION"] : BASE_WEEK[day];
}

/* ================= TODAY VIEW ================= */

async function renderToday() {
  const view = document.getElementById("viewContainer");
  view.innerHTML = "<h3>Today</h3>";

  const subjects = todaySubjects();
  const uid = getUID();

  await setDoc(
    doc(db, "system", "status"),
    { todaySubjects: subjects },
    { merge: true }
  );

  if (subjects.includes("REVISION")) {
    showAlert("🔁 Sunday: Revision + PYQs only");
    view.innerHTML += `<div class="card">Revise last week & solve PYQs</div>`;
    return;
  }

  subjects.forEach(sub => {
    view.innerHTML += `<div class="card"><b>${sub}</b></div>`;
  });

  const today = new Date().toISOString().slice(0, 10);
  const snap = await getDoc(doc(db, "users", uid, "checkins", today));

  if (!snap.exists()) {
    view.innerHTML += `
      <div class="card">
        <b>Daily Check-in</b><br><br>
        <button onclick="markCheckin('done')">✅ Done</button>
        <button onclick="markCheckin('missed')">❌ Missed</button>
      </div>
    `;
  } else {
    view.innerHTML += `
      <div class="card">
        Check-in recorded: <b>${snap.data().status}</b>
      </div>
    `;
  }
}

/* ================= CHECK-IN ================= */

window.markCheckin = async function (status) {
  const uid = getUID();
  const today = new Date().toISOString().slice(0, 10);

  await setDoc(doc(db, "users", uid, "checkins", today), {
    status,
    subjects: todaySubjects(),
    timestamp: new Date().toISOString()
  });

  showAlert(
    status === "done"
      ? "✅ Check-in saved. Good work."
      : "❌ Missed today. Reset tomorrow."
  );
};

/* ================= ANALYTICS ================= */

function renderAnalytics() {
  const view = document.getElementById("viewContainer");
  view.innerHTML = "<h3>Analytics</h3>";

  Object.keys(SYLLABUS).forEach(subject => {
    view.innerHTML += `<div class="card">${subject}</div>`;
  });
}

/* ================= POMODORO ================= */

document.getElementById("btnPomodoro").onclick = () => {
  let time = 25 * 60;
  const display = document.getElementById("timerDisplay");

  const interval = setInterval(() => {
    display.innerText = `Focus: ${Math.floor(time / 60)}:${String(
      time % 60
    ).padStart(2, "0")}`;

    if (--time < 0) {
      clearInterval(interval);
      showAlert("✅ Focus session complete. Take a break.");
    }
  }, 1000);
};

/* ================= NAVIGATION ================= */

function showView(view) {
  if (view === "today") {
    renderToday();
  } else if (view === "analytics") {
    renderAnalytics();
  }
}

window.showView = showView;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async () => {
  await handleRedirect();

  onAuthReady(user => {
    if (!user) {
      renderLogin();
    } else {
      renderUser(user);
      showView("today");
    }
  });
});