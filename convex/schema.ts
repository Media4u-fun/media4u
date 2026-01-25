import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for authentication
  users: defineTable({
    email: v.string(),
    password: v.string(), // hashed
    name: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),


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
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_email", ["email"]),

  // Newsletter subscribers
  newsletterSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    unsubscribed: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_subscribed", ["unsubscribed"]),

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

  // Site Settings (global configuration)
  siteSettings: defineTable({
    key: v.string(), // e.g., "social_media", "contact_info"
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),
});
