import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { title, date, time, duration, notes, category } = await req.json();

    // Get stored tokens from Convex
    const tokens = await convex.query(api.googleCalendar.getTokens, {});
    if (!tokens?.refreshToken) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
        : "http://localhost:3000/api/auth/google/callback"
    );

    oauth2Client.setCredentials({
      refresh_token: tokens.refreshToken,
      access_token: tokens.accessToken,
      expiry_date: tokens.expiryDate,
    });

    // Parse date + time into a proper datetime
    // date is "2026-02-27", time is "2:00 PM"
    const [year, month, day] = date.split("-").map(Number);
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = timeMatch ? parseInt(timeMatch[1]) : 9;
    const minutes = timeMatch ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch ? timeMatch[3].toUpperCase() : "AM";
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + (duration ?? 60) * 60 * 1000);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
      requestBody: {
        summary: title,
        description: [
          category ? `Category: ${category}` : "",
          notes ?? "",
        ].filter(Boolean).join("\n"),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/New_York",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Google Calendar create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
