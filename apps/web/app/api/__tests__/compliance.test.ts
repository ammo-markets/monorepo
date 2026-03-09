/**
 * API Compliance Tests (TEST-04)
 *
 * Verify:
 * - State code normalization (lowercase -> uppercase)
 * - Restricted state rejection for redeem shipping
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSession,
  createMockPrisma,
  buildJsonPostRequest,
} from "./helpers";

// ---------- Mock setup (hoisted by vitest) ----------

const mockPrisma = createMockPrisma();

vi.mock("@ammo-exchange/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/viem", () => ({
  publicClient: {
    readContract: vi.fn(),
  },
}));

const mockRequireSession = vi.fn();
const mockRequireKeeper = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  requireKeeper: (...args: unknown[]) => mockRequireKeeper(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock("@/lib/serialize", () => ({
  serializeBigInts: <T>(obj: T): T => obj,
}));

// ---------- Tests ----------

describe("State code validation (TEST-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue(createMockSession());
  });

  it("POST /api/redeem/shipping rejects restricted state (NY)", async () => {
    const { POST } = await import("../redeem/shipping/route");
    const request = buildJsonPostRequest(
      "http://localhost:3000/api/redeem/shipping",
      {
        orderId: "order-123",
        name: "John Doe",
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    );
    const response = await POST(request as never);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(JSON.stringify(body.details)).toContain("restricted");
  });

  it("POST /api/redeem/shipping normalizes lowercase state to uppercase", async () => {
    // TX is an allowed state -- should pass validation
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order-123",
      type: "REDEEM",
      walletAddress: "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
    });
    mockPrisma.shippingAddress.upsert.mockResolvedValue({
      orderId: "order-123",
      name: "John Doe",
      line1: "456 Oak Ave",
      city: "Houston",
      state: "TX",
      zip: "77001",
    });

    const { POST } = await import("../redeem/shipping/route");
    const request = buildJsonPostRequest(
      "http://localhost:3000/api/redeem/shipping",
      {
        orderId: "order-123",
        name: "John Doe",
        line1: "456 Oak Ave",
        city: "Houston",
        state: "tx",
        zip: "77001",
      },
    );
    const response = await POST(request as never);

    expect(response.status).toBe(201);
    // Verify the shipping address upsert received uppercased state
    expect(mockPrisma.shippingAddress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ state: "TX" }),
      }),
    );
  });

  it("POST /api/redeem/shipping rejects invalid state code (ZZ)", async () => {
    const { POST } = await import("../redeem/shipping/route");
    const request = buildJsonPostRequest(
      "http://localhost:3000/api/redeem/shipping",
      {
        orderId: "order-123",
        name: "John Doe",
        line1: "123 Main St",
        city: "Nowhere",
        state: "ZZ",
        zip: "99999",
      },
    );
    const response = await POST(request as never);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(JSON.stringify(body.details)).toContain("Invalid US state code");
  });
});
