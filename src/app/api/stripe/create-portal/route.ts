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

interface PortalRequest {
  customerEmail: string;
  returnUrl?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const stripe = getStripeClient();
    const body = (await request.json()) as PortalRequest;
    const { customerEmail, returnUrl } = body;

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing customerEmail" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "No Stripe customer found for this email" }, { status: 404 });
    }

    const customer = customers.data[0];

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl ?? `${siteUrl}/portal/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      { status: 500 }
    );
  }
}
