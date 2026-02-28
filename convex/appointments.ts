import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { appointmentConfig, generateTimeSlots } from "./lib/appointmentConfig";
import { api, internal } from "./_generated/api";


export const bookAppointment = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    serviceType: v.string(),
    notes: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    relatedProject: v.optional(v.string()),
    title: v.optional(v.string()),
    platform: v.optional(v.string()),
    publishStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    // Get user role info for name/email
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    // Check for conflicting appointment
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const conflict = existing.find(
      (a) => a.time === args.time && a.status !== "cancelled"
    );
    if (conflict) throw new Error("This time slot is already booked");

    const now = Date.now();
    const userName = userRole?.name ?? user.name ?? "Unknown";
    const userEmail = userRole?.email ?? user.email ?? "";

    const appointmentId = await ctx.db.insert("appointments", {
      userId: user._id,
      userName,
      userEmail,
      userPhone: "",
      date: args.date,
      time: args.time,
      duration: appointmentConfig.slotDuration,
      serviceType: args.serviceType,
      status: "pending",
      notes: args.notes,
      category: args.category,
      priority: args.priority,
      relatedProject: args.relatedProject,
      title: args.title,
      platform: args.platform,
      publishStatus: args.publishStatus,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admin via email
    await ctx.scheduler.runAfter(0, api.emails.notifyAdminClientActivity, {
      clientName: userName,
      clientEmail: userEmail,
      activityType: "appointment_booked",
      description: `Booked ${args.serviceType} on ${args.date} at ${args.time}`,
    });

    return appointmentId;
  },
});

export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("appointments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("appointments").order("desc").collect();
  },
});

export const getAppointmentsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.appointmentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const addAdminNote = mutation({
  args: {
    appointmentId: v.id("appointments"),
    adminNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.appointmentId, {
      adminNotes: args.adminNotes,
      updatedAt: Date.now(),
    });
  },
});

export const cancelAppointment = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.userId !== user._id)
      throw new Error("Not your appointment");
    if (appointment.status !== "pending" && appointment.status !== "confirmed")
      throw new Error("Can only cancel pending or confirmed appointments");

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Notify admin via email
    await ctx.scheduler.runAfter(0, api.emails.notifyAdminClientActivity, {
      clientName: appointment.userName,
      clientEmail: appointment.userEmail,
      activityType: "appointment_cancelled",
      description: `Cancelled ${appointment.serviceType} on ${appointment.date} at ${appointment.time}`,
    });
  },
});

export const adminBookAppointment = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    serviceType: v.string(),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    relatedProject: v.optional(v.string()),
    title: v.optional(v.string()),
    platform: v.optional(v.string()),
    publishStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check for conflicting appointment
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const conflict = existing.find(
      (a) => a.time === args.time && a.status !== "cancelled"
    );
    if (conflict) throw new Error("This time slot is already booked");

    const now = Date.now();
    return await ctx.db.insert("appointments", {
      userId: "admin-created",
      userName: args.customerName,
      userEmail: args.customerEmail ?? "",
      userPhone: args.customerPhone ?? "",
      date: args.date,
      time: args.time,
      duration: appointmentConfig.slotDuration,
      serviceType: args.serviceType,
      status: "confirmed",
      notes: args.notes,
      adminNotes: args.adminNotes,
      category: args.category,
      priority: args.priority,
      relatedProject: args.relatedProject,
      title: args.title,
      platform: args.platform,
      publishStatus: args.publishStatus,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Dashboard widget queries
export const getTodayAppointments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();
  },
});

export const getOverdueAppointments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = new Date().toISOString().split("T")[0];
    const all = await ctx.db.query("appointments").collect();
    return all.filter(
      (a) => a.date < today && a.status !== "completed" && a.status !== "cancelled"
    );
  },
});

export const getUpcomingAppointments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysOut = new Date();
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
    const sevenDaysStr = sevenDaysOut.toISOString().split("T")[0];
    const all = await ctx.db.query("appointments").collect();
    return all
      .filter((a) => a.date > today && a.date <= sevenDaysStr && a.status !== "cancelled")
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const adminQuickAddAppointment = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    title: v.string(),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
    relatedProject: v.optional(v.string()),
    createdFrom: v.optional(v.string()),
    reminderMinutes: v.optional(v.number()),
    reminderAt: v.optional(v.number()), // UTC ms timestamp calculated by the browser
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const appointmentId = await ctx.db.insert("appointments", {
      userId: "admin-quick-add",
      userName: "Admin",
      userEmail: "",
      userPhone: "",
      date: args.date,
      time: args.time,
      duration: args.duration ?? 60,
      serviceType: args.category ?? "Internal",
      status: "confirmed",
      notes: args.notes,
      category: args.category,
      priority: args.priority ?? "Normal",
      relatedProject: args.relatedProject,
      title: args.title,
      reminderMinutes: args.reminderMinutes,
      createdAt: now,
      updatedAt: now,
    });

    // Schedule reminder using the browser-calculated timestamp (correct local timezone)
    if (args.reminderAt && args.reminderAt > now) {
      const scheduledId = await ctx.scheduler.runAt(args.reminderAt, internal.reminders.sendReminder, {
        appointmentId,
        title: args.title,
        date: args.date,
        time: args.time,
        category: args.category,
        notes: args.notes,
        reminderMinutes: args.reminderMinutes ?? 30,
      });
      await ctx.db.patch(appointmentId, { reminderScheduledId: scheduledId as unknown as string });
    }

    return appointmentId;
  },
});

export const getAvailableSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    // Check if the day is a day off
    const dateObj = new Date(args.date + "T00:00:00");
    const dayOfWeek = dateObj.getUTCDay();
    if (appointmentConfig.daysOff.includes(dayOfWeek)) return [];

    const allSlots = generateTimeSlots();

    const booked = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const bookedTimes = new Set(
      booked.filter((a) => a.status !== "cancelled").map((a) => a.time)
    );

    return allSlots.filter((slot) => !bookedTimes.has(slot));
  },
});
