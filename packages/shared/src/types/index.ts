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
  tokenName: string;
  tokenSymbol: string;
  sku: string;
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
