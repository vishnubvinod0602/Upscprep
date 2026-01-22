import fetch from "node-fetch";
export async function handler() {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "🔁 Sunday: Revision + PYQs + Weekly Review"
    })
  });
  return { statusCode: 200 };
}