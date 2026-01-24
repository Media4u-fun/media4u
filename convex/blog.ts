import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBlogPost = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("blogPosts", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const updateBlogPost = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    readTime: v.optional(v.string()),
    gradient: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    published: v.optional(v.boolean()),
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

export const deleteBlogPost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getAllPosts = query({
  args: {
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db.query("blogPosts");

    const filteredQuery = args.publishedOnly === true
      ? baseQuery.withIndex("by_published", (q) => q.eq("published", true))
      : baseQuery;

    const posts = await filteredQuery.order("desc").collect();
    return posts;
  },
});

export const getBlogPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getFeaturedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .collect();

    return args.limit ? posts.slice(0, args.limit) : posts;
  },
});

export const getPostsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const allPosts = await ctx.db.query("blogPosts").collect();
    return allPosts.filter(
      (post) => post.category === args.category && post.published
    );
  },
});
