import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Note: User/session tables are managed by Better Auth component
  // See convex.config.ts for the Better Auth component registration

  // User roles (for admin access - separate from Better Auth user table)
  userRoles: defineTable({
    userId: v.string(), // Better Auth user ID
    role: v.union(v.literal("admin"), v.literal("user")),
    email: v.optional(v.string()), // User's email (captured during signup)
    name: v.optional(v.string()), // User's name (captured during signup)
    displayName: v.optional(v.string()), // Admin-set display name (overrides name)
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
    email: v.string(), // Legacy single email (kept for backwards compatibility)
    emails: v.optional(v.array(v.object({
      address: v.string(),
      label: v.string(), // e.g., "Personal", "Business", "Work"
      isPrimary: v.boolean(),
    }))),
    // Multiple phone numbers
    phones: v.optional(v.array(v.object({
      number: v.string(),
      label: v.string(), // e.g., "Mobile", "Business", "Home"
      isPrimary: v.boolean(),
    }))),
    // Address fields
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    // Company/business info
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    // Client categorization
    tags: v.optional(v.array(v.string())), // e.g., ["VR", "Website", "Referral"]
    preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
    timezone: v.optional(v.string()), // e.g., "America/Los_Angeles"
    referralSource: v.optional(v.string()), // How they found you
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
    email: v.string(), // Legacy single email (kept for backwards compatibility)
    emails: v.optional(v.array(v.object({
      address: v.string(),
      label: v.string(), // e.g., "Personal", "Business", "Work"
      isPrimary: v.boolean(),
    }))),
    // Multiple phone numbers
    phones: v.optional(v.array(v.object({
      number: v.string(),
      label: v.string(), // e.g., "Mobile", "Business", "Home"
      isPrimary: v.boolean(),
    }))),
    // Address fields
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    businessName: v.optional(v.string()),
    website: v.optional(v.string()),
    // Client categorization
    tags: v.optional(v.array(v.string())), // e.g., ["VR", "Website", "Referral"]
    preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
    timezone: v.optional(v.string()),
    referralSource: v.optional(v.string()),
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

  // Leads - potential customers for outbound sales & Website Factory
  leads: defineTable({
    name: v.string(), // Business owner name
    businessName: v.optional(v.string()), // Business name (separate from owner name)
    email: v.string(), // Legacy single email (kept for backwards compatibility)
    emails: v.optional(v.array(v.object({
      address: v.string(),
      label: v.string(), // e.g., "Personal", "Business", "Work"
      isPrimary: v.boolean(),
    }))),
    // Multiple phone numbers
    phone: v.optional(v.string()), // Legacy single phone (kept for backwards compatibility)
    phones: v.optional(v.array(v.object({
      number: v.string(),
      label: v.string(), // e.g., "Mobile", "Business", "Home"
      isPrimary: v.boolean(),
    }))),
    // Address fields
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    location: v.optional(v.string()), // Quick location field: "Phoenix, AZ" or "Scottsdale, AZ"
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    // Website Factory - Industry tracking
    industry: v.optional(v.string()), // "Door Company", "Pool Service", "Barbershop", "Pest Control", etc.
    // Website Factory - Photo uploads
    photos: v.optional(v.array(v.id("_storage"))), // Array of Convex storage IDs for uploaded images
    // Client categorization
    tags: v.optional(v.array(v.string())),
    preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
    timezone: v.optional(v.string()),
    source: v.string(), // e.g., "referral", "website", "trade show", "cold outreach", "spotted"
    status: v.union(
      v.literal("new"),
      v.literal("researching"),  // Website Factory: AI is researching
      v.literal("building"),     // Website Factory: Site is being built
      v.literal("presented"),    // Website Factory: Site shown to lead
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("won"),          // Website Factory: They bought the site
      v.literal("lost")
    ),
    notes: v.string(),
    createdAt: v.number(),
    lastContactedAt: v.optional(v.number()),
    // Website Factory - Proposal & Spec Site
    proposalToken: v.optional(v.string()), // Unique token for signup link (e.g., "just-doors-abc123")
    specSiteUrl: v.optional(v.string()),   // Preview URL (e.g., "https://just-doors-inc.vercel.app")
    specProjectId: v.optional(v.id("projects")), // Pre-created project they'll see when they sign up
    proposalSentAt: v.optional(v.number()), // When proposal email was sent
    proposalPrice: v.optional(v.number()),  // Offer price (e.g., 1500 for one-time site)
    // Website Factory - Deposit Payment
    depositPaid: v.optional(v.boolean()),   // Whether they paid the $50 deposit
    depositAmount: v.optional(v.number()),  // Deposit amount in cents (e.g., 5000 for $50)
    stripeDepositSessionId: v.optional(v.string()),  // Stripe checkout session ID for deposit
    stripeDepositPaymentIntentId: v.optional(v.string()), // Stripe payment intent ID for deposit
    depositPaidAt: v.optional(v.number()),  // When deposit was paid
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_industry", ["industry"])
    .index("by_created", ["createdAt"])
    .index("by_proposalToken", ["proposalToken"]),

  // Project Notes - timestamped notes for projects
  projectNotes: defineTable({
    projectId: v.id("projects"),
    note: v.string(),
    createdAt: v.number(),
    createdBy: v.optional(v.string()), // Who added the note (name)
    createdByRole: v.optional(v.union(v.literal("admin"), v.literal("client"))),
    visibleToClient: v.optional(v.boolean()), // Defaults to true if not set
  })
    .index("by_projectId", ["projectId"])
    .index("by_created", ["createdAt"]),

  // Client Projects - converted leads that become actual projects
  projects: defineTable({
    name: v.string(),
    email: v.string(), // Legacy single email (kept for backwards compatibility)
    emails: v.optional(v.array(v.object({
      address: v.string(),
      label: v.string(), // e.g., "Personal", "Business", "Work"
      isPrimary: v.boolean(),
    }))),
    // Multiple phone numbers
    phone: v.optional(v.string()), // Legacy single phone (kept for backwards compatibility)
    phones: v.optional(v.array(v.object({
      number: v.string(),
      label: v.string(), // e.g., "Mobile", "Business", "Home"
      isPrimary: v.boolean(),
    }))),
    // Address fields
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    company: v.optional(v.string()),
    // Client categorization
    tags: v.optional(v.array(v.string())),
    preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
    timezone: v.optional(v.string()),
    referralSource: v.optional(v.string()),
    projectType: v.string(), // e.g., "VR Website", "Standard Website", "E-commerce", etc.
    description: v.string(),
    requirements: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    // Payment Status
    paymentStatus: v.optional(v.union(v.literal("unpaid"), v.literal("paid"))),
    packageType: v.optional(v.union(v.literal("starter"), v.literal("professional"))), // Links to order
    orderId: v.optional(v.id("orders")), // Link to order record
    // Custom Deal / Intake Flow
    isPersonalProject: v.optional(v.boolean()), // Admin's own project - hidden from client portal
    isCustomDeal: v.optional(v.boolean()), // Admin-marked custom deal (intake + invoice + subscription flow)
    setupFeeAmount: v.optional(v.number()), // Custom setup fee in dollars (default 500)
    monthlyAmount: v.optional(v.number()),  // Custom monthly amount in dollars (default 149)
    planTier: v.optional(v.union(v.literal("basic"), v.literal("growth"))), // Basic ($79/mo) or Growth ($149/mo)
    setupInvoiceStatus: v.optional(v.union(
      v.literal("pending"),           // Invoice not yet sent
      v.literal("sent"),              // Stripe invoice sent to client
      v.literal("needs_verification"), // Client clicked "I've Paid" (manual fallback)
      v.literal("paid")               // Confirmed paid (webhook or admin)
    )),
    setupInvoicePaid: v.optional(v.boolean()), // Invoice paid (auto via webhook or admin confirmed)
    setupInvoiceStripeId: v.optional(v.string()), // Stripe invoice ID
    setupInvoiceUrl: v.optional(v.string()),      // Stripe hosted invoice URL (share with client)
    logoStorageId: v.optional(v.id("_storage")), // Client-uploaded logo
    websiteGoals: v.optional(v.string()), // Intake: what they want the website to do
    intakeSubmittedAt: v.optional(v.number()), // When client submitted the intake form
    // Client Branding & Social Info
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
    // Integration Vault - secure storage for client API keys and credentials
    integrationVault: v.optional(v.object({
      // Email Provider
      emailProvider: v.optional(v.string()), // e.g., "Resend", "SendGrid"
      emailApiKey: v.optional(v.string()),
      emailFromAddress: v.optional(v.string()),
      // Analytics
      googleAnalyticsId: v.optional(v.string()),
      googleTagManagerId: v.optional(v.string()),
      facebookPixelId: v.optional(v.string()),
      // Webhooks
      webhookUrl: v.optional(v.string()),
      webhookSecret: v.optional(v.string()),
      // Custom API Keys
      customApiKey1Label: v.optional(v.string()),
      customApiKey1Value: v.optional(v.string()),
      customApiKey2Label: v.optional(v.string()),
      customApiKey2Value: v.optional(v.string()),
      customApiKey3Label: v.optional(v.string()),
      customApiKey3Value: v.optional(v.string()),
      // Payments
      stripePublishableKey: v.optional(v.string()),
      stripeSecretKey: v.optional(v.string()),
      // Billing Portal (PestPac, etc.)
      billingPortalUrl: v.optional(v.string()),
      billingPortalName: v.optional(v.string()),
      customerPortalUrl: v.optional(v.string()),
      notes: v.optional(v.string()), // General integration notes
    })),
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
    sourceRequestId: v.optional(v.id("projectRequests")), // Link back to original wizard submission
    lookAndFeel: v.optional(v.string()), // Design style preference from wizard
    growthStage: v.optional(v.string()), // Business growth stage from wizard
    primaryGoal: v.optional(v.string()), // Primary goal from wizard
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_leadId", ["leadId"])
    .index("by_created", ["createdAt"]),

  // Project Files - images, documents, and assets for projects
  projectFiles: defineTable({
    projectId: v.id("projects"),
    fileName: v.string(),
    fileType: v.string(), // MIME type: "image/png", "application/pdf", etc.
    fileSize: v.number(), // Size in bytes
    storageId: v.id("_storage"), // Convex file storage ID
    uploadedBy: v.string(), // Admin user ID
    uploadedByName: v.string(), // Admin name for display
    description: v.optional(v.string()), // Optional note about the file
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_created", ["createdAt"]),

  // Client Activity - track client actions in portal for admin notifications
  clientActivity: defineTable({
    projectId: v.id("projects"),
    userId: v.string(), // Client who made the change
    userName: v.string(), // Client name for display
    activityType: v.union(
      v.literal("vault_updated"),
      v.literal("note_added"),
      v.literal("project_updated"),
      v.literal("intake_submitted"),
      v.literal("invoice_marked_paid"),
      v.literal("subscription_started")
    ),
    description: v.string(), // "Updated integration vault credentials"
    metadata: v.optional(v.object({
      fieldName: v.optional(v.string()), // Which field was updated
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string()),
    })),
    read: v.boolean(), // Has any admin seen this?
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_read", ["read"])
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

  // Community Comments - public comments on creator posts (admin approval required)
  communityComments: defineTable({
    memberId: v.id("communityMembers"),
    authorName: v.string(),
    content: v.string(),
    approved: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_approved", ["approved"]),

  // Messages - support thread messaging between clients and admin
  messages: defineTable({
    threadId: v.string(), // Groups messages into threads (e.g., "general_<userId>" or "project_<projectId>_<userId>")
    projectId: v.optional(v.id("projects")), // Optional link to a project
    userId: v.string(), // The client's user ID (thread owner)
    userName: v.string(),
    userEmail: v.string(),
    sender: v.union(v.literal("client"), v.literal("admin")),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_userId", ["userId"])
    .index("by_unread", ["sender", "read"])
    .index("by_created", ["createdAt"]),

  // Admin Internal Notes - private notes between admins about clients/projects
  adminNotes: defineTable({
    content: v.string(),
    authorId: v.string(), // Admin user ID
    authorName: v.string(),
    clientEmail: v.optional(v.string()), // Tag a client
    clientName: v.optional(v.string()),
    projectId: v.optional(v.id("projects")), // Tag a project
    createdAt: v.number(),
  })
    .index("by_clientEmail", ["clientEmail"])
    .index("by_projectId", ["projectId"])
    .index("by_created", ["createdAt"]),

  // Appointments / Booking
  appointments: defineTable({
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    date: v.string(), // "2026-02-15"
    time: v.string(), // "10:00 AM"
    duration: v.number(), // minutes
    serviceType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    // Business calendar fields
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    relatedProject: v.optional(v.string()),
    title: v.optional(v.string()), // Content title for Blog/Podcast
    platform: v.optional(v.string()), // YouTube, Spotify, etc.
    publishStatus: v.optional(v.string()), // Draft, Scheduled, Posted
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_userId", ["userId"])
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
