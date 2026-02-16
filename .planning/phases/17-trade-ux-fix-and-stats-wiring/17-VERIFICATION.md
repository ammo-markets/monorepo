---
phase: 17-trade-ux-fix-and-stats-wiring
verified: 2026-02-16T03:10:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 17: Trade UX Fix & Stats Wiring Verification Report

**Phase Goal:** Trade page has single caliber selection flow (no duplicates) and landing page displays real protocol stats from worker-computed data

**Verified:** 2026-02-16T03:10:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User selects caliber ONCE on Trade page — CaliberInfoPanel selection feeds directly into MintFlow/RedeemFlow which skip their step 0 | ✓ VERIFIED | CaliberInfoPanel in trade-client.tsx sets ?caliber= URL param (line 26); MintFlow reads param and sets isEmbedded flag (line 1108), guards step 0 with !isEmbedded (line 1217); RedeemFlow reads param and sets isEmbedded flag (line 1664), conditionally hides caliber cards (line 328) |
| 2 | MintFlow reads ?caliber= URL param and starts at amount step (step 1) when param is present | ✓ VERIFIED | MintFlow reads searchParams.get("caliber") (line 1105-1107), sets isEmbedded = preselected !== null (line 1108), initializes step to 1 when preselected exists (line 1117-1120), guards step 0 rendering with !isEmbedded (line 1217) |
| 3 | RedeemFlow reads ?caliber= URL param and starts at amount step (step 0 with pre-selected caliber) — no duplicate selection needed | ✓ VERIFIED | RedeemFlow reads searchParams.get("caliber") (line 1661-1663), sets isEmbedded = preselected !== null (line 1664), initializes selectedCaliber to preselected (line 1674-1677), conditionally hides caliber card grid when isEmbedded (line 328-434) and shows streamlined "Enter Amount" heading (line 436-443) |
| 4 | Landing page ProtocolStats component fetches from /api/stats and displays real unique holder count | ✓ VERIFIED | ProtocolStats imports useProtocolStats hook (protocol-stats.tsx line 5), calls hook (line 92), computes holders by summing userCount from stats (line 103-104), displays in StatItem (line 133), shows "--" only when holders <= 0 (line 117) |
| 5 | No hardcoded '--' values remain in ProtocolStats display when data is available | ✓ VERIFIED | ProtocolStats uses conditional logic: tvl shows "--" only when calibers.length === 0 (line 114), roundsTokenized shows "--" only when calibers.length === 0 (line 116), uniqueHolders shows "--" only when holders <= 0 (line 117), totalVolume shows "--" only when totalMinted <= 0 (line 118) |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| apps/web/features/mint/mint-flow.tsx | MintFlow that skips step 0 when ?caliber= param is present | ✓ VERIFIED | 1270 lines, reads preselected from searchParams (line 1105-1107), sets isEmbedded flag (line 1108), guards step 0 with !isEmbedded (line 1217), hides Back button when embedded (hideBack prop line 1236), handleMintMore preserves caliber in embedded mode (line 1201-1211) |
| apps/web/features/redeem/redeem-flow.tsx | RedeemFlow that auto-advances past caliber-only selection when ?caliber= param is present | ✓ VERIFIED | 1887 lines, reads preselected from searchParams (line 1661-1663), sets isEmbedded flag (line 1664), passes isEmbedded prop to StepSelectCaliberAmount (line 1819), conditionally hides caliber grid (line 328-434) and shows "Enter Amount" heading (line 436-443), handleRedeemMore preserves caliber in embedded mode (line 1785-1804) |
| apps/web/features/home/protocol-stats.tsx | ProtocolStats fetching from /api/stats with real data | ✓ VERIFIED | 139 lines, imports useProtocolStats (line 5), calls hook (line 92), computes holders from protocolStats.stats (line 103-104), computes totalMinted from protocolStats.stats (line 107-111), uses conditional logic to show "--" only when data unavailable |
| apps/web/hooks/use-protocol-stats.ts | TanStack Query hook for /api/stats endpoint | ✓ VERIFIED | 29 lines, uses TanStack Query useQuery with queryKey ["protocol-stats"] (line 19), fetches from /api/stats (line 21), typed response with ProtocolStatsResponse interface (line 13-15), staleTime 60_000 (line 25), refetchOnWindowFocus false (line 26) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| apps/web/features/trade/caliber-info-panel.tsx | apps/web/features/mint/mint-flow.tsx | ?caliber= URL param set by CaliberInfoPanel, read by MintFlow | ✓ WIRED | CaliberInfoPanel called via onSelectCaliber in trade-client.tsx which calls router.replace with caliber param (line 26); MintFlow reads searchParams.get("caliber") (line 1105-1107) and uses it to set isEmbedded flag |
| apps/web/hooks/use-protocol-stats.ts | apps/web/app/api/stats/route.ts | TanStack Query fetch to /api/stats | ✓ WIRED | useProtocolStats hook fetches from /api/stats (line 21); /api/stats route.ts exists (710 bytes, modified 2026-02-15), returns Response.json({ stats }) with ProtocolStats rows (line 18) |

