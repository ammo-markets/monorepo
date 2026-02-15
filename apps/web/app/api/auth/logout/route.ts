import { getSession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 *
 * Destroys the current session and clears the cookie.
 */
export async function POST() {
  const session = await getSession();
  session.destroy();

  return Response.json({ ok: true });
}
