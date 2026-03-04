import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

// Returns a domain-to-slug mapping for all active client orgs with custom domains.
// Used by middleware for custom domain routing.
export async function GET() {
  try {
    const orgs = await fetchQuery(api.factory.getDomainMappings);
    return NextResponse.json(orgs);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