### Requirements Coverage

No requirements explicitly mapped to Phase 17 in REQUIREMENTS.md. This is a gap closure phase addressing UX and integration issues from v1.3-MILESTONE-AUDIT.md.

### Anti-Patterns Found

None.

All "placeholder" matches are legitimate HTML input placeholder attributes, not stub comments or incomplete implementations.

### Human Verification Required

#### 1. Trade Page Single-Selection Flow

**Test:**
1. Navigate to /trade
2. Select 9MM in CaliberInfoPanel
3. Click "Mint" tab
4. Verify you see amount input as first step (NOT caliber selection)
5. Click "Back" — verify Back button is hidden/disabled
6. Click "Mint More" after completing a mint
7. Verify you return to amount step (NOT caliber selection)
8. Switch to "Redeem" tab
9. Verify caliber card grid is hidden and heading shows "Enter Amount"

**Expected:**
- User selects caliber exactly once via CaliberInfoPanel
- Mint tab never shows caliber selection step
- Redeem tab never shows caliber card grid
- "Mint More" and "Redeem More" preserve caliber selection

**Why human:** Visual UI flow and user interaction sequence can't be verified programmatically

#### 2. Standalone Mint/Redeem Routes Continue Working

**Test:**
1. Navigate to /mint directly (no ?caliber= param)
2. Verify full 4-step flow including caliber selection as step 0
3. Navigate to /redeem directly (no ?caliber= param)
4. Verify full 5-step flow including caliber cards + amount as step 0

**Expected:**
- Standalone routes show normal flow with caliber selection
- No embedded behavior when URL param is absent

**Why human:** Need to verify no regression in standalone flow behavior

#### 3. Landing Page Protocol Stats Display

**Test:**
1. Navigate to landing page (/)
2. Scroll to "Protocol Stats" section
3. Verify "Unique Holders" shows a number (not "--") if worker has computed stats
4. Verify "Total Volume" shows a number (not "--") if worker has computed stats
5. Open browser network tab
6. Verify /api/stats endpoint is called
7. Verify response contains stats array with userCount and totalMinted fields

**Expected:**
- ProtocolStats shows real data from /api/stats when available
- Stats animate on scroll into view
- No hardcoded "--" when data exists

**Why human:** Visual appearance, animation behavior, and network request inspection require manual verification

### Gaps Summary

None. All must-haves verified, all artifacts exist and are substantive, all key links are wired correctly.

---

**Verification Notes:**

**Artifacts (Level 1-3):**
- Level 1 (Exists): All 4 artifacts exist with substantive line counts
- Level 2 (Substantive): All artifacts contain real implementations (no stubs, TODOs, or placeholders)
- Level 3 (Wired): All artifacts are imported and used correctly

**Key Links:**
- CaliberInfoPanel → MintFlow/RedeemFlow: URL param pattern verified via trade-client.tsx router.replace and flow searchParams.get
- useProtocolStats → /api/stats: fetch call verified, endpoint exists and returns typed data

**Anti-Patterns:**
- No TODO/FIXME comments in modified files
- No empty implementations or console.log-only handlers
- No hardcoded "--" values when data is available (conditional logic verified)

**TypeScript Compilation:**
- `pnpm --filter @ammo-exchange/web check` passes without errors

**Commits:**
- cc5da5b: Task 1 (skip duplicate caliber selection) — 2 files modified
- 8d484dd: Task 2 (wire ProtocolStats to /api/stats) — 2 files modified (1 created)

**Phase Goal Achievement:**
The phase goal is fully achieved. Trade page has a single caliber selection flow via CaliberInfoPanel with no duplicates in MintFlow/RedeemFlow. Landing page ProtocolStats displays real unique holder count and total volume from worker-computed /api/stats data. All automated checks pass. Human verification recommended for visual UX flow confirmation.

---

_Verified: 2026-02-16T03:10:00Z_
_Verifier: Claude (gsd-verifier)_
