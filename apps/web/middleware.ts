import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Allowed origins for CORS. Read from ALLOWED_ORIGINS env var (comma-separated)
 * or default to localhost for development.
 */
const ALLOWED_ORIGINS: string[] = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

/**
 * In-memory rate limiter. Per-IP request tracking.
 *
 * NOTE: This is an in-memory rate limiter. On Vercel serverless, each function
 * instance has its own memory, so this is per-instance (not global). For true
 * global rate limiting, use Vercel KV or Upstash Redis. This is sufficient for
 * testnet / single-instance deployments.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const RATE_LIMIT_MAX = 100; // max requests per window per IP

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

let requestCounter = 0;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // SEC-03: Use last entry (added by trusted proxy), not first (client-supplied)
    const parts = forwarded.split(",");
    return parts[parts.length - 1]!.trim();
  }
  // request.ip is available at runtime on Vercel but not in Next.js types
  return (request as NextRequest & { ip?: string }).ip ?? "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodic cleanup: every 1000 requests, purge stale entries
  requestCounter++;
  if (requestCounter % 1000 === 0) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) {
        rateLimitMap.delete(k);
      }
    }
  }

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // 1. CORS check -- only block if Origin IS present but not in allowed list.
  //    Requests with no Origin header (server-to-server, curl) are allowed through.
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }
  }

  // 2. Rate limit check
  const rateLimitKey = getRateLimitKey(request);
  const { allowed, retryAfter } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    });
  }

  // 3. Continue with CORS headers attached
  const response = NextResponse.next();

  if (origin) {
    const headers = corsHeaders(origin);
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

/**
 * Only run middleware on API routes.
 */
export const config = {
  matcher: "/api/:path*",
};
