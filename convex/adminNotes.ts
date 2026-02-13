import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

// Add an internal note (admin only)
export const addNote = mutation({
  args: {
    content: v.string(),
    clientEmail: v.optional(v.string()),
    clientName: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    // Get admin display name from userRoles
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", admin._id))
      .first();

    const authorName = userRole?.displayName || userRole?.name || admin.name || "Admin";

    await ctx.db.insert("adminNotes", {
      content: args.content,
      authorId: admin._id,
      authorName,
      clientEmail: args.clientEmail,
      clientName: args.clientName,
      projectId: args.projectId,
      createdAt: Date.now(),
    });
  },
});

// Delete a note (only the author can delete their own)
export const deleteNote = mutation({
  args: { noteId: v.id("adminNotes") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const note = await ctx.db.get(args.noteId);

    if (!note) throw new Error("Note not found");
    if (note.authorId !== admin._id) throw new Error("You can only delete your own notes");

    await ctx.db.delete(args.noteId);
  },
});

// Get all notes (newest first, admin only)
export const getAllNotes = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const notes = await ctx.db
      .query("adminNotes")
      .order("desc")
      .take(200);

    // Resolve project names
    const notesWithProjects = await Promise.all(
      notes.map(async (note) => {
        let projectName: string | undefined;
        if (note.projectId) {
          const project = await ctx.db.get(note.projectId);
          if (project) {
            projectName = project.name;
          }
        }
        return { ...note, projectName };
      })
    );

    return notesWithProjects;
  },
});
