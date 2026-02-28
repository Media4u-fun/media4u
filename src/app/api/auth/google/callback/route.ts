import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/admin/settings?google=error", req.url)
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
        : "http://localhost:3000/api/auth/google/callback"
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/admin/settings?google=no_refresh_token", req.url)
      );
    }

    // Save tokens to Convex
    await convex.mutation(api.googleCalendar.saveTokens, {
      accessToken: tokens.access_token ?? undefined,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date ?? undefined,
    });

    return NextResponse.redirect(
      new URL("/admin/settings?google=success", req.url)
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/admin/settings?google=error", req.url)
    );
  }
}
