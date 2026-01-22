// 🔴 ABSOLUTE PROOF THIS FILE IS LOADED
console.log("APP.JS LOADED");
alert("APP.JS LOADED");

// ==============================
// BASIC STATE
// ==============================
var progress = JSON.parse(localStorage.getItem("progress")) || {};

// ==============================
// WEEKLY SCHEDULE
// ==============================
var WEEKLY_SCHEDULE = {
  0: ["Revision"],
  1: ["Polity", "Geography"],
  2: ["History", "Economy"],
  3: ["Geography", "Environment"],
  4: ["Polity", "CSAT"],
  5: ["History", "Science"],
  6: ["Economy", "Revision"]
};

// ==============================
// SYLLABUS (TEMP INLINE)
// ==============================
var SYLLABUS = {
  Polity: ["Constitution", "Fundamental Rights"],
  CSAT: ["Reading Comprehension", "Quantitative Aptitude"]
};

// ==============================
// HELPERS
// ==============================
function todaySubjects() {
  return WEEKLY_SCHEDULE[new Date().getDay()] || [];
}

// ==============================
// RENDER TODAY
// ==============================
function renderToday() {
  console.log("Rendering Today");

  var container = document.getElementById("viewContainer");
  container.innerHTML = "<h3>Today’s Plan</h3>";

  var subjects = todaySubjects();

  subjects.forEach(function (subject) {
    var chapters = SYLLABUS[subject] || ["No syllabus"];
    container.innerHTML += `
      <div class="card">
        <b>${subject}</b><br>
        ${chapters[0]}
      </div>
    `;
  });
}

// ==============================
// LOGIN (DUMMY)
// ==============================
function login() {
  document.getElementById("authStatus").innerText =
    "🟢 Logged in (test)";
}

// ==============================
// EVENT BINDING
// ==============================
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM LOADED");

  var todayBtn = document.getElementById("btnToday");
  var loginBtn = document.getElementById("btnLogin");

  todayBtn.addEventListener("click", function () {
    console.log("TODAY CLICKED");
    renderToday();
  });

  loginBtn.addEventListener("click", function () {
    console.log("LOGIN CLICKED");
    login();
  });

  // Auto render
  renderToday();
});