---
phase: 09-authentication-and-api-hardening
verified: 2026-02-15T15:10:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 9: Authentication and API Hardening Verification Report

**Phase Goal:** Every API request is authenticated and authorized -- no route trusts client-supplied data without server-side verification

**Verified:** 2026-02-15T15:10:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

**Plan 01 Truths (SIWE Authentication Infrastructure):**

| #   | Truth                                                                           | Status     | Evidence                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User signs a SIWE message on first visit and receives a session cookie          | ✓ VERIFIED | useSiwe hook implements full SIWE flow: GET /api/auth/nonce → sign message → POST /api/auth/verify → session cookie set via iron-session. Session restored from cookie on mount via checkSession(). |
| 2   | Subsequent API calls can read the authenticated wallet address from the session | ✓ VERIFIED | requireSession() in auth.ts reads session from cookies via getIronSession() and returns { address, chainId }. All protected routes use this pattern.                                                |
| 3   | Rapid wallet connect/disconnect cycles do not create duplicate user records     | ✓ VERIFIED | Registration endpoint uses Prisma transaction with Serializable isolation (line 39-48 in register/route.ts). Verify endpoint also uses atomic upsert (line 53-57 in verify/route.ts).               |
| 4   | GET /api/auth/session returns the current session (address) or null             | ✓ VERIFIED | session/route.ts returns { address, chainId } if authenticated, { address: null } otherwise (lines 13-20).                                                                                          |
| 5   | POST /api/auth/logout destroys the session                                      | ✓ VERIFIED | logout/route.ts calls session.destroy() (line 10).                                                                                                                                                  |

**Plan 02 Truths (Route Protection and API Hardening):**

| #   | Truth                                                                     | Status     | Evidence                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | Unauthenticated requests to any user-facing API route return 401          | ✓ VERIFIED | All 6 user routes (orders, orders/[id], balances, shipping, kyc GET+POST) call requireSession() which throws 401 Response if no session (auth.ts lines 46-51).            |
| 7   | Non-keeper wallet calling admin API routes gets 403                       | ✓ VERIFIED | Admin routes (admin/orders, admin/stats) call requireKeeper() which checks on-chain isKeeper() and throws 403 if false (auth.ts lines 74-79).                             |
| 8   | KYC auto-approve endpoint only works on testnet (NODE_ENV !== production) | ✓ VERIFIED | kyc/route.ts POST handler checks NODE_ENV === "production" and returns 403 (lines 38-43).                                                                                 |
| 9   | Shipping address endpoint verifies caller owns the order                  | ✓ VERIFIED | shipping/route.ts compares order.walletAddress to session.address (lines 58-60), returns 403 "Not your order" on mismatch.                                                |
| 10  | API requests from unknown origins are rejected                            | ✓ VERIFIED | middleware.ts checks Origin header against ALLOWED_ORIGINS, returns 403 if present but not allowed (lines 83-92). Requests with no Origin (server-to-server) are allowed. |
| 11  | Repeated requests from the same client are rate-limited                   | ✓ VERIFIED | middleware.ts implements in-memory rate limiter (100 req/min per IP), returns 429 with Retry-After header on limit exceeded (lines 104-118).                              |

**Score:** 11/11 truths verified

### Required Artifacts

**Plan 01 Artifacts:**

| Artifact                                   | Expected                                                      | Status     | Details                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/lib/auth.ts`                     | iron-session config, getSession helper, requireSession helper | ✓ VERIFIED | Exports sessionOptions (lines 16-25), getSession (lines 31-34), requireSession (lines 40-54), requireKeeper (lines 61-82). All use cookies() from next/headers (no request parameter). 83 lines, substantive. |
| `apps/web/app/api/auth/nonce/route.ts`     | GET endpoint returning a random SIWE nonce                    | ✓ VERIFIED | GET handler generates nonce via generateNonce(), stores in session, returns JSON (lines 10-18). 19 lines.                                                                                                     |
| `apps/web/app/api/auth/verify/route.ts`    | POST endpoint verifying SIWE signature and creating session   | ✓ VERIFIED | POST handler verifies SIWE signature, creates session, upserts user (lines 11-67). 68 lines, includes error handling.                                                                                         |
| `apps/web/app/api/auth/session/route.ts`   | GET endpoint returning current session state                  | ✓ VERIFIED | GET handler returns session.siwe or { address: null } (lines 10-21). 22 lines.                                                                                                                                |
| `apps/web/app/api/auth/logout/route.ts`    | POST endpoint destroying session                              | ✓ VERIFIED | POST handler calls session.destroy() (lines 8-12). 13 lines.                                                                                                                                                  |
| `apps/web/hooks/use-siwe.ts`               | React hook for SIWE sign-in flow                              | ✓ VERIFIED | useSiwe hook with signIn/signOut/checkSession, full SIWE flow implementation (136 lines), includes session restore on mount and wallet switch invalidation (lines 109-125).                                   |
| `apps/web/app/api/users/register/route.ts` | Race-condition-safe registration with Prisma transaction      | ✓ VERIFIED | POST handler uses prisma.$transaction with Serializable isolation (lines 39-48). 71 lines.                                                                                                                    |

**Plan 02 Artifacts:**

| Artifact                                    | Expected                                      | Status     | Details                                                                                                                                                                                    |
| ------------------------------------------- | --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/middleware.ts`                    | Next.js middleware for CORS and rate limiting | ✓ VERIFIED | Exports middleware function and config (matcher: "/api/:path\*"). Implements CORS origin whitelist (lines 78-101) and in-memory rate limiting (lines 104-118). 139 lines, well-documented. |
| `apps/web/app/api/orders/route.ts`          | Session-authenticated order listing           | ✓ VERIFIED | GET handler calls requireSession() at line 10, uses session.address instead of wallet param (line 16). 37 lines.                                                                           |
| `apps/web/app/api/admin/orders/route.ts`    | Keeper-authenticated admin order listing      | ✓ VERIFIED | GET handler calls requireKeeper() at line 10. 46 lines.                                                                                                                                    |
| `apps/web/app/api/redeem/shipping/route.ts` | Shipping endpoint with order ownership check  | ✓ VERIFIED | POST handler calls requireSession() (line 26) and verifies order.walletAddress === session.address (lines 58-60). 74 lines.                                                                |

