import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Note: User/session tables are managed by Better Auth component
  // See convex.config.ts for the Better Auth component registration

  // User roles (for admin access - separate from Better Auth user table)
  userRoles: defineTable({
    userId: v.string(), // Better Auth user ID
    role: v.union(v.literal("admin"), v.literal("user")),
    displayName: v.optional(v.string()), // Admin-set display name
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  // Password reset tokens
  passwordResetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),

  // Stripe customer records - links users to Stripe customers
  stripeCustomers: defineTable({
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    email: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_email", ["email"]),

  // One-time purchase orders
  orders: defineTable({
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    productType: v.union(v.literal("starter"), v.literal("professional")),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_status", ["status"]),

  // Recurring subscriptions
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("unpaid")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    customerEmail: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  // Contact form submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    service: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Project request submissions
  projectRequests: defineTable({
    name: v.string(),
    email: v.string(),
    businessName: v.optional(v.string()),
    projectTypes: v.array(v.string()),
    description: v.string(),
    timeline: v.string(),
    budget: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("quoted"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
    notes: v.optional(v.string()),
    // Enhanced Build Path fields
    vision: v.optional(v.string()),
    primaryGoal: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    lookAndFeel: v.optional(v.string()),
    growthStage: v.optional(v.string()),
    optionalEnhancements: v.optional(v.array(v.string())),
    userId: v.optional(v.string()), // Link to authenticated user
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  // Leads - potential customers for outbound sales
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.string(), // e.g., "referral", "website", "trade show", "cold outreach"
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("lost")
    ),
    notes: v.string(),
    createdAt: v.number(),
    lastContactedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_created", ["createdAt"]),

  // Client Projects - converted leads that become actual projects
  projects: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    projectType: v.string(), // e.g., "VR Website", "Standard Website", "E-commerce", etc.
    description: v.string(),
    requirements: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("planning"),
      v.literal("design"),
      v.literal("development"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("launched")
    ),
    notes: v.string(),
    liveUrl: v.optional(v.string()), // URL when site is launched
    leadId: v.optional(v.id("leads")), // Link back to original lead
    // Technical Requirements
    backendComplexity: v.optional(v.union(
      v.literal("none"),
      v.literal("simple"),
      v.literal("standard"),
      v.literal("fullstack")
    )),
    technicalFeatures: v.optional(v.array(v.string())), // e.g., ["authentication", "database", "payment"]
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_leadId", ["leadId"])
    .index("by_created", ["createdAt"]),

  // Newsletter subscribers
  newsletterSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    unsubscribed: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_subscribed", ["unsubscribed"]),

  // Newsletters
  newsletters: defineTable({
    subject: v.string(),
    content: v.string(), // HTML from Tiptap
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent")),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    recipientCount: v.optional(v.number()),
    successCount: v.optional(v.number()),
    errorCount: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_scheduledFor", ["scheduledFor"])
    .index("by_createdAt", ["createdAt"]),

  // Blog posts
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    date: v.string(),
    readTime: v.string(),
    gradient: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    featured: v.boolean(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"]),

  // Portfolio projects
  portfolioProjects: defineTable({
    title: v.string(),
    slug: v.string(),
    category: v.string(),
    description: v.string(),
    fullDescription: v.optional(v.string()),
    gradient: v.string(),
    featured: v.boolean(),
    technologies: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    testimonial: v.optional(v.string()),
    results: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),

  // VR Experiences (Properties & Destinations)
  vrExperiences: defineTable({
    title: v.string(),
    slug: v.string(),
    type: v.union(v.literal("property"), v.literal("destination")),
    categories: v.array(v.string()), // e.g., ["Mall", "Shopping", "Multiverse"]
    description: v.string(),
    fullDescription: v.optional(v.string()),
    thumbnailImage: v.string(), // Hero/main image
    gallery: v.optional(v.array(v.string())), // Additional gallery images
    features: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
    }))),
    multiverseUrl: v.optional(v.string()), // Link to multiverse experience
    websiteUrl: v.optional(v.string()), // External website link
    contactEmail: v.optional(v.string()),
    price: v.optional(v.number()), // Price in Meta Coins
    gradient: v.string(), // e.g., "from-cyan-500 via-blue-600 to-purple-600"
    featured: v.boolean(),
    testimonial: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_featured", ["featured"]),

  // Quick Quote Requests (demo widget for pest control, etc.)
  quoteRequests: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    serviceType: v.string(), // e.g., "pest-control", "web-design"
    issueType: v.string(), // e.g., "Ants", "Rodents", "New Website"
    propertyType: v.string(), // e.g., "Home", "Business"
    zipCode: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("quoted"), v.literal("closed")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_serviceType", ["serviceType"])
    .index("by_created", ["createdAt"]),

  // VR Multiverse Community Invites
  communityInvites: defineTable({
    email: v.string(),
    name: v.string(),
    token: v.string(), // Unique invite token for the submission link
    status: v.union(
      v.literal("pending"),    // Invite sent, waiting for submission
      v.literal("submitted"),  // They submitted, waiting for approval
      v.literal("approved"),   // Approved and live
      v.literal("expired"),    // Invite expired (optional cleanup)
      v.literal("revoked")     // Admin revoked the invite
    ),
    message: v.optional(v.string()), // Personal message in invite email
    sentAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // VR Multiverse Community Members (approved submissions)
  communityMembers: defineTable({
    inviteId: v.id("communityInvites"), // Link to original invite
    name: v.string(), // Creator/world name
    worldName: v.string(), // Name of their VR world/project
    description: v.string(), // Short description
    images: v.array(v.string()), // Gallery images (URLs)
    videoUrl: v.optional(v.string()), // Video tour URL (YouTube, etc.)
    multiverseUrl: v.optional(v.string()), // Link to their VR world
    websiteUrl: v.optional(v.string()), // Their website
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    likes: v.optional(v.number()), // Public like count
    featured: v.boolean(), // Featured on top of page
    approved: v.boolean(), // Must be true to show publicly
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inviteId", ["inviteId"])
    .index("by_approved", ["approved"])
    .index("by_featured", ["featured"]),

  // Community Invite Requests (public requests for invites)
  communityInviteRequests: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.optional(v.string()), // Why they want to join
    status: v.union(
      v.literal("pending"),   // Waiting for admin review
      v.literal("invited"),   // Admin sent them an invite
      v.literal("declined")   // Admin declined
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Site Settings (global configuration)
  siteSettings: defineTable({
    key: v.string(), // e.g., "site_config"
    // Company Info
    companyName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // Social Media
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    // System Settings
    maintenanceMode: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),
});
