import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});
