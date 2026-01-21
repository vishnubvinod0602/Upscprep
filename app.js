/*************************************************
 * IMPORTS
 *************************************************/
import { SYLLABUS } from "./syllabus.js";
import {
  login as firebaseLogin,
  onUserReady,
  loadProgress,
  saveProgress
} from "./firebase.js";

/*************************************************
 * EXPOSE FUNCTIONS
 *************************************************/
window.login = firebaseLogin;

/*************************************************
 * STATE
 *************************************************/
let progress = {};
let uid = null;

/*************************************************
 * LOGIN STATUS
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("authStatus");
  if (status) status.innerHTML = "🔴 Not logged in";
});

/*************************************************
 * WEEKLY SCHEDULE
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
 * TRAVEL DAYS
 *************************************************/
const TRAVEL_DAYS = [
  "2026-02-05","2026-02-06","2026-02-07","2026-02-08","2026-02-09","2026-02-10",
  "2026-04-06","2026-04-07","2026-04-08","2026-04-09","2026-04-10",
  "2026-04-11","2026-04-12","2026-04-13","2026-04-14","2026-04-15",
  "2026-04-16","2026-04-17","2026-04-18","2026-04-19","2026-04-20","2026-04-21"
];

/*************************************************
 * HELPERS
 *************************************************/
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function isTravelDay() {
  return TRAVEL_DAYS.includes(todayKey());
}

function todaySubjects() {
  return WEEKLY_SCHEDULE[new Date().getDay()] || [];
}

/*************************************************
 * FIREBASE READY
 *************************************************/
onUserReady(async user => {
  uid = user.uid;

  const status = document.getElementById("authStatus");
  if (status) status.innerHTML = `🟢 Logged in as <b>${user.email}</b>`;

  progress = await loadProgress(uid);
  localStorage.setItem("progress", JSON.stringify(progress));

  showView("today");
});

/*************************************************
 * CORE LOGIC
 *************************************************/
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

/*************************************************
 * markDone
 *************************************************/
window.markDone = function (subject, chapter) {
  progress[subject] = progress[subject] || {};

  progress[subject][chapter] = progress[subject][chapter] || {
    firstDone: todayKey(),
    revisions: 0
  };
  progress[subject][chapter].revisions++;

  localStorage.setItem("progress", JSON.stringify(progress));
  if (uid) saveProgress(uid, progress);

  renderToday();
};

/*************************************************
 * RENDER TODAY (DIAGNOSTIC)
 *************************************************/
function renderToday() {

  // 🔴 CRITICAL DIAGNOSTIC LINE
//  alert("RENDERING TODAY");

  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Today’s Plan</h3>";

  if (isTravelDay()) {
    v.innerHTML += `
      <div style="background:yellow;color:black;padding:10px;">
        Travel Day – Light Reading Only
      </div>
    `;
    return;
  }

  todaySubjects().forEach(subject => {
    const next = getNextChapter(subject);

    v.innerHTML += `
      <div style="
        background:white;
        color:black;
        border:2px solid red;
        padding:12px;
        margin:12px 0;
      ">
        <b>${subject}</b><br>
        ${next || "NO NEXT CHAPTER"}
      </div>
    `;
  });
}

/*************************************************
 * NAVIGATION
 *************************************************/
window.showView = function (view) {
  if (view === "today") renderToday();
};
/*************************************************
 * INITIAL LOAD
 *************************************************/
showView("today");