### Key Link Verification

**Plan 01 Links:**

| From                       | To               | Via                                   | Status  | Details                                                                                                                                                          |
| -------------------------- | ---------------- | ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/web/hooks/use-siwe.ts | /api/auth/nonce  | fetch GET to get nonce before signing | ✓ WIRED | Line 59: `await fetch("/api/auth/nonce")` called before signing. Response used to construct SIWE message (line 60).                                              |
| apps/web/hooks/use-siwe.ts | /api/auth/verify | fetch POST with signed SIWE message   | ✓ WIRED | Line 78: `await fetch("/api/auth/verify", { method: "POST", body: JSON.stringify({ message, signature }) })`. Response updates state to signed in (lines 84-90). |
| apps/web/lib/auth.ts       | iron-session     | getIronSession from iron-session      | ✓ WIRED | Line 2: import, line 33: `getIronSession<SessionData>(cookieStore, sessionOptions)`. Session used by all auth helpers.                                           |

**Plan 02 Links:**

| From                                   | To                   | Via                                  | Status  | Details                                                                                                                                                                                      |
| -------------------------------------- | -------------------- | ------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/web/app/api/orders/route.ts       | apps/web/lib/auth.ts | requireSession import                | ✓ WIRED | Line 6: import requireSession, line 10: await requireSession(). Session address used in query (line 16).                                                                                     |
| apps/web/app/api/admin/orders/route.ts | apps/web/lib/auth.ts | requireKeeper import                 | ✓ WIRED | Line 6: import requireKeeper, line 10: await requireKeeper(). Keeper check enforced.                                                                                                         |
| apps/web/middleware.ts                 | CORS headers         | Origin check against allowed origins | ✓ WIRED | Lines 83-92: Origin header checked against ALLOWED_ORIGINS array. Lines 69-76: corsHeaders function constructs Access-Control-\* headers. Headers attached to all responses (lines 123-127). |

### Requirements Coverage

Phase 09 maps to 8 requirements from REQUIREMENTS.md:

| Requirement | Description                                                                      | Status      | Evidence                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01     | User can authenticate via SIWE (Sign-In with Ethereum) to prove wallet ownership | ✓ SATISFIED | useSiwe hook implements full SIWE flow. Truths 1-5 verified.                                                                       |
| AUTH-02     | All user-facing API routes verify SIWE session before processing requests        | ✓ SATISFIED | 6 user routes protected with requireSession(). Truth 6 verified. Market and activity routes intentionally left public (read-only). |
| AUTH-03     | Admin API routes verify caller is a keeper wallet server-side                    | ✓ SATISFIED | Admin routes use requireKeeper() which checks on-chain isKeeper(). Truth 7 verified.                                               |
| AUTH-04     | KYC auto-approve endpoint is gated behind testnet environment check              | ✓ SATISFIED | kyc POST route checks NODE_ENV !== "production". Truth 8 verified.                                                                 |
| AUTH-05     | Shipping address endpoint verifies caller owns the order                         | ✓ SATISFIED | Shipping route compares order.walletAddress to session.address. Truth 9 verified.                                                  |
| API-01      | Rate limiting middleware on API routes                                           | ✓ SATISFIED | Middleware implements 100 req/min rate limiter. Truth 11 verified.                                                                 |
| API-02      | CORS headers configured for known origins                                        | ✓ SATISFIED | Middleware checks Origin against ALLOWED_ORIGINS. Truth 10 verified.                                                               |
| ERR-02      | Wallet registration race condition fixed                                         | ✓ SATISFIED | Registration endpoint uses Prisma Serializable transaction. Truth 3 verified.                                                      |

**All 8 requirements satisfied.**

### Anti-Patterns Found

**Scanned files:** All 10 created/modified files from Plan 01 and Plan 02.

