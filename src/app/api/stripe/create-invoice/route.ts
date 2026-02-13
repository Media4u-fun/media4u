import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(secretKey, { apiVersion: "2025-12-15.clover" });
}

function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  return new ConvexHttpClient(convexUrl);
}

interface CreateInvoiceRequest {
  projectId: string;
  customerEmail: string;
  customerName?: string;
  amountDollars: number;   // e.g. 500 for $500
  description: string;     // e.g. "Media4U - Website Setup Fee"
  monthlyAmount?: number;  // for the footer explanation, e.g. 149
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateInvoiceRequest;
    const { projectId, customerEmail, customerName, amountDollars, description, monthlyAmount } = body;

    if (!projectId || !customerEmail || !amountDollars) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const convex = getConvexClient();

    // Find or create a Stripe customer for this email
    const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer: Stripe.Customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName ?? undefined,
        metadata: { projectId },
      });
    }

    // Void any existing open/draft invoices for this project to prevent duplicates
    const existingInvoices = await stripe.invoices.list({
      customer: customer.id,
      status: "open",
      limit: 10,
    });
    for (const inv of existingInvoices.data) {
      if (inv.metadata?.projectId === projectId && inv.metadata?.type === "setup_fee") {
        await stripe.invoices.voidInvoice(inv.id);
      }
    }
    // Also check draft invoices
    const draftInvoices = await stripe.invoices.list({
      customer: customer.id,
      status: "draft",
      limit: 10,
    });
    for (const inv of draftInvoices.data) {
      if (inv.metadata?.projectId === projectId && inv.metadata?.type === "setup_fee") {
        await stripe.invoices.del(inv.id);
      }
    }

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: amountDollars * 100, // convert to cents
      currency: "usd",
      description,
    });

    // Build a plain-English footer explaining the full payment plan
    const monthly = monthlyAmount ?? 149;
    const footerText =
      `PAYMENT PLAN: This $${amountDollars} setup fee covers your first month of work. ` +
      `Your $${monthly}/month plan then begins on the 1st of next month and runs for 3 months, ` +
      `after which it automatically stops - no surprise charges. ` +
      `After those 3 months, you can start a new month whenever you need updates.`;

    // Create invoice with metadata so webhook can identify it
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
      metadata: {
        type: "setup_fee",
        projectId,
      },
      description: `Media4U - ${description}`,
      footer: footerText,
    });

    // Send the invoice (emails the client via Stripe)
    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    // Save invoice details to Convex
    await convex.mutation(api.projects.saveSetupInvoice, {
      projectId: projectId as Id<"projects">,
      stripeInvoiceId: sentInvoice.id,
      invoiceUrl: sentInvoice.hosted_invoice_url ?? "",
    });

    return NextResponse.json({
      success: true,
      invoiceId: sentInvoice.id,
      invoiceUrl: sentInvoice.hosted_invoice_url,
    });
  } catch (err) {
    console.error("Create invoice error:", err);
    const message = err instanceof Error ? err.message : "Failed to create invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
