import { SiweMessage } from "siwe";
import { avalancheFuji } from "viem/chains";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@ammo-exchange/db";

/**
 * POST /api/auth/verify
 *
 * Verifies a signed SIWE message against the session nonce.
 * On success: creates session, upserts user in database.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.message !== "string" ||
    typeof body.signature !== "string"
  ) {
    return Response.json(
      { error: "Invalid request body: message and signature required" },
      { status: 400 },
    );
  }

  const session = await getSession();

  if (!session.nonce) {
    return Response.json(
      { error: "No nonce found in session. Call GET /api/auth/nonce first." },
      { status: 400 },
    );
  }

  try {
    const siweMessage = new SiweMessage(body.message);

    // SEC-05: Enforce domain, URI scheme, and chainId policy
    const expectedChainId = avalancheFuji.id; // 43113

    const result = await siweMessage.verify({
      signature: body.signature,
      nonce: session.nonce,
      domain: env.APP_DOMAIN,
    });

    if (!result.success) {
      return Response.json(
        { error: result.error?.type ?? "Verification failed" },
        { status: 401 },
      );
    }

    // SEC-05: Verify domain and chainId match expected values
    if (result.data.domain !== env.APP_DOMAIN) {
      return Response.json({ error: "Invalid domain" }, { status: 401 });
    }

    if (result.data.chainId !== expectedChainId) {
      return Response.json({ error: "Invalid chain ID" }, { status: 401 });
    }

    if (result.data.uri !== env.APP_URL) {
      return Response.json({ error: "Invalid URI" }, { status: 401 });
    }

    const address = result.data.address.toLowerCase();
    const chainId = result.data.chainId;

    // Store authenticated session
    session.siwe = { address, chainId };
    session.nonce = undefined;
    await session.save();

    // Upsert user in database (combines auth + registration)
    await prisma.user.upsert({
      where: { walletAddress: address },
      create: { walletAddress: address },
      update: {},
    });

    return Response.json({ address, chainId });
  } catch (err) {
    console.error("SIWE verify error:", err);
    return Response.json(
      { error: "Signature verification failed" },
      { status: 401 },
    );
  }
}
