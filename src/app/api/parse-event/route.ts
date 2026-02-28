import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getTodayString() {
  return new Date().toISOString().split("T")[0]; // "2026-02-27"
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const today = getTodayString();
    const todayDate = new Date();
    const dayName = todayDate.toLocaleDateString("en-US", { weekday: "long" });

    const prompt = `You are a calendar assistant. Parse the following text into a calendar event.

Today is ${dayName}, ${today}.

Text: "${text}"

Rules:
- If the day is mentioned (e.g. "Monday", "Friday"), calculate the next occurrence of that day from today
- If "tomorrow" is mentioned, add 1 day to today
- If "next week" is used without a specific day, you NEED clarification - ask for the day
- If the time is unclear but a day is clear, use 9:00 AM as default
- If ANY critical info is missing (like no day at all), set needsClarification to true and provide ONE short question

Valid categories: Client Call, Install / Field Job, Podcast, Blog Post, Follow-Up, Family / Personal, Admin / Finance, Build Task, Reminder Only, Deadline, Meeting, Marketing Task, Other

Valid priorities: Low, Normal, High, Critical

Respond ONLY with valid JSON in this exact format:
{
  "needsClarification": false,
  "question": "",
  "title": "Event title here",
  "date": "2026-02-27",
  "time": "2:00 PM",
  "duration": 60,
  "category": "Client Call",
  "priority": "Normal",
  "notes": ""
}

If clarification is needed:
{
  "needsClarification": true,
  "question": "What day next week?"
}

Day offsets from today (${dayName}):
${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => {
  const diff = ((i - todayDate.getDay()) + 7) % 7 || 7;
  const date = new Date(todayDate);
  date.setDate(date.getDate() + (d.toLowerCase() === dayName.toLowerCase() ? 7 : diff));
  return `- ${d}: ${date.toISOString().split("T")[0]}`;
}).join("\n")}
`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("parse-event error:", err);
    return NextResponse.json({ error: "Failed to parse event" }, { status: 500 });
  }
}
