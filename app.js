import { SYLLABUS } from "./syllabus.js";

/*************************************************
 * STATE
 *************************************************/
let progress = JSON.parse(localStorage.getItem("progress")) || {};

/*************************************************
 * SCHEDULE
 *************************************************/
const WEEKLY_SCHEDULE = {
  0: ["Revision"],
  1: ["Polity", "Geography"],
  2: ["History", "Economy"],
  3: ["Geography", "Environment"],
  4: ["Polity", "CSAT"],
  5: ["History", "Science"],
  6: ["Economy", "Revision"]
};

/*************************************************
 * HELPERS
 *************************************************/
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
      for (const ch of chapters) {
        if (!done[ch]) return ch;
      }
    }
  }
  return null;
}

/*************************************************
 * RENDER TODAY
 *************************************************/
function renderToday() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Today’s Plan</h3>";

  const subjects = todaySubjects();

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

/*************************************************
 * LOGIN (DUMMY FOR NOW)
 *************************************************/
function login() {
  document.getElementById("authStatus").innerText = "🟢 Logged in (local)";
}

/*************************************************
 * EVENT BINDING (IMPORTANT)
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnToday")
    .addEventListener("click", renderToday);

  document.getElementById("btnLogin")
    .addEventListener("click", login);

  // Auto-load Today view
  renderToday();
});