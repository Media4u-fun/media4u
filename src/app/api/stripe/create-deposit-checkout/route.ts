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

interface DepositCheckoutRequest {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  location?: string;
  industry: string;
  website?: string;
  message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const stripe = getStripeClient();

    const body = (await request.json()) as DepositCheckoutRequest;
    const { name, businessName, email, phone, location, industry, website, message } = body;

    if (!name || !businessName || !email || !industry) {
      return NextResponse.json(
        { error: "Missing required fields: name, businessName, email, industry" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Create or get Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer: Stripe.Customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          businessName,
          industry,
        },
      });
    }

    // Create checkout session for $50 deposit
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "QuickSite Pro - Spot Reservation",
              description: "Refundable deposit to reserve your spot for a QuickSite Pro website.",
            },
            unit_amount: 5000, // $50 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/apply/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/apply`,
      metadata: {
        type: "website-factory-deposit",
        name,
        businessName,
        email,
        phone: phone ?? "",
        location: location ?? "",
        industry,
        website: website ?? "",
        message: message ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating deposit checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
