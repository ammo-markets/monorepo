import { getSession } from "@/lib/auth";

/**
 * GET /api/auth/session
 *
 * Returns the current session state.
 * If authenticated: { address, chainId }
 * If not authenticated: { address: null }
 */
export async function GET() {
  const session = await getSession();

  if (session.siwe) {
    return Response.json({
      address: session.siwe.address,
      chainId: session.siwe.chainId,
    });
  }

  return Response.json({ address: null });
}
