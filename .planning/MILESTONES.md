# Milestones

## v1.0 Fuji Testnet Integration (Shipped: 2026-02-11)

**Phases completed:** 6 phases, 12 plans, 0 tasks

**Key accomplishments:**
- Deployed all smart contracts to Avalanche Fuji (AmmoManager, AmmoFactory, 4 CaliberMarkets, 4 AmmoTokens, MockUSDC) with shared config
- Built crash-recoverable event indexer polling 4 event types into database with BlockCursor checkpoint
- Wired real wallet connection (MetaMask) with network switching, token balances, and 5 API routes
- Connected mint and redeem UI flows to real contract calls with tx status tracking and error messages
- Eliminated all mock data -- every display reads from chain or database
- Built keeper-gated admin dashboard with finalizeMint/finalizeRedeem dialogs and protocol stats

---

## v1.1 End-to-End Flow Fix (Shipped: 2026-02-15)

**Phases completed:** 1 phase (Phase 7), 2 plans. Phase 8 (E2E Verification) superseded by v1.2.

**Key accomplishments:**
- Auto-create user DB record on wallet connect (fire-and-forget registration with upsert)
- Deployment block floor in shared config -- worker scans from block 51699730 instead of 0
- Progress logging during backfill for operational visibility

**Last phase number:** 7 (Phase 8 superseded, not shipped)

---

