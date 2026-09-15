import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// Routes that require strict brute-force protection (5 requests per minute)
const STRICT_AUTH_ROUTES = [
  "/api/auth",
  "/api/hosts/reset-password",
  "/login",
  "/register",
  "/forgot-password",
];

// Webhooks and third-party callbacks exempt from strict rate limiting
const EXEMPT_ROUTES = [
  "/api/payhero/callback",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip exempt webhook endpoints
  if (EXEMPT_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Determine rate limit category
  const isStrictAuth = STRICT_AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
                       pathname.includes("/password");
  const isApiRoute = pathname.startsWith("/api/");

  // Only rate-limit API routes and auth/login pages
  if (isStrictAuth || isApiRoute) {
    const ip = getClientIp(request.headers);
    const rateLimitType = isStrictAuth ? "auth" : "api";
    const identifier = `${rateLimitType}:${ip}`;

    const limitResult = await checkRateLimit(identifier, rateLimitType);

    if (!limitResult.success) {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: "Too many requests. Please slow down and try again later.",
            retryAfter: limitResult.reset,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limitResult.reset),
              "X-RateLimit-Limit": String(limitResult.limit),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(limitResult.reset),
            },
          }
        );
      }

      // If a web browser repeatedly hits login/register, return a 429 page
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Too Many Requests | Karibu VMS</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
              .card { background: white; border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 2.5rem; max-width: 440px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
              h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #b91c1c; }
              p { color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
              .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.75rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Rate Limit Exceeded</h1>
              <p>Too many requests were made from your IP address. For your security and protection, please wait ${limitResult.reset} seconds before trying again.</p>
              <a href="/login" class="btn">Try Again</a>
            </div>
          </body>
        </html>`,
        {
          status: 429,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Retry-After": String(limitResult.reset),
            "X-RateLimit-Limit": String(limitResult.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();

    // Attach rate limit headers
    response.headers.set("X-RateLimit-Limit", String(limitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(limitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(limitResult.reset));

    // Attach essential security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=*, microphone=(), geolocation=*");

    return response;
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public images / static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
