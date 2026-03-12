import type { Caliber } from "@ammo-exchange/shared";

/* ── Caliber Detail (used by market pages, mint-flow, redeem-flow) ── */

export interface CaliberDetailData {
  id: Caliber;
  symbol: string;
  name: string;
  specLine: string;
  price: number; // oracle price per round (from /api/market)
  totalSupply: string; // from on-chain totalSupply read (BigInt-safe string)
  mintFee: number; // percentage, derived from FEES.MINT_FEE_BPS
  redeemFee: number; // percentage, derived from FEES.REDEEM_FEE_BPS
  minMint: number; // from CALIBER_SPECS
  minRedeem: number; // from CALIBER_SPECS
}

/* ── Order returned by /api/orders and /api/orders/[id] ── */

export interface OrderFromAPI {
  id: string;
  type: "MINT" | "REDEEM";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  caliber: Caliber;
  usdcAmount: string | null;
  tokenAmount: string | null;
  onChainOrderId: string | null;
  walletAddress: string | null;
  txHash: string | null;
  trackingId?: string | null;
  chainId: number | null;
  mintPrice: string | null;
  refundAmount: string | null;
  feeAmount: string | null;
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
  totalSupply: string;
}
