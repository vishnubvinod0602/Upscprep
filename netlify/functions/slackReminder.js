import fetch from "node-fetch";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();

export async function handler() {
  const snap = await db.doc("system/status").get();
  const d = snap.data() || {};
  if (d.appActive) return { statusCode: 200 };

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `📚 Today: ${(d.todaySubjects||[]).join(", ")}` })
  });

  return { statusCode: 200 };
}