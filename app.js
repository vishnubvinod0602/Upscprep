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
 * 🔐 EXPOSE FUNCTIONS TO HTML (CRITICAL)
 *************************************************/
window.login = firebaseLogin;
console.log("LOGIN FUNCTION ATTACHED");

/*************************************************
 * STATE
 *************************************************/
let progress = {};
let uid = null;

/*************************************************
 * WEEKLY SCHEDULE
 *************************************************/
const WEEKLY_SCHEDULE = {
  0: ["Revision"],                 // Sunday
  1: ["Polity", "Geography"],      // Monday
  2: ["History", "Economy"],       // Tuesday
  3: ["Geography", "Environment"], // Wednesday
  4: ["Polity", "CSAT"],           // Thursday
  5: ["History", "Science"],       // Friday
  6: ["Economy", "Revision"]       // Saturday
};

/*************************************************
 * ✈️ TRAVEL DAYS
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
 * FIREBASE USER LOAD
 *************************************************/
onUserReady(async user => {
  uid = user.uid;
  progress = await loadProgress(uid);
  localStorage.setItem("progress", JSON.stringify(progress));
  showView("today");
  scheduleSubjectReminder();
  scheduleRevisionAlert();
});

/*************************************************
 * CORE STUDY LOGIC
 *************************************************/
function getNextChapter(subject) {
  const done = progress[subject] || {};
  const blocks = SYLLABUS[subject];

  for (const type in blocks) {
    for (const book in blocks[type]) {
      for (const ch of blocks[type][book]) {
        if (!done[ch]) return ch;
      }
    }
  }
  return null;
}

/*************************************************
 * ✅ FIX: markDone ATTACHED TO window
 *************************************************/
window.markDone = function (subject, chapter) {
  progress[subject] = progress[subject] || {};

  if (!progress[subject][chapter]) {
    progress[subject][chapter] = {
      firstDone: todayKey(),
      revisions: 1
    };
  } else {
    progress[subject][chapter].revisions++;
  }

  localStorage.setItem("progress", JSON.stringify(progress));
  if (uid) saveProgress(uid, progress);
  renderToday();
};

console.log("markDone attached to window");

/*************************************************
 * VIEWS
 *************************************************/
function renderToday() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Today’s Plan</h3>";

  if (isTravelDay()) {
    v.innerHTML += `
      <div class="card">
        <b>Travel Day</b><br>
        Light reading / revision only.
      </div>
    `;
    return;
  }

  const subjects = todaySubjects();

  if (subjects.length === 0) {
    v.innerHTML += `<div class="card">No subjects scheduled.</div>`;
    return;
  }

  subjects.forEach(subject => {
    if (!SYLLABUS[subject]) return;

    const next = getNextChapter(subject);
    if (!next) return;

    v.innerHTML += `
      <div class="card">
        <b>${subject}</b><br>
        ${next}<br>
        <button class="done" onclick="markDone('${subject}','${next}')">
          Done
        </button>
      </div>
    `;
  });
}

function renderPlan() {
  document.getElementById("viewContainer").innerHTML =
    "<h3>Plan</h3><p>Follow the daily plan shown.</p>";
}

function renderCheckin() {
  document.getElementById("viewContainer").innerHTML =
    "<h3>Check-in</h3><p>Mark chapters honestly.</p>";
}

function renderAnalytics() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Analytics</h3>";

  Object.keys(progress).forEach(subject => {
    v.innerHTML += `
      <div class="card">
        ${subject}: ${Object.keys(progress[subject]).length} chapters completed
      </div>
    `;
  });
}

/*************************************************
 * NAVIGATION
 *************************************************/
window.showView = view => {
  if (view === "today") renderToday();
  if (view === "plan") renderPlan();
  if (view === "checkin") renderCheckin();
  if (view === "analytics") renderAnalytics();
};

/*************************************************
 * 🔔 NOTIFICATIONS
 *************************************************/
function getDelayTill(hour) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

window.enableNotifications = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  scheduleSubjectReminder();
  scheduleRevisionAlert();
};

function scheduleSubjectReminder() {
  setTimeout(() => {
    new Notification("Today's Focus", {
      body: todaySubjects().join(", ")
    });
  }, getDelayTill(9));
}

function getDueRevisions() {
  const due = [];
  const today = new Date();

  Object.keys(progress).forEach(subject => {
    Object.keys(progress[subject]).forEach(ch => {
      const entry = progress[subject][ch];
      const days =
        (today - new Date(entry.firstDone)) / (1000 * 60 * 60 * 24);

      if (
        (entry.revisions === 1 && days >= 1) ||
        (entry.revisions === 2 && days >= 7) ||
        (entry.revisions === 3 && days >= 30)
      ) {
        due.push(`${subject}: ${ch}`);
      }
    });
  });

  return due;
}

function scheduleRevisionAlert() {
  const due = getDueRevisions();
  if (!due.length) return;

  setTimeout(() => {
    new Notification("Revision Due", {
      body: due.slice(0, 5).join(", ")
    });
  }, getDelayTill(18));
}

/*************************************************
 * INITIAL LOAD
 *************************************************/
showView("today");