import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";

// Get all files for a project
export const getProjectFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Add download URLs
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );

    return filesWithUrls;
  },
});

// Generate upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFileMetadata = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    await requireAdmin(ctx);

    const uploadedByName = (user.name ?? user.email ?? "Admin") as string;
    const uploadedBy = (user.userId ?? user._id ?? "unknown") as string;

    const fileId = await ctx.db.insert("projectFiles", {
      projectId: args.projectId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy,
      uploadedByName,
      description: args.description,
      createdAt: Date.now(),
    });

    return fileId;
  },
});

// Delete a file
export const deleteFile = mutation({
  args: { id: v.id("projectFiles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete metadata
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Update file description
export const updateFileDescription = mutation({
  args: {
    id: v.id("projectFiles"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, {
      description: args.description,
    });

    return { success: true };
  },
});