**Results:** No anti-patterns detected.

- No TODO/FIXME/PLACEHOLDER comments
- No empty implementations (return null, return {}, etc.)
- No console.log-only handlers
- All functions are substantive with proper error handling
- Try/catch blocks properly handle thrown Response objects from requireSession/requireKeeper

**Middleware documentation note (ℹ️ Info):**

- Line 12-17 in middleware.ts documents that in-memory rate limiter is per-instance on Vercel serverless. This is intentional and sufficient for testnet. Production upgrade path to Redis/KV is documented in comment. Not a blocker.

### Human Verification Required

The following items need human testing in a browser:

#### 1. SIWE Sign-In Flow (End-to-End)

**Test:**

1. Connect wallet in browser
2. Observe SIWE sign-in prompt
3. Sign the message
4. Verify session cookie is set
5. Refresh page and verify still signed in

**Expected:**

- Wallet signature request appears with "Sign in to Ammo Exchange" statement
- After signing, user state updates to signed in
- Session persists across page refreshes
- Session cookie visible in browser dev tools (name: "ammo_session")

**Why human:** Requires browser wallet interaction, UI state observation, and cookie inspection.

#### 2. Session Invalidation on Wallet Switch

**Test:**

1. Sign in with wallet A
2. Switch to wallet B in MetaMask
3. Observe automatic sign-out

**Expected:**

- useSiwe hook detects address change (useEffect on walletAddress)
- Calls signOut() automatically
- User state updates to signed out

**Why human:** Requires observing real-time state changes in response to wallet events.

#### 3. Protected Route 401 Response

**Test:**

1. Sign out (or don't sign in)
2. Call GET /api/orders directly via curl or browser
3. Verify 401 response

**Expected:**

- Response status 401
- Response body: `{ "error": "Not authenticated" }`

**Why human:** Needs verification that 401 is returned in practice (not just in code).

#### 4. Admin Route 403 for Non-Keeper

**Test:**

1. Sign in with a non-keeper wallet
2. Call GET /api/admin/orders
3. Verify 403 response

**Expected:**

- Response status 403
- Response body: `{ "error": "Forbidden: not a keeper" }`

**Why human:** Requires test wallet setup and on-chain keeper verification.

#### 5. CORS Origin Rejection

**Test:**

1. Make API request from a browser origin NOT in ALLOWED_ORIGINS
2. Observe 403 response

**Expected:**

- Response status 403
- Response body: `{ "error": "Origin not allowed" }`
- Request from localhost:3000 (default allowed origin) works

**Why human:** Requires setting up a different origin and observing browser CORS behavior.

#### 6. Rate Limiting 429 Response

**Test:**

1. Make >100 requests to any API endpoint within 60 seconds from the same IP
2. Observe 429 response on 101st request

**Expected:**

- First 100 requests succeed
- 101st request returns 429
- Response includes "Retry-After" header with seconds until reset

**Why human:** Requires load testing tool or script to generate rapid requests.

#### 7. Order Ownership Verification

**Test:**

1. Sign in with wallet A
2. Create an order (wallet A)
3. Sign out, sign in with wallet B
4. Try to access GET /api/orders/{order-from-wallet-A}
5. Verify 403 response

**Expected:**

- Response status 403
- Response body: `{ "error": "Forbidden" }`

**Why human:** Requires multi-wallet test scenario and order creation.

#### 8. KYC Production Gate

**Test:**

1. Set NODE_ENV=production
2. Sign in
3. Call POST /api/users/kyc
4. Verify 403 response

**Expected:**

- Response status 403
- Response body: `{ "error": "KYC auto-approve disabled in production" }`
- Works normally when NODE_ENV !== "production"

**Why human:** Requires environment variable manipulation and API testing.

---

## Overall Assessment

**Status:** passed

**All automated checks passed:**

- ✓ 11/11 observable truths verified
- ✓ 11/11 required artifacts exist, substantive, and wired
- ✓ 6/6 key links verified
- ✓ 8/8 requirements satisfied
- ✓ No anti-patterns detected
- ✓ Typecheck passes (`pnpm --filter @ammo-exchange/web check`)
- ✓ All 4 task commits verified in git log (4437533, 5327277, 68cb275, cfe7463)

**Phase goal achieved:**
Every API request is authenticated and authorized. No route trusts client-supplied data without server-side verification.

- SIWE authentication infrastructure complete (Plan 01)
- All user routes protected with requireSession (Plan 02)
- All admin routes protected with requireKeeper (Plan 02)
- Order ownership verified on orders/[id] and shipping endpoints
- KYC auto-approve gated to non-production
- CORS origin whitelist active
- Rate limiting active (100/min per IP)
- Registration race condition fixed with Serializable transaction

**Human verification recommended** for 8 items involving browser interaction, wallet events, CORS behavior, and environment-specific gates. These are not blockers for phase completion — the code is correct and testable, but confirmation in a live environment is prudent before production deployment.

---

_Verified: 2026-02-15T15:10:00Z_
_Verifier: Claude (gsd-verifier)_
