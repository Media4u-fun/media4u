import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

type FactoryPlan = "starter" | "growth" | "enterprise";

interface FactoryCheckoutRequest {
  plan: FactoryPlan;
  paymentType?: "subscribe" | "own";
  customerEmail: string;
  orgSlug: string; // To link back to the org after payment
  successUrl?: string;
  cancelUrl?: string;
}

function getFactoryPriceId(plan: FactoryPlan): string | null {
  const envMap: Record<FactoryPlan, string> = {
    starter: "STRIPE_FACTORY_PRICE_STARTER",
    growth: "STRIPE_FACTORY_PRICE_GROWTH",
    enterprise: "STRIPE_FACTORY_PRICE_ENTERPRISE",
  };

  return process.env[envMap[plan]] || null;
}

function getOwnItPriceIds(plan: FactoryPlan): { setup: string | null; maintenance: string | null } {
  const setupMap: Record<FactoryPlan, string> = {
    starter: "STRIPE_FACTORY_SETUP_STARTER",
    growth: "STRIPE_FACTORY_SETUP_GROWTH",
    enterprise: "STRIPE_FACTORY_SETUP_ENTERPRISE",
  };
  const maintMap: Record<FactoryPlan, string> = {
    starter: "STRIPE_FACTORY_MAINT_STARTER",
    growth: "STRIPE_FACTORY_MAINT_GROWTH",
    enterprise: "STRIPE_FACTORY_MAINT_ENTERPRISE",
  };
  return {
    setup: process.env[setupMap[plan]] || null,
    maintenance: process.env[maintMap[plan]] || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FactoryCheckoutRequest;
    const { plan, paymentType = "subscribe", customerEmail, orgSlug, successUrl, cancelUrl } = body;

    if (!plan || !customerEmail || !orgSlug) {
      return NextResponse.json(
        { error: "Missing required fields: plan, customerEmail, orgSlug" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const commonMetadata = {
      factoryOrg: "true",
      plan,
      paymentType,
      orgSlug,
      email: customerEmail,
    };

    if (paymentType === "own") {
      // Own It mode - one-time setup fee + monthly maintenance subscription
      const { setup, maintenance } = getOwnItPriceIds(plan);
      if (!setup || !maintenance) {
        return NextResponse.json(
          { error: `Stripe prices not configured for Own It plan: ${plan}. Set STRIPE_FACTORY_SETUP_${plan.toUpperCase()} and STRIPE_FACTORY_MAINT_${plan.toUpperCase()} in your environment.` },
          { status: 500 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: customerEmail,
        line_items: [
          { price: setup, quantity: 1 },
          { price: maintenance, quantity: 1 },
        ],
        metadata: commonMetadata,
        subscription_data: {
          metadata: { factoryOrg: "true", plan, paymentType, orgSlug },
        },
        success_url: successUrl || `${siteUrl}/admin/factory?checkout=success&plan=${plan}&type=own`,
        cancel_url: cancelUrl || `${siteUrl}/admin/factory?checkout=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    // Subscribe mode - single monthly subscription (existing behavior)
    const priceId = getFactoryPriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for plan: ${plan}. Set STRIPE_FACTORY_PRICE_${plan.toUpperCase()} in your environment.` },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: commonMetadata,
      subscription_data: {
        metadata: { factoryOrg: "true", plan, paymentType, orgSlug },
      },
      success_url: successUrl || `${siteUrl}/admin/factory?checkout=success&plan=${plan}`,
      cancel_url: cancelUrl || `${siteUrl}/admin/factory?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Factory checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
