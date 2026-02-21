---
phase: 29-security-hardening
verified: 2026-02-21T06:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "SIWE verification checks that the URI matches the expected callback, not just nonce validity"
  gaps_remaining: []
  regressions: []
---

# Phase 29: Security Hardening Verification Report

**Phase Goal:** All user-facing endpoints enforce proper data masking, input validation, and authentication policy so sensitive data never leaks and invalid inputs are rejected
**Verified:** 2026-02-21T06:00:00Z
**Status:** passed
**Re-verification:** Yes -- after gap closure (SIWE URI check added)

## Goal Achievement

### Observable Truths (Success Criteria)

| #   | Truth                                                                                                       | Status   | Evidence                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | GET /api/users/kyc returns masked govIdNumber (last 4 only, full ID never returned)                         | VERIFIED | `maskedGovId = user?.kycGovIdNumber ? \`\*\*\*\*${user.kycGovIdNumber.slice(-4)}\` : null`returned as`kycGovIdNumber` in response (kyc/route.ts lines 55-65)                                                                       |
| 2   | KYC mutation hook surfaces non-2xx responses as thrown errors                                               | VERIFIED | `useKycSubmit` mutationFn has `if (!res.ok) { throw new Error(...) }` before `res.json()` (use-kyc.ts lines 62-68), outside any try/catch                                                                                          |
| 3   | Rate limiter extracts IP from last x-forwarded-for entry (trusted proxy), not first                         | VERIFIED | `const parts = forwarded.split(","); return parts[parts.length - 1]!.trim();` (middleware.ts lines 30-31)                                                                                                                          |
| 4   | State code input is uppercased and validated against VALID_US_STATE_CODES before any restricted-state check | VERIFIED | All 3 routes use `.transform(s => s.toUpperCase()).refine(s => VALID_US_STATE_CODES.has(s), ...)` before restricted-state refine. VALID_US_STATE_CODES is a Set<string> of 56 codes in shared constants.                           |
| 5   | SIWE verification checks domain, URI matches expected callback, and chainId -- not just nonce               | VERIFIED | Domain check: passed to verify() + post-verify if-check (line 60). ChainId: post-verify if-check (line 64). URI: post-verify if-check `if (result.data.uri !== expectedUri)` at lines 68-70. All three policy checks now enforced. |

**Score:** 5/5 truths verified

### Gap Resolution Detail (SC-5)

The previous verification found that `expectedUri` was only used to extract the URI scheme string (http vs https) and `result.data.uri` was never compared against it. The fix adds an explicit check at lines 68-70 of `apps/web/app/api/auth/verify/route.ts`:

```typescript
if (result.data.uri !== expectedUri) {
  return Response.json({ error: "Invalid URI" }, { status: 401 });
}
```

This mirrors the structure of the existing domain and chainId post-verify checks. The order of checks is now:

1. `result.success` check -- library validates nonce, expiry, signature
2. `result.data.domain !== expectedDomain` -> 401
3. `result.data.chainId !== expectedChainId` -> 401
4. `result.data.uri !== expectedUri` -> 401 (new)

### Required Artifacts

| Artifact                                 | Expected                                                | Status   | Details                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/constants/index.ts` | VALID_US_STATE_CODES set for server-side validation     | VERIFIED | Set<string> with 56 codes (50 states + DC + territories)                                                             |
| `apps/web/app/api/users/kyc/route.ts`    | Masked govId in GET, uppercased+validated state in POST | VERIFIED | GET: maskedGovId computed and returned (lines 55-65). POST: Zod schema with transform+refine pipeline (lines 22-28). |
| `apps/web/middleware.ts`                 | Trusted proxy IP extraction                             | VERIFIED | Last x-forwarded-for entry used (lines 29-31)                                                                        |
| `apps/web/app/api/auth/verify/route.ts`  | SIWE domain/URI/chainId policy enforcement              | VERIFIED | All three post-verify if-checks present: domain (line 60), chainId (line 64), URI (line 68).                         |
| `apps/web/hooks/use-kyc.ts`              | Error-throwing mutation hook                            | VERIFIED | useKycSubmit throws on non-2xx (lines 62-68).                                                                        |

### Key Link Verification

| From                                        | To                                       | Via                               | Status | Details                                                             |
| ------------------------------------------- | ---------------------------------------- | --------------------------------- | ------ | ------------------------------------------------------------------- |
| `apps/web/app/api/users/kyc/route.ts`       | `packages/shared/src/constants/index.ts` | import VALID_US_STATE_CODES       | WIRED  | Line 4: imported and used in Zod schema                             |
| `apps/web/app/api/redeem/shipping/route.ts` | `packages/shared/src/constants/index.ts` | import VALID_US_STATE_CODES       | WIRED  | Line 4: imported and used in Zod schema                             |
| `apps/web/app/api/auth/verify/route.ts`     | `viem/chains`                            | avalancheFuji for expectedChainId | WIRED  | Line 2: imported; line 43: avalancheFuji.id used as expectedChainId |
| `apps/web/app/api/users/profile/route.ts`   | `packages/shared/src/constants/index.ts` | import VALID_US_STATE_CODES       | WIRED  | Line 4: imported and used in Zod schema                             |

### Requirements Coverage

| Requirement                                                                     | Status    | Blocking Issue                                                                      |
| ------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| SEC-01: govIdNumber masked in KYC GET response                                  | SATISFIED | maskedGovId returned; raw value never in response                                   |
| SEC-02: KYC mutation hook throws on server errors                               | SATISFIED | useKycSubmit mutationFn throws on non-2xx                                           |
| SEC-03: Rate limiter uses trusted proxy IP (last x-forwarded-for entry)         | SATISFIED | middleware.ts lines 29-31                                                           |
| SEC-04: State codes uppercased and validated against known US codes server-side | SATISFIED | All 3 routes (kyc POST, shipping POST, profile PATCH) use transform+refine pipeline |
| SEC-05: SIWE verification enforces domain, URI, and chainId policy              | SATISFIED | All three post-verify checks present (lines 60, 64, 68)                             |

### Anti-Patterns Found

| File                        | Line  | Pattern                                                             | Severity | Impact                                                                                                   |
| --------------------------- | ----- | ------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `apps/web/hooks/use-kyc.ts` | 44-46 | catch block swallows 500s from KYC GET query, returns "NONE" status | Warning  | Pre-existing by design -- acceptable auth fallback per plan notes. Does not affect SC-2 (mutation hook). |

No blockers.

### Human Verification Required

None. All success criteria are verifiable programmatically.

### Regression Check (Previously Passing Items)

All 4 previously-passing items remain unchanged:

- SC-1 (govId masking): kyc/route.ts line 55-65 unchanged
- SC-2 (mutation hook throws): use-kyc.ts lines 62-68 unchanged
- SC-3 (trusted proxy IP): middleware.ts lines 29-31 unchanged
- SC-4 (state code validation): All 3 routes still import VALID_US_STATE_CODES and use transform+refine

---

_Verified: 2026-02-21T06:00:00Z_
_Verifier: Claude (gsd-verifier)_
