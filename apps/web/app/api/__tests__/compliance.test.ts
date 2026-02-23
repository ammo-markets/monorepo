/**
 * API Compliance Tests (TEST-04)
 *
 * Verify:
 * - KYC data masking (gov ID never exposed in full)
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

describe("KYC data masking (TEST-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue(createMockSession());
  });

  it("GET /api/users/kyc masks govIdNumber to last 4 chars (****XXXX format)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      kycStatus: "APPROVED",
      kycFullName: "John Doe",
      kycDateOfBirth: new Date("1990-01-01"),
      kycState: "TX",
      kycGovIdType: "DRIVERS_LICENSE",
      kycGovIdNumber: "DL123456789",
    });

    const { GET } = await import("../users/kyc/route");
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.kycGovIdNumber).toBe("****6789");
    // Must never contain the full ID
    expect(body.kycGovIdNumber).not.toContain("DL123456789");
  });

  it("GET /api/users/kyc returns null govIdNumber when user has none", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      kycStatus: "NONE",
      kycFullName: null,
      kycDateOfBirth: null,
      kycState: null,
      kycGovIdType: null,
      kycGovIdNumber: null,
    });

    const { GET } = await import("../users/kyc/route");
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.kycGovIdNumber).toBeNull();
  });

  it("GET /api/users/kyc returns null when user does not exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { GET } = await import("../users/kyc/route");
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.kycGovIdNumber).toBeNull();
    expect(body.kycStatus).toBe("NONE");
  });
});

describe("State code validation (TEST-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue(createMockSession());
  });

  it("POST /api/users/kyc normalizes lowercase state to uppercase", async () => {
    mockPrisma.user.upsert.mockResolvedValue({ kycStatus: "APPROVED" });

    const { POST } = await import("../users/kyc/route");
    const request = buildJsonPostRequest(
      "http://localhost:3000/api/users/kyc",
      {
        fullName: "Jane Doe",
        dateOfBirth: "1990-06-15",
        state: "ca",
        govIdType: "DRIVERS_LICENSE",
        govIdNumber: "DL987654321",
      },
    );
    const response = await POST(request as never);

    expect(response.status).toBe(200);
    // Verify upsert was called with normalized state
    expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ kycState: "CA" }),
        update: expect.objectContaining({ kycState: "CA" }),
      }),
    );
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
