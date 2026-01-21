import { SYLLABUS } from "./syllabus.js";
import { login, onUserReady, loadProgress, saveProgress } from "./firebase.js";

window.login = login;

let progress = {};
let uid = null;

/* ===== WEEKLY SCHEDULE ===== */
const WEEKLY_SCHEDULE = {
  0: ["Revision"],                 // Sunday
  1: ["Polity", "Geography"],      // Monday
  2: ["History", "Economy"],       // Tuesday
  3: ["Geography", "Environment"], // Wednesday
  4: ["Polity", "CSAT"],           // Thursday
  5: ["History", "Science"],       // Friday
  6: ["Economy", "Revision"]       // Saturday
};

/* ===== TRAVEL DAYS ===== */
const TRAVEL_DAYS = [
  "2026-02-05","2026-02-06","2026-02-07","2026-02-08","2026-02-09","2026-02-10",
  "2026-04-06","2026-04-07","2026-04-08","2026-04-09","2026-04-10",
  "2026-04-11","2026-04-12","2026-04-13","2026-04-14","2026-04-15",
  "2026-04-16","2026-04-17","2026-04-18","2026-04-19","2026-04-20","2026-04-21"
];

function todayKey() {
  return new Date().toISOString().split("T")[0];
}
function isTravelDay() {
  return TRAVEL_DAYS.includes(todayKey());
}
function todaySubjects() {
  return WEEKLY_SCHEDULE[new Date().getDay()] || [];
}

/* ===== FIREBASE LOAD ===== */
onUserReady(async user => {
  uid = user.uid;
  progress = await loadProgress(uid);
  localStorage.setItem("progress", JSON.stringify(progress));
  showView("today");
  scheduleSubjectReminder();
  scheduleRevisionAlert();
});

/* ===== CORE LOGIC ===== */
function getNextChapter(subject) {
  const done = progress[subject] || {};
  const blocks = SYLLABUS[subject];
  for (const type in blocks)
    for (const book in blocks[type])
      for (const ch of blocks[type][book])
        if (!done[ch]) return ch;
  return null;
}

function markDone(subject, chapter) {
  progress[subject] = progress[subject] || {};
  if (!progress[subject][chapter]) {
    progress[subject][chapter] = { firstDone: todayKey(), revisions: 1 };
  } else {
    progress[subject][chapter].revisions++;
  }
  localStorage.setItem("progress", JSON.stringify(progress));
  if (uid) saveProgress(uid, progress);
  renderToday();
}

/* ===== VIEWS ===== */
function renderToday() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Today’s Plan</h3>";

  if (isTravelDay()) {
    v.innerHTML += `<div class="card"><b>Travel Day</b><br>Light reading only.</div>`;
    return;
  }

  todaySubjects().forEach(subject => {
    if (!SYLLABUS[subject]) return;
    const ch = getNextChapter(subject);
    if (!ch) return;
    v.innerHTML += `
      <div class="card">
        <b>${subject}</b><br>${ch}<br>
        <button class="done" onclick="markDone('${subject}','${ch}')">Done</button>
      </div>`;
  });
}

function renderPlan() {
  document.getElementById("viewContainer").innerHTML = "<h3>Plan</h3>";
}
function renderCheckin() {
  document.getElementById("viewContainer").innerHTML = "<h3>Check-in</h3>";
}
function renderAnalytics() {
  const v = document.getElementById("viewContainer");
  v.innerHTML = "<h3>Analytics</h3>";
  Object.keys(progress).forEach(s => {
    v.innerHTML += `<div class="card">${s}: ${Object.keys(progress[s]).length}</div>`;
  });
}

window.showView = v => {
  if (v === "today") renderToday();
  if (v === "plan") renderPlan();
  if (v === "checkin") renderCheckin();
  if (v === "analytics") renderAnalytics();
};

/* ===== NOTIFICATIONS ===== */
function getDelayTill(h) {
  const now = new Date();
  const t = new Date();
  t.setHours(h, 0, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return t - now;
}

window.enableNotifications = async () => {
  if (await Notification.requestPermission() !== "granted") return;
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
  Object.keys(progress).forEach(s => {
    Object.keys(progress[s]).forEach(c => {
      const e = progress[s][c];
      const days = (today - new Date(e.firstDone)) / 86400000;
      if (
        (e.revisions === 1 && days >= 1) ||
        (e.revisions === 2 && days >= 7) ||
        (e.revisions === 3 && days >= 30)
      ) due.push(`${s}: ${c}`);
    });
  });
  return due;
}

function scheduleRevisionAlert() {
  const due = getDueRevisions();
  if (!due.length) return;
  setTimeout(() => {
    new Notification("Revision Due", {
      body: due.slice(0,5).join(", ")
    });
  }, getDelayTill(18));
}

showView("today");