import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const http = httpRouter();

// Register Better Auth routes with CORS enabled for client-side access
authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [siteUrl, "http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Stripe webhook endpoint
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe environment variables");
      return new Response("Server configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-12-15.clover" });
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.mode === "payment") {
            // Check if this is a Website Factory deposit
            if (session.metadata?.type === "website-factory-deposit") {
              // Create lead from deposit payment
              await ctx.runMutation(internal.leads.createLeadFromDeposit, {
                name: session.metadata.name,
                businessName: session.metadata.businessName,
                email: session.metadata.email,
                phone: session.metadata.phone || undefined,
                location: session.metadata.location || undefined,
                industry: session.metadata.industry,
                website: session.metadata.website || undefined,
                notes: session.metadata.message || "Applied via /apply landing page with $50 deposit",
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                depositAmount: 5000, // $50 in cents
              });
              break;
            }

            // One-time payment completed (regular orders)
            const orderId = await ctx.runMutation(internal.stripe.updateOrderStatus, {
              stripeSessionId: session.id,
              status: "paid",
              stripePaymentIntentId: session.payment_intent as string,
              paidAt: Date.now(),
            });

            // If this order is linked to a project, mark project as paid
            const projectId = session.metadata?.projectId;
            if (projectId && orderId) {
              await ctx.runMutation(internal.projects.markProjectAsPaid, {
                projectId,
                orderId,
              });
            }
          } else if (session.mode === "subscription") {
            // Subscription checkout completed - subscription created event will handle the details
            console.log("Subscription checkout completed:", session.id);
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;

          // Check if this is a setup fee invoice for a custom deal project
          if (invoice.metadata?.type === "setup_fee" && invoice.metadata?.projectId) {
            await ctx.runMutation(internal.projects.markSetupInvoicePaidByWebhook, {
              stripeInvoiceId: invoice.id,
            });
            break;
          }

          const subscriptionDetails = invoice.parent?.subscription_details;
          const subscriptionId = subscriptionDetails?.subscription;

          if (subscriptionId && invoice.billing_reason === "subscription_create") {
            // New subscription - create record using invoice period
            const subId = typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
            // Get price ID and amount from line item pricing
            const lineItem = invoice.lines.data[0];
            const priceId = lineItem?.pricing?.price_details?.price;
            const priceIdStr = typeof priceId === "string" ? priceId : priceId?.id ?? "";
            const planAmount = typeof lineItem?.amount === "number" ? lineItem.amount : undefined;

            await ctx.runMutation(internal.stripe.createSubscription, {
              userId: subscriptionDetails?.metadata?.userId || undefined,
              stripeCustomerId: invoice.customer as string,
              stripeSubscriptionId: subId,
              stripePriceId: priceIdStr,
              status: "active",
              currentPeriodStart: invoice.period_start * 1000,
              currentPeriodEnd: invoice.period_end * 1000,
              cancelAtPeriodEnd: false,
              customerEmail: invoice.customer_email ?? "",
              planAmount,
            });
          }
          break;
        }

        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription;
          // If this is a custom deal subscription, apply the cancel_at from metadata
          const cancelAtStr = subscription.metadata?.cancelAt;
          if (subscription.metadata?.customDeal === "true" && cancelAtStr) {
            const cancelAtTimestamp = parseInt(cancelAtStr, 10);
            if (!isNaN(cancelAtTimestamp)) {
              await stripe.subscriptions.update(subscription.id, {
                cancel_at: cancelAtTimestamp,
              });
            }
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          // Use start_date and created as fallbacks for period tracking
          const periodStart = subscription.start_date ?? subscription.created;
          // Estimate period end as 30 days after start for monthly subscriptions
          const periodEnd = periodStart + (30 * 24 * 60 * 60);
          await ctx.runMutation(internal.stripe.updateSubscription, {
            stripeSubscriptionId: subscription.id,
            status: subscription.status as "active" | "past_due" | "canceled" | "unpaid",
            currentPeriodStart: periodStart * 1000,
            currentPeriodEnd: periodEnd * 1000,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await ctx.runMutation(internal.stripe.updateSubscription, {
            stripeSubscriptionId: subscription.id,
            status: "canceled",
          });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error processing webhook:", err);
      return new Response("Webhook processing error", { status: 500 });
    }
  }),
});

export default http;
