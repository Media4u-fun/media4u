import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type AiRequestType = "briefing" | "weekly" | "conflicts" | "schedule";

interface CalendarEvent {
  title?: string;
  date: string;
  time?: string;
  category?: string;
  priority?: string;
  notes?: string;
}

interface AiRequest {
  type: AiRequestType;
  events: CalendarEvent[];
  query?: string;
}

function buildSystemPrompt(type: AiRequestType, query: string | undefined): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  switch (type) {
    case "briefing":
      return `You are a personal assistant. Given these calendar events for today, give a friendly 2-3 sentence briefing. Be direct and conversational. Today is ${today}.`;
    case "weekly":
      return `You are a personal assistant. Given these calendar events for the next 7 days, give a 3-4 sentence weekly outlook. Highlight busy days and priorities. Today is ${today}.`;
    case "conflicts":
      return `You are a calendar assistant. Look for scheduling conflicts (same day back-to-back with no gap, overloaded days with 4+ events, or critical deadlines near other events). List any issues briefly. If none found, say 'Looks clean! No conflicts detected.' Today is ${today}.`;
    case "schedule":
      return `You are a scheduling assistant. The user wants to: ${query ?? "schedule something"}. Based on their existing calendar events, suggest 2-3 good time slots. Be specific with days and times. Today is ${today}.`;
  }
}

function buildUserMessage(type: AiRequestType, events: CalendarEvent[]): string {
  if (events.length === 0) {
    return "No events found on the calendar.";
  }
  const eventLines = events.map((e) => {
    const parts = [e.date, e.time, e.title ?? "Untitled", e.category, e.priority].filter(Boolean);
    return `- ${parts.join(" | ")}${e.notes ? ` (${e.notes})` : ""}`;
  });
  const label =
    type === "briefing"
      ? "Today's events"
      : type === "weekly"
      ? "Events for the next 7 days"
      : "Upcoming events";
  return `${label}:\n${eventLines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiRequest;
    const { type, events, query } = body;

    if (!type || !["briefing", "weekly", "conflicts", "schedule"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(type, query);
    const userMessage = buildUserMessage(type, events ?? []);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const result = textBlock && textBlock.type === "text" ? textBlock.text : "No response generated.";

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error("calendar-ai error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
