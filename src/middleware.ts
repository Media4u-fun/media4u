import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TVR domain hostnames
const TVR_HOSTS = ["trivirtualroundtable.net", "www.trivirtualroundtable.net"];

// Shared routes that both sites can access (no rewriting)
const SHARED_PREFIXES = ["/admin", "/portal", "/api", "/login", "/signup", "/forgot-password", "/reset-password", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0] || "";
  const pathname = request.nextUrl.pathname;

  // TVR domain routing: rewrite / -> /tvr, /about -> /tvr/about, etc.
  if (TVR_HOSTS.includes(hostname)) {
    const isShared = SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isAlreadyTVR = pathname.startsWith("/tvr");

    if (!isShared && !isAlreadyTVR) {
      const url = request.nextUrl.clone();
      url.pathname = `/tvr${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  const response = NextResponse.next();

  // Content Security Policy header
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.fontshare.com https://api.fontshare.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://cdn.fontshare.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://api.fontshare.com https://cdn.fontshare.com",
      "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://api.github.com https://api.stripe.com",
      "frame-src 'self' https://www.youtube.com https://js.stripe.com",
      "media-src 'self' data: https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
