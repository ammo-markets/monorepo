import type { IronSession, SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { publicClient } from "@/lib/viem";
import { env } from "@/lib/env";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { contracts } from "@/lib/chain";

export interface SessionData {
  nonce?: string;
  siwe?: {
    address: string;
    chainId: number;
  };
}

export const sessionOptions: SessionOptions = {
  cookieName: "ammo_session",
  password: env.SESSION_SECRET,
  ttl: 86400, // 24 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  },
};

/**
 * Get the current iron-session from cookies.
 * Uses Next.js App Router cookies() — no request parameter needed.
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Require an authenticated session. Throws a Response if not authenticated.
 * Used by protected API routes.
 */
export async function requireSession(): Promise<{
  address: string;
  chainId: number;
}> {
  const session = await getSession();

  if (!session.siwe) {
    throw new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return session.siwe;
}

/**
 * Require an authenticated session with keeper role.
 * Checks the AmmoManager contract's isKeeper(address) on-chain.
 * Throws 401 if not authenticated, 403 if not a keeper.
 */
export async function requireKeeper(): Promise<{
  address: string;
  chainId: number;
}> {
  const siwe = await requireSession();

  const isKeeper = await publicClient.readContract({
    address: contracts.manager,
    abi: AmmoManagerAbi,
    functionName: "isKeeper",
    args: [siwe.address as `0x${string}`],
  });

  if (!isKeeper) {
    throw new Response(JSON.stringify({ error: "Forbidden: not a keeper" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return siwe;
}
