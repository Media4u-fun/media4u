import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  emailBaseTemplate,
  emailHeading,
  emailParagraph,
  emailInfoBox,
  emailDivider,
  emailButton,
} from "./lib/emailTemplates";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@media4u.fun";

export const sendReminder = internalAction({
  args: {
    appointmentId: v.id("appointments"),
    title: v.string(),
    date: v.string(),
    time: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    reminderMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const label = args.reminderMinutes === 1440
      ? "1 day"
      : args.reminderMinutes === 60
      ? "1 hour"
      : `${args.reminderMinutes} minutes`;

    const message = `"${args.title}" is coming up in ${label}.`;

    // Create bell notification
    await ctx.runMutation(internal.adminNotifications.createNotification, {
      type: "appointment_reminder",
      title: `Reminder: ${args.title}`,
      message,
      appointmentId: args.appointmentId,
    });

    // Mark reminder as sent in the appointment
    await ctx.runMutation(internal.reminders.markReminderSent, {
      appointmentId: args.appointmentId,
    });

    // Send email
    if (!RESEND_API_KEY) return;

    const html = emailBaseTemplate(`
      ${emailHeading("Upcoming Event Reminder")}
      ${emailParagraph(`You have an event coming up in <strong>${label}</strong>.`)}
      ${emailDivider()}
      ${emailInfoBox("Event", args.title)}
      ${emailInfoBox("Date", args.date)}
      ${emailInfoBox("Time", args.time)}
      ${args.category ? emailInfoBox("Category", args.category) : ""}
      ${args.notes ? emailInfoBox("Notes", args.notes) : ""}
      ${emailDivider()}
      ${emailButton("View Calendar", "https://media4u.fun/admin/appointments")}
    `);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: "devland@media4u.fun",
        subject: `Reminder: ${args.title} in ${label}`,
        html,
      }),
    });
  },
});

// Internal mutation to mark reminder as sent
export const markReminderSent = internalMutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appointmentId, { reminderSent: true });
  },
});
