import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { internal } from "./_generated/api";

// Get all projects (admin only - sorted by creation date, newest first)
export const getAllProjects = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const projects = await ctx.db
      .query("projects")
      .order("desc")
      .collect();
    return projects;
  },
});

// Get user's own projects (clients see only their projects)
export const getMyProjects = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    // Get projects linked to user's email
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), user.email))
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single project by ID
export const getProjectById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    return project;
  },
});

// Create a new project manually
export const createProject = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.string(),
    description: v.string(),
    requirements: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      email: args.email,
      company: args.company,
      phone: args.phone,
      projectType: args.projectType,
      description: args.description,
      requirements: args.requirements,
      budget: args.budget,
      timeline: args.timeline,
      status: "new",
      notes: args.notes || "",
      liveUrl: undefined,
      leadId: undefined,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send welcome email to client
    await ctx.scheduler.runAfter(0, internal.projectEmails.sendProjectWelcomeEmailInternal, {
      clientName: args.name,
      clientEmail: args.email,
      projectType: args.projectType,
      projectDescription: args.description,
    });

    return projectId;
  },
});

// Create project from a lead (copies lead data)
export const createProjectFromLead = mutation({
  args: {
    leadId: v.id("leads"),
    projectType: v.string(),
    description: v.string(),
    requirements: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the lead
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Create project with lead's contact info
    const projectId = await ctx.db.insert("projects", {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      projectType: args.projectType,
      description: args.description,
      requirements: args.requirements,
      budget: args.budget,
      timeline: args.timeline,
      status: "new",
      notes: `Converted from lead. Original notes: ${lead.notes}`,
      liveUrl: undefined,
      leadId: args.leadId,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update lead status to converted
    await ctx.db.patch(args.leadId, {
      status: "converted",
    });

    return projectId;
  },
});

// Update an existing project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("planning"),
        v.literal("design"),
        v.literal("development"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("launched")
      )
    ),
    notes: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    backendComplexity: v.optional(v.union(
      v.literal("none"),
      v.literal("simple"),
      v.literal("standard"),
      v.literal("fullstack")
    )),
    technicalFeatures: v.optional(v.array(v.string())),
    brandColors: v.optional(v.object({
      primary: v.optional(v.string()),
      secondary: v.optional(v.string()),
      accent: v.optional(v.string()),
    })),
    socialLinks: v.optional(v.object({
      website: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Create project from a project request (copies request data)
export const createProjectFromRequest = mutation({
  args: {
    requestId: v.id("projectRequests"),
  },
  handler: async (ctx, args) => {
    // Get the project request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Project request not found");
    }

    // Create project with request's info
    const projectId = await ctx.db.insert("projects", {
      name: request.name,
      email: request.email,
      company: request.businessName,
      phone: undefined,
      projectType: request.projectTypes.join(", "), // Join multiple types
      description: request.description,
      requirements: request.vision || undefined,
      budget: request.budget,
      timeline: request.timeline,
      status: "new",
      notes: `Converted from project request.\n\nOriginal request details:\n- Primary Goal: ${request.primaryGoal || "N/A"}\n- Features: ${request.features?.join(", ") || "N/A"}\n- Look & Feel: ${request.lookAndFeel || "N/A"}`,
      liveUrl: undefined,
      leadId: undefined,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update request status to accepted
    await ctx.db.patch(args.requestId, {
      status: "accepted",
    });

    return projectId;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all notes for a project (sorted by creation date, newest first)
export const getProjectNotes = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("projectNotes")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
    return notes;
  },
});

// Add a note to a project
export const addProjectNote = mutation({
  args: {
    projectId: v.id("projects"),
    note: v.string(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("projectNotes", {
      projectId: args.projectId,
      note: args.note,
      createdAt: Date.now(),
      createdBy: args.createdBy,
    });
    return noteId;
  },
});

// Delete a project note
export const deleteProjectNote = mutation({
  args: { id: v.id("projectNotes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update integration vault (clients can update their own, admins can update any)
export const updateIntegrationVault = mutation({
  args: {
    projectId: v.id("projects"),
    integrationVault: v.object({
      emailProvider: v.optional(v.string()),
      emailApiKey: v.optional(v.string()),
      emailFromAddress: v.optional(v.string()),
      googleAnalyticsId: v.optional(v.string()),
      googleTagManagerId: v.optional(v.string()),
      facebookPixelId: v.optional(v.string()),
      webhookUrl: v.optional(v.string()),
      webhookSecret: v.optional(v.string()),
      customApiKey1Label: v.optional(v.string()),
      customApiKey1Value: v.optional(v.string()),
      customApiKey2Label: v.optional(v.string()),
      customApiKey2Value: v.optional(v.string()),
      customApiKey3Label: v.optional(v.string()),
      customApiKey3Value: v.optional(v.string()),
      stripePublishableKey: v.optional(v.string()),
      stripeSecretKey: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check permissions: must be project owner or admin
    const isProjectOwner = project.email === user.email;
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    const isAdmin = userRole?.role === "admin";

    if (!isProjectOwner && !isAdmin) {
      throw new Error("Permission denied");
    }

    // Update vault
    await ctx.db.patch(args.projectId, {
      integrationVault: args.integrationVault,
    });

    // Log client activity (only if client updated, not admin)
    if (isProjectOwner && !isAdmin) {
      await ctx.db.insert("clientActivity", {
        projectId: args.projectId,
        userId: user.userId,
        userName: user.name || user.email,
        activityType: "vault_updated",
        description: "Updated integration vault credentials",
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});
