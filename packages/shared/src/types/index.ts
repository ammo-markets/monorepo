export type Caliber =
  | "9MM_PRACTICE"
  | "9MM_SELF_DEFENSE"
  | "556_SELF_DEFENSE"
  | "556_NATO_PRACTICE";

export type KycStatus = "none" | "pending" | "approved" | "rejected";

export type OrderType = "mint" | "redeem";

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface CaliberSpec {
  caliber: Caliber;
  name: string;
  description: string;
  grainWeight: number;
  caseType: string;
  minMintRounds: number;
  minRedeemRounds: number;
  tokenName: string;
  tokenSymbol: string;
  sku: string;
}

/** Icon key used by frontend to map an upcoming caliber to a rendered icon. */
export type UpcomingIconKey = "9MM" | "556" | "308" | "22LR" | "default";

/**
 * A caliber on the protocol's roadmap that is not yet deployable. Has no
 * Caliber-typed id (no contracts, no Prisma row, no token) — surfaces consume
 * it for marketing/preview purposes only.
 */
export interface UpcomingCaliberSpec {
  id: string;
  displayName: string;
  description: string;
  grainWeight?: number;
  caseType?: "brass" | "steel" | "shotshell";
  iconKey: UpcomingIconKey;
}

export interface RedeemRequest {
  caliber: Caliber;
  tokenAmount: bigint;
  walletAddress: `0x${string}`;
  shippingAddress: ShippingAddress;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}
