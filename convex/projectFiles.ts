import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { api } from "./_generated/api";

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

// Get logo URL for a project (client-facing)
export const getLogoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Generate upload URL for clients (no admin required)
export const generateUploadUrlClient = mutation({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata (client - must own the project)
export const saveFileMetadataClient = mutation({
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
    if (!user) throw new Error("Authentication required");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.email !== user.email) throw new Error("Permission denied");

    const uploadedByName = (user.name ?? user.email ?? "Client") as string;
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

    // Notify admin via email
    await ctx.scheduler.runAfter(0, api.emails.notifyAdminClientActivity, {
      clientName: uploadedByName,
      clientEmail: user.email ?? "",
      projectName: project.name ?? project.company ?? "Unknown Project",
      activityType: "file_uploaded",
      description: `Uploaded file: ${args.fileName}`,
    });

    return fileId;
  },
});

// Get files for a project the client owns
export const getProjectFilesForClient = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.email !== user.email) throw new Error("Permission denied");

    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
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
