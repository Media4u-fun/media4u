import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  }
  return new ConvexHttpClient(convexUrl);
}

type ProductType = "starter" | "professional" | "webcare";
type CheckoutMode = "payment" | "subscription";

interface CheckoutRequest {
  productType: ProductType;
  userId?: string;
  customerEmail: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

function getPriceConfig(productType: ProductType): { priceId: string; mode: CheckoutMode; amount: number } | null {
  const configs: Record<ProductType, { priceIdEnv: string; mode: CheckoutMode; amount: number }> = {
    starter: {
      priceIdEnv: "STRIPE_PRICE_STARTER",
      mode: "payment",
      amount: 89900, // $899 in cents
    },
    professional: {
      priceIdEnv: "STRIPE_PRICE_PROFESSIONAL",
      mode: "payment",
      amount: 139900, // $1,399 in cents
    },
    webcare: {
      priceIdEnv: "STRIPE_PRICE_WEBCARE",
      mode: "subscription",
      amount: 14900, // $149 in cents (monthly)
    },
  };

  const config = configs[productType];
  if (!config) return null;

  const priceId = process.env[config.priceIdEnv];
  if (!priceId) return null;

  return {
    priceId,
    mode: config.mode,
    amount: config.amount,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const stripe = getStripeClient();
    const convex = getConvexClient();

    const body = (await request.json()) as CheckoutRequest;
    const { productType, userId, customerEmail, customerName, successUrl, cancelUrl } = body;

    if (!productType || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: productType, customerEmail" },
        { status: 400 }
      );
    }

    const priceConfig = getPriceConfig(productType);
    if (!priceConfig) {
      return NextResponse.json(
        { error: `Price not configured for ${productType}` },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Create or get Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer: Stripe.Customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          userId: userId ?? "",
        },
      });
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      mode: priceConfig.mode,
      success_url: successUrl ?? `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${siteUrl}/checkout/canceled`,
      metadata: {
        userId: userId ?? "",
        productType,
      },
    };

    // Add subscription-specific options
    if (priceConfig.mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: {
          userId: userId ?? "",
          productType,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create order record in Convex (for one-time payments)
    if (priceConfig.mode === "payment" && (productType === "starter" || productType === "professional")) {
      await convex.mutation(api.stripe.createOrder, {
        userId,
        stripeCustomerId: customer.id,
        stripeSessionId: session.id,
        productType,
        amount: priceConfig.amount,
        customerEmail,
        customerName,
      });
    }

    // Create or update Stripe customer record in Convex
    await convex.mutation(api.stripe.getOrCreateCustomer, {
      userId,
      stripeCustomerId: customer.id,
      email: customerEmail,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
