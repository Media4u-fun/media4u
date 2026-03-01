import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { api } from "./_generated/api";

// Product type validator
const productTypeValidator = v.union(v.literal("starter"), v.literal("professional"));

// Order status validator
const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded")
);

// Subscription status validator
const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("unpaid")
);

// Get or create a Stripe customer record
export const getOrCreateCustomer = mutation({
  args: {
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, stripeCustomerId, email }) => {
    // Check if customer already exists by stripeCustomerId
    const existingByStripeId = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", stripeCustomerId))
      .first();

    if (existingByStripeId) {
      // Update userId if provided and not set
      if (userId && !existingByStripeId.userId) {
        await ctx.db.patch(existingByStripeId._id, { userId });
      }
      return existingByStripeId._id;
    }

    // Check if customer exists by email
    const existingByEmail = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingByEmail) {
      // Update with new Stripe customer ID if different
      await ctx.db.patch(existingByEmail._id, {
        stripeCustomerId,
        ...(userId && !existingByEmail.userId ? { userId } : {}),
      });
      return existingByEmail._id;
    }

    // Create new customer record
    return await ctx.db.insert("stripeCustomers", {
      userId,
      stripeCustomerId,
      email,
      createdAt: Date.now(),
    });
  },
});

// Create a new order (called when checkout session is created)
export const createOrder = mutation({
  args: {
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    stripeSessionId: v.string(),
    productType: productTypeValidator,
    amount: v.number(),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Update order status (called by webhook)
export const updateOrderStatus = internalMutation({
  args: {
    stripeSessionId: v.string(),
    status: orderStatusValidator,
    stripePaymentIntentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, { stripeSessionId, status, stripePaymentIntentId, paidAt }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", stripeSessionId))
      .first();

    if (!order) {
      throw new Error(`Order not found for session: ${stripeSessionId}`);
    }

    await ctx.db.patch(order._id, {
      status,
      ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      ...(paidAt ? { paidAt } : {}),
    });

    // If paid, ensure user has a role
    if (status === "paid" && order.userId) {
      const existingRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", order.userId!))
        .first();

      if (!existingRole) {
        await ctx.db.insert("userRoles", {
          userId: order.userId!,
          role: "user",
          createdAt: Date.now(),
        });
      }
    }

    return order._id;
  },
});

// Create a new subscription (called by webhook)
export const createSubscription = internalMutation({
  args: {
    userId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: subscriptionStatusValidator,
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Ensure user has a role if subscription is active
    if (args.status === "active" && args.userId) {
      const existingRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .first();

      if (!existingRole) {
        await ctx.db.insert("userRoles", {
          userId: args.userId!,
          role: "user",
          createdAt: Date.now(),
        });
      }
    }

    return subscriptionId;
  },
});

// Update subscription (called by webhook)
export const updateSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(subscriptionStatusValidator),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, { stripeSubscriptionId, ...updates }) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
    }

    const patchData: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.status !== undefined) patchData.status = updates.status;
    if (updates.currentPeriodStart !== undefined)
      patchData.currentPeriodStart = updates.currentPeriodStart;
    if (updates.currentPeriodEnd !== undefined)
      patchData.currentPeriodEnd = updates.currentPeriodEnd;
    if (updates.cancelAtPeriodEnd !== undefined)
      patchData.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;

    await ctx.db.patch(subscription._id, patchData);

    return subscription._id;
  },
});

// Get user's orders
export const getUserOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return orders;
  },
});

// Get user's active subscription
export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Return the most recent active subscription
    return subscriptions.find((s) => s.status === "active") ?? subscriptions[0] ?? null;
  },
});

// Get all orders (admin only)
export const getAllOrders = query({
  args: {
    status: v.optional(orderStatusValidator),
  },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);

    if (status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Get all subscriptions (admin only)
export const getAllSubscriptions = query({
  args: {
    status: v.optional(subscriptionStatusValidator),
  },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);

    if (status) {
      return await ctx.db
        .query("subscriptions")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("subscriptions").order("desc").collect();
  },
});

// Get order by session ID (for success page)
export const getOrderBySessionId = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, { stripeSessionId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", stripeSessionId))
      .first();
  },
});

// Link user to existing orders/subscriptions by email
export const linkUserToPayments = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    // Link stripe customer
    const customer = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (customer && !customer.userId) {
      await ctx.db.patch(customer._id, { userId });
    }

    // Link orders
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("customerEmail"), email))
      .collect();

    for (const order of orders) {
      if (!order.userId) {
        await ctx.db.patch(order._id, { userId });
      }
    }

    // Link subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("customerEmail"), email))
      .collect();

    for (const subscription of subscriptions) {
      if (!subscription.userId) {
        await ctx.db.patch(subscription._id, { userId });
      }
    }

    // Check if user has any paid orders or active subscriptions
    const hasPaidOrders = orders.some((o) => o.status === "paid");
    const hasActiveSubscription = subscriptions.some((s) => s.status === "active");

    // Ensure user has a role if they have paid orders or active subscription
    if (hasPaidOrders || hasActiveSubscription) {
      const existingRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (!existingRole) {
        await ctx.db.insert("userRoles", {
          userId,
          role: "user",
          createdAt: Date.now(),
        });
      }
    }
  },
});

// Client - cancel their own pending order
export const cancelMyOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    // Only allow cancelling pending orders
    if (order.status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    // Verify the order belongs to this user
    if (!order.userId || order.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(orderId);
  },
});

// Admin only - delete order
export const deleteOrder = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

// Admin only - delete subscription
export const deleteSubscription = mutation({
  args: {
    id: v.id("subscriptions"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

// Admin only - sync active subscriptions from Stripe API
export const syncSubscriptionsFromStripe = action({
  args: {},
  handler: async (ctx) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    // Fetch all active subscriptions from Stripe
    const response = await fetch("https://api.stripe.com/v1/subscriptions?status=active&limit=100&expand[]=data.customer", {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Stripe API error: ${err}`);
    }

    const data = await response.json() as {
      data: Array<{
        id: string;
        customer: { id: string; email: string };
        items: { data: Array<{ price: { id: string } }> };
        status: string;
        current_period_start: number;
        current_period_end: number;
        cancel_at_period_end: boolean;
        created: number;
      }>;
    };

    let synced = 0;
    for (const sub of data.data) {
      const customerEmail = sub.customer?.email ?? "";
      const priceId = sub.items?.data?.[0]?.price?.id ?? "";
      await ctx.runMutation(api.stripe.upsertSubscription, {
        stripeSubscriptionId: sub.id,
        stripeCustomerId: sub.customer.id,
        stripePriceId: priceId,
        status: "active",
        currentPeriodStart: sub.current_period_start * 1000,
        currentPeriodEnd: sub.current_period_end * 1000,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        customerEmail,
        createdAt: sub.created * 1000,
      });
      synced++;
    }

    return { synced };
  },
});

// Upsert subscription (used by sync action)
export const upsertSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    stripePriceId: v.string(),
    status: subscriptionStatusValidator,
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    customerEmail: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripePriceId: args.stripePriceId,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        customerEmail: args.customerEmail,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});
