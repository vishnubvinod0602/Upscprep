import { SYLLABUS } from "./syllabus.js";

/* ===============================
   STATE
================================ */
let progress = JSON.parse(localStorage.getItem("progress")) || {};

/* ===============================
   WEEKLY SCHEDULE
================================ */
const WEEKLY_SCHEDULE = {
  0: ["Revision"],
  1: ["Polity", "Geography"],
  2: ["History", "Economy"],
  3: ["Geography", "Environment"],
  4: ["Polity", "CSAT"],
  5: ["History", "Science"],
  6: ["Economy", "Revision"]
};

/* ===============================
   HELPERS
================================ */
function todaySubjects() {
  return WEEKLY_SCHEDULE[new Date().getDay()] || [];
}

function getNextChapter(subject) {
  const done = progress[subject] || {};
  const blocks = SYLLABUS[subject];
  if (!blocks) return null;

  for (const type in blocks) {
    for (const book in blocks[type]) {
      const chapters = blocks[type][book];
      if (!Array.isArray(chapters)) continue;

      for (const ch of chapters) {
        if (!done[ch]) return ch;
      }
    }
  }
  return null;
}

/* ===============================
   RENDER TODAY
================================ */
function renderToday() {
  const v = document.getElementById("viewContainer");

  console.log("Rendering Today View");
  v.innerHTML = "<h3>Today’s Plan</h3>";

  const subjects = todaySubjects();

  if (!subjects.length) {
    v.innerHTML += "<p>No subjects scheduled today.</p>";
    return;
  }

  subjects.forEach(subject => {
    const next = getNextChapter(subject);

    v.innerHTML += `
      <div class="card">
        <b>${subject}</b><br>
        ${next || "All chapters completed"}
      </div>
    `;
  });
}

/* ===============================
   LOGIN (TEMP / LOCAL)
================================ */
function login() {
  const status = document.getElementById("authStatus");
  status.innerText = "🟢 Logged in (local test)";
}

/* ===============================
   EVENT BINDING (CRITICAL)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const todayBtn = document.getElementById("btnToday");
  const loginBtn = document.getElementById("btnLogin");

  console.log("Buttons:", todayBtn, loginBtn);

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      console.log("Today button clicked");
      renderToday();
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      login();
    });
  }

  // Initial render
  renderToday();
});