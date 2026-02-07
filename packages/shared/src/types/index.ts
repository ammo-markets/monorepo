export type Caliber = "9MM" | "556" | "22LR" | "308";

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
}

export interface OrderRequest {
  caliber: Caliber;
  type: OrderType;
  amount: bigint;
  walletAddress: `0x${string}`;
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
