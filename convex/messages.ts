import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import {
  emailBaseTemplate,
  emailHeading,
  emailParagraph,
  emailInfoBox,
  emailButton,
} from "./lib/emailTemplates";

// Client sends a message
export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    projectId: v.optional(v.id("projects")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const userName = userRole?.name || user.name || "Client";
    const userEmail = user.email || "";

    await ctx.db.insert("messages", {
      threadId: args.threadId,
      projectId: args.projectId,
      userId: user._id,
      userName,
      userEmail,
      sender: "client",
      message: args.message,
      read: false,
      createdAt: Date.now(),
    });

    // Schedule email notification
    await ctx.scheduler.runAfter(0, api.messages.sendMessageNotification, {
      userName,
      userEmail,
      message: args.message,
      threadId: args.threadId,
    });
  },
});

// Admin replies to a thread
export const sendAdminReply = mutation({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get thread info from existing messages
    const existingMsg = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!existingMsg) throw new Error("Thread not found");

    await ctx.db.insert("messages", {
      threadId: args.threadId,
      projectId: existingMsg.projectId,
      userId: existingMsg.userId,
      userName: existingMsg.userName,
      userEmail: existingMsg.userEmail,
      sender: "admin",
      message: args.message,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Mark all messages in a thread as read (for the viewer's perspective)
export const markThreadRead = mutation({
  args: {
    threadId: v.string(),
    readBy: v.union(v.literal("client"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // If admin is reading, mark client messages as read. Vice versa.
    const senderToMark = args.readBy === "admin" ? "client" : "admin";

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    for (const msg of unreadMessages) {
      if (msg.sender === senderToMark && !msg.read) {
        await ctx.db.patch(msg._id, { read: true });
      }
    }
  },
});

// Get all messages in a thread
export const getThreadMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

// Get threads for a specific client (grouped by threadId)
export const getClientThreads = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Group by threadId and get latest message + unread count
    const threadMap = new Map<
      string,
      {
        threadId: string;
        projectId?: string;
        lastMessage: string;
        lastMessageAt: number;
        unreadCount: number;
      }
    >();

    for (const msg of allMessages) {
      const existing = threadMap.get(msg.threadId);
      const isUnread = msg.sender === "admin" && !msg.read;

      if (!existing || msg.createdAt > existing.lastMessageAt) {
        threadMap.set(msg.threadId, {
          threadId: msg.threadId,
          projectId: msg.projectId as string | undefined,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    }

    const threads = Array.from(threadMap.values());
    threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    // Resolve project names
    const threadsWithProjects = await Promise.all(
      threads.map(async (thread) => {
        let projectName: string | undefined;
        if (thread.projectId) {
          const project = await ctx.db.get(thread.projectId as never);
          if (project && typeof project === "object" && "name" in project) {
            projectName = (project as { name: string }).name;
          }
        }
        return { ...thread, projectName };
      })
    );

    return threadsWithProjects;
  },
});

// Get all threads for admin view
export const getAllThreads = query({
  handler: async (ctx) => {
    const allMessages = await ctx.db.query("messages").collect();

    const threadMap = new Map<
      string,
      {
        threadId: string;
        projectId?: string;
        userId: string;
        userName: string;
        userEmail: string;
        lastMessage: string;
        lastMessageAt: number;
        unreadCount: number;
      }
    >();

    for (const msg of allMessages) {
      const existing = threadMap.get(msg.threadId);
      const isUnread = msg.sender === "client" && !msg.read;

      if (!existing || msg.createdAt > existing.lastMessageAt) {
        threadMap.set(msg.threadId, {
          threadId: msg.threadId,
          projectId: msg.projectId as string | undefined,
          userId: msg.userId,
          userName: msg.userName,
          userEmail: msg.userEmail,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    }

    const threads = Array.from(threadMap.values());
    threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    // Resolve project names
    const threadsWithProjects = await Promise.all(
      threads.map(async (thread) => {
        let projectName: string | undefined;
        if (thread.projectId) {
          const project = await ctx.db.get(thread.projectId as never);
          if (project && typeof project === "object" && "name" in project) {
            projectName = (project as { name: string }).name;
          }
        }
        return { ...thread, projectName };
      })
    );

    return threadsWithProjects;
  },
});

// Unread count for admin badge
export const getUnreadCountForAdmin = query({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_unread", (q) => q.eq("sender", "client").eq("read", false))
      .collect();

    return unread.length;
  },
});

// Email notification when client sends a message
export const sendMessageNotification = action({
  args: {
    userName: v.string(),
    userEmail: v.string(),
    message: v.string(),
    threadId: v.string(),
  },
  handler: async (_ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";
    const SUPPORT_EMAIL = "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured - skipping notification");
      return;
    }

    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://media4u.fun";

    const emailContent = [
      emailHeading("New Client Message"),
      emailParagraph(`${args.userName} sent you a message.`),
      emailInfoBox("From", `${args.userName} (${args.userEmail})`),
      emailInfoBox("Message", args.message.length > 300 ? args.message.slice(0, 300) + "..." : args.message),
      emailButton("View in Admin", `${siteUrl}/admin/messages?thread=${args.threadId}`),
    ].join("");

    const emailHtml = emailBaseTemplate(emailContent);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: SUPPORT_EMAIL,
        reply_to: args.userEmail,
        subject: `[Message] ${args.userName} sent a message`,
        html: emailHtml,
      }),
    });
  },
});
