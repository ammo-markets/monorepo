import type { Caliber } from "@ammo-exchange/shared";

/* ── Caliber Detail (used by market pages, mint-flow, redeem-flow) ── */

export interface CaliberDetailData {
  id: Caliber;
  symbol: string;
  name: string;
  specLine: string;
  price: number; // oracle price per round (from /api/market)
  totalSupply: number; // from on-chain totalSupply read
  mintFee: number; // percentage (1.5)
  redeemFee: number; // percentage (1.5)
  minMint: number; // from CALIBER_SPECS
}

/* ── Order returned by /api/orders and /api/orders/[id] ── */

export interface OrderFromAPI {
  id: string;
  type: "MINT" | "REDEEM";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  caliber: Caliber;
  amount: string; // BigInt serialized as string
  onChainOrderId: string | null;
  walletAddress: string | null;
  txHash: string | null;
  chainId: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  shippingAddress: {
    id: string;
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zip: string;
  } | null;
}

/* ── Order detail stepper ── */

export type StepStatus = "completed" | "current" | "future" | "failed";

export interface OrderStep {
  label: string;
  status: StepStatus;
  meta?: string;
  link?: { url: string; label: string };
}

/* ── Market data from /api/market ── */

export interface MarketCaliberFromAPI {
  caliber: Caliber;
  name: string;
  pricePerRound: number;
  priceX18: string;
}
