/**
 * Test helpers for API route handler testing.
 *
 * Tests use vi.mock() to intercept module-level imports before route modules load.
 * This file provides factory functions for mock objects used across test files.
 */
import type { Mock } from "vitest";
import { vi } from "vitest";

// ---------- Session Helpers ----------

/**
 * Create a mock session object simulating an authenticated user.
 * @param address Wallet address (defaults to a test address)
 * @param chainId Chain ID (defaults to 43113 / Fuji)
 */
export function createMockSession(
  address = "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
  chainId = 43113,
) {
  return { address, chainId };
}

/**
 * Create a 401 Response matching what requireSession() throws.
 */
export function createUnauthenticatedResponse(): Response {
  return new Response(JSON.stringify({ error: "Not authenticated" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a 403 Response matching what requireKeeper() throws for non-keepers.
 */
export function createForbiddenResponse(): Response {
  return new Response(JSON.stringify({ error: "Forbidden: not a keeper" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------- Prisma Mock Helpers ----------

/**
 * Create a mock Prisma client with chainable query methods.
 * Each method is a vi.fn() that can be configured per test via mockResolvedValue.
 */
export function createMockPrisma(): {
  user: { findUnique: Mock; upsert: Mock };
  order: { findUnique: Mock; findMany: Mock; count: Mock };
  shippingAddress: { upsert: Mock };
} {
  return {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    shippingAddress: {
      upsert: vi.fn(),
    },
  };
}

// ---------- Request Builders ----------

/**
 * Build a Request object suitable for passing to Next.js route handlers.
 * Next.js App Router route handlers accept standard Request objects.
 *
 * @param url Full URL string (e.g. "http://localhost:3000/api/orders")
 * @param options Standard RequestInit options (method, body, headers, etc.)
 */
export function buildRequest(url: string, options?: RequestInit): Request {
  return new Request(url, options);
}

/**
 * Build a POST request with JSON body.
 */
export function buildJsonPostRequest(
  url: string,
  body: Record<string, unknown>,
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
