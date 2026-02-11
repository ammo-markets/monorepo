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

