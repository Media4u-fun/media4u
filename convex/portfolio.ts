import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("portfolioProjects", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("portfolioProjects"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    fullDescription: v.optional(v.string()),
    gradient: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    technologies: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    testimonial: v.optional(v.string()),
    results: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteProject = mutation({
  args: {
    id: v.id("portfolioProjects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getAllProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("portfolioProjects").order("desc").collect();
  },
});

export const getProjectBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioProjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getProjectsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioProjects")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
  },
});

export const getFeaturedProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("portfolioProjects")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .collect();

    return args.limit ? projects.slice(0, args.limit) : projects;
  },
});
