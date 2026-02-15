import { generateNonce } from "siwe";
import { getSession } from "@/lib/auth";

/**
 * GET /api/auth/nonce
 *
 * Generates a random SIWE nonce and stores it in the session.
 * The client uses this nonce when constructing the SIWE message to sign.
 */
export async function GET() {
  const session = await getSession();
  const nonce = generateNonce();

  session.nonce = nonce;
  await session.save();

  return Response.json({ nonce });
}
