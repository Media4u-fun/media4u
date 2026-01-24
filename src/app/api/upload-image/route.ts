import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare credentials not configured" },
        { status: 500 }
      );
    }

    // Create FormData for Cloudflare
    const cloudflareFormData = new FormData();
    cloudflareFormData.append("file", file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: cloudflareFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Cloudflare upload failed: ${JSON.stringify(error)}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      result?: { variants: string[] };
    };

    if (!data.success || !data.result?.variants[0]) {
      return NextResponse.json(
        { error: "Invalid response from Cloudflare" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.result.variants[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
