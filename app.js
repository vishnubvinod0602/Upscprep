
const div = document.createElement("div");
div.className = "task";
div.innerHTML = `
  <strong>${subject}</strong><br>
  ${ch.chapter} <em>(${ch.book})</em>
`;
document.getElementById("date").innerText = new Date().toDateString();

const phase = new Date() >= new Date("2026-03-15") ?
  "Phase 2 – Revision & Mocks" : "Phase 1 – First Reading";
document.getElementById("phase").innerText = phase;

let travelMode = localStorage.getItem("travelMode") === "true";

function toggleTravelMode() {
  travelMode = !travelMode;
  localStorage.setItem("travelMode", travelMode);
  renderTasks();
}

function renderTasks() {
  const tasks = document.getElementById("tasks");
  tasks.innerHTML = "";
  document.getElementById("travelStatus").innerText = travelMode ? "ON" : "OFF";

  Object.keys(SYLLABUS).forEach(subject => {
    if (travelMode && subject !== "History" && subject !== "Geography") return;
    const ch = SYLLABUS[subject][0];
    const div = document.createElement("div");
    div.innerHTML = `<b>${subject}</b>: ${ch.chapter} (${ch.book})`;
    tasks.appendChild(div);
  });
}

function checkIn(status) {
  localStorage.setItem("checkin-" + new Date().toDateString(), status);
  alert("Check-in saved");
}

function saveNotes(val) {
  localStorage.setItem("notes-" + new Date().toDateString(), val);
}

function saveWeeklyReview() {
  const data = {
    days: document.getElementById("daysStudied").value,
    weak: document.getElementById("weakSubject").value
  };
  localStorage.setItem("weekly-" + new Date().toDateString(), JSON.stringify(data));
}

function isSunday() {
  return new Date().getDay() === 0;
}
if (isSunday()) document.getElementById("review").style.display = "block";

renderTasks();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

if ("Notification" in window) {
  Notification.requestPermission();
}
