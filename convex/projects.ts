import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

// Create an unpaid project from package selection (client-facing)
export const createUnpaidProject = mutation({
  args: {
    packageType: v.union(v.literal("starter"), v.literal("professional")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    const packageNames = {
      starter: "Starter Website Package",
      professional: "Professional Website Package",
    };

    const packageDescriptions = {
      starter: "3-4 page professional website with mobile-responsive design, SEO-ready structure, and contact form integration.",
      professional: "6-8 page website or eCommerce site with custom design, branding consultation, and advanced features.",
    };

    const projectId = await ctx.db.insert("projects", {
      name: user.name ?? user.email ?? "Client",
      email: user.email ?? "",
      company: undefined,
      phone: undefined,
      projectType: packageNames[args.packageType],
      description: packageDescriptions[args.packageType],
      requirements: undefined,
      budget: args.packageType === "starter" ? "$899" : "$1,399",
      timeline: undefined,
      status: "new",
      notes: `Project created from ${args.packageType} package selection. Awaiting payment.`,
      liveUrl: undefined,
      leadId: undefined,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      paymentStatus: "unpaid",
      packageType: args.packageType,
      orderId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Create a new project manually (admin-created, always paid)
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
      paymentStatus: "paid", // Admin-created projects are considered paid
      packageType: undefined,
      orderId: undefined,
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
      paymentStatus: "paid", // Lead conversions are considered paid
      packageType: undefined,
      orderId: undefined,
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

    // Merge all features from the wizard
    const allFeatures = [
      ...(request.features ?? []),
      ...(request.optionalEnhancements ?? []),
    ];

    // Build website goals from vision + primaryGoal
    const goalParts = [];
    if (request.primaryGoal) goalParts.push(`Primary Goal: ${request.primaryGoal}`);
    if (request.vision) goalParts.push(`Vision: ${request.vision}`);

    // Create project with all wizard data properly mapped
    const projectId = await ctx.db.insert("projects", {
      name: request.name,
      email: request.email,
      company: request.businessName,
      phone: undefined,
      projectType: request.projectTypes.join(", "),
      description: request.description,
      requirements: request.vision || undefined,
      budget: request.budget,
      timeline: request.timeline,
      status: "new",
      notes: "",
      backendComplexity: undefined,
      technicalFeatures: allFeatures.length > 0 ? allFeatures : undefined,
      websiteGoals: goalParts.length > 0 ? goalParts.join("\n") : undefined,
      primaryGoal: request.primaryGoal || undefined,
      lookAndFeel: request.lookAndFeel || undefined,
      growthStage: request.growthStage || undefined,
      sourceRequestId: args.requestId,
      paymentStatus: "paid",
      packageType: undefined,
      orderId: undefined,
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

// Link an existing project to a project request and pull in the wizard data
export const linkRequestToProject = mutation({
  args: {
    projectId: v.id("projects"),
    requestId: v.id("projectRequests"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Project request not found");

    const allFeatures = [
      ...(request.features ?? []),
      ...(request.optionalEnhancements ?? []),
    ];
    const goalParts = [];
    if (request.primaryGoal) goalParts.push(`Primary Goal: ${request.primaryGoal}`);
    if (request.vision) goalParts.push(`Vision: ${request.vision}`);

    await ctx.db.patch(args.projectId, {
      sourceRequestId: args.requestId,
      websiteGoals: goalParts.length > 0 ? goalParts.join("\n") : undefined,
      primaryGoal: request.primaryGoal || undefined,
      lookAndFeel: request.lookAndFeel || undefined,
      growthStage: request.growthStage || undefined,
      technicalFeatures: allFeatures.length > 0 ? allFeatures : undefined,
      ...(request.description ? { description: request.description } : {}),
      requirements: request.vision || undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.requestId, { status: "accepted" });
    return { success: true };
  },
});

// Mark project as paid (called by webhook after payment)
export const markProjectAsPaid = internalMutation({
  args: {
    projectId: v.string(), // String because it comes from Stripe metadata
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const project = await ctx.db.get(projectId);
    if (!project) {
      console.error(`Project not found: ${args.projectId}`);
      return { success: false };
    }

    await ctx.db.patch(projectId, {
      paymentStatus: "paid",
      orderId: args.orderId,
      updatedAt: Date.now(),
    });

    // Send welcome email now that project is paid
    await ctx.scheduler.runAfter(0, internal.projectEmails.sendProjectWelcomeEmailInternal, {
      clientName: project.name,
      clientEmail: project.email,
      projectType: project.projectType,
      projectDescription: project.description,
    });

    return { success: true };
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
      const userName = (user.name ?? user.email ?? "Client") as string;
      const userId = (user.userId ?? user._id ?? "unknown") as string;

      await ctx.db.insert("clientActivity", {
        projectId: args.projectId,
        userId,
        userName,
        activityType: "vault_updated",
        description: "Updated integration vault credentials",
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ── Custom Deal / Intake Flow ────────────────────────────────────────────────

// Generate a logo upload URL (client-facing, no admin required)
export const generateLogoUploadUrl = mutation({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");
    return await ctx.storage.generateUploadUrl();
  },
});

// Submit intake form (client fills in branding, goals, uploads logo)
export const submitIntake = mutation({
  args: {
    projectId: v.id("projects"),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    brandColors: v.optional(v.object({
      primary: v.optional(v.string()),
      secondary: v.optional(v.string()),
      accent: v.optional(v.string()),
    })),
    websiteGoals: v.optional(v.string()),
    requirements: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.email !== user.email) throw new Error("Permission denied");

    const { projectId, ...fields } = args;

    await ctx.db.patch(projectId, {
      ...fields,
      status: "planning",
      intakeSubmittedAt: Date.now(),
      setupInvoiceStatus: project.setupInvoiceStatus ?? "pending",
      updatedAt: Date.now(),
    });

    const userName = (user.name ?? user.email ?? "Client") as string;
    const userId = (user.userId ?? user._id ?? "unknown") as string;

    await ctx.db.insert("clientActivity", {
      projectId,
      userId,
      userName,
      activityType: "intake_submitted",
      description: "Submitted project intake form",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Client clicks "I've Paid the Setup Invoice"
export const markSetupInvoicePaid = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.email !== user.email) throw new Error("Permission denied");

    await ctx.db.patch(args.projectId, {
      setupInvoiceStatus: "needs_verification",
      updatedAt: Date.now(),
    });

    const userName = (user.name ?? user.email ?? "Client") as string;
    const userId = (user.userId ?? user._id ?? "unknown") as string;

    await ctx.db.insert("clientActivity", {
      projectId: args.projectId,
      userId,
      userName,
      activityType: "invoice_marked_paid",
      description: "Marked $500 setup invoice as paid - awaiting admin verification",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Admin confirms setup invoice was paid
export const confirmSetupInvoicePaid = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.projectId, {
      setupInvoiceStatus: "paid",
      setupInvoicePaid: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Admin updates custom deal amounts
export const updateCustomDealAmounts = mutation({
  args: {
    projectId: v.id("projects"),
    setupFeeAmount: v.optional(v.number()),
    monthlyAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { projectId, ...fields } = args;
    await ctx.db.patch(projectId, { ...fields, updatedAt: Date.now() });
    return { success: true };
  },
});

// Save Stripe invoice details after creation (called by API route)
export const saveSetupInvoice = mutation({
  args: {
    projectId: v.id("projects"),
    stripeInvoiceId: v.string(),
    invoiceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      setupInvoiceStripeId: args.stripeInvoiceId,
      setupInvoiceUrl: args.invoiceUrl,
      setupInvoiceStatus: "sent",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Mark setup invoice as paid (called by webhook)
export const markSetupInvoicePaidByWebhook = internalMutation({
  args: { stripeInvoiceId: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("setupInvoiceStripeId"), args.stripeInvoiceId))
      .first();

    if (!project) return { found: false };

    await ctx.db.patch(project._id, {
      setupInvoiceStatus: "paid",
      setupInvoicePaid: true,
      updatedAt: Date.now(),
    });

    return { found: true };
  },
});

// Admin toggles custom deal flag on a project
export const setCustomDeal = mutation({
  args: {
    projectId: v.id("projects"),
    isCustomDeal: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.projectId, {
      isCustomDeal: args.isCustomDeal,
      setupInvoiceStatus: args.isCustomDeal ? "pending" : undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
