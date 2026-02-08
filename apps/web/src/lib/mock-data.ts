export type CaliberId = "9MM" | "556" | "22LR" | "308";

export interface CaliberData {
  id: CaliberId;
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change24h: number;
  volume24h: string;
  sparklineData: number[];
}

export interface MarketCaliberData extends CaliberData {
  change7d: number;
  totalSupply: number;
  warehouseBacking: number;
  fullyBacked: boolean;
}

export const calibers: CaliberData[] = [
  {
    id: "9MM",
    symbol: "9MM",
    name: "9mm FMJ",
    fullName: "9MM \u00b7 9mm FMJ 115gr",
    price: 0.21,
    change24h: 3.2,
    volume24h: "$45.2K",
    sparklineData: [
      0.19, 0.195, 0.2, 0.198, 0.205, 0.21, 0.208, 0.215, 0.21, 0.205, 0.2,
      0.208, 0.21,
    ],
  },
  {
    id: "556",
    symbol: "556",
    name: "5.56 NATO",
    fullName: "556 \u00b7 5.56 NATO 55gr",
    price: 0.38,
    change24h: -1.4,
    volume24h: "$128.7K",
    sparklineData: [
      0.4, 0.395, 0.39, 0.385, 0.39, 0.395, 0.385, 0.38, 0.375, 0.38, 0.385,
      0.38, 0.38,
    ],
  },
  {
    id: "22LR",
    symbol: "22LR",
    name: ".22 Long Rifle",
    fullName: "22LR \u00b7 .22 LR 40gr",
    price: 0.08,
    change24h: 0.8,
    volume24h: "$12.1K",
    sparklineData: [
      0.075, 0.077, 0.078, 0.079, 0.078, 0.08, 0.079, 0.081, 0.08, 0.079, 0.08,
      0.08, 0.08,
    ],
  },
  {
    id: "308",
    symbol: "308",
    name: ".308 Win",
    fullName: "308 \u00b7 .308 Win 168gr",
    price: 0.85,
    change24h: 5.1,
    volume24h: "$89.3K",
    sparklineData: [
      0.78, 0.79, 0.8, 0.82, 0.81, 0.83, 0.84, 0.83, 0.85, 0.84, 0.86, 0.85,
      0.85,
    ],
  },
];

export const marketCalibers: MarketCaliberData[] = [
  {
    id: "9MM",
    symbol: "9MM",
    name: "9mm FMJ",
    fullName: "9MM \u00b7 9mm FMJ 115gr",
    price: 0.21,
    change24h: 3.2,
    change7d: 5.1,
    volume24h: "$45.2K",
    totalSupply: 1240000,
    warehouseBacking: 1240000,
    fullyBacked: true,
    sparklineData: [
      0.19, 0.195, 0.2, 0.198, 0.205, 0.21, 0.208, 0.215, 0.21, 0.205, 0.2,
      0.208, 0.21,
    ],
  },
  {
    id: "556",
    symbol: "556",
    name: "5.56 NATO",
    fullName: "556 \u00b7 5.56 NATO 55gr",
    price: 0.38,
    change24h: -0.8,
    change7d: 2.3,
    volume24h: "$78.5K",
    totalSupply: 680000,
    warehouseBacking: 680000,
    fullyBacked: true,
    sparklineData: [
      0.4, 0.395, 0.39, 0.385, 0.39, 0.395, 0.385, 0.38, 0.375, 0.38, 0.385,
      0.38, 0.38,
    ],
  },
  {
    id: "22LR",
    symbol: "22LR",
    name: ".22 Long Rifle",
    fullName: "22LR \u00b7 .22 LR 40gr",
    price: 0.08,
    change24h: 1.1,
    change7d: -0.4,
    volume24h: "$12.8K",
    totalSupply: 3200000,
    warehouseBacking: 3200000,
    fullyBacked: true,
    sparklineData: [
      0.075, 0.077, 0.078, 0.079, 0.078, 0.08, 0.079, 0.081, 0.08, 0.079, 0.08,
      0.08, 0.08,
    ],
  },
  {
    id: "308",
    symbol: "308",
    name: ".308 Win",
    fullName: "308 \u00b7 .308 Win 168gr",
    price: 0.85,
    change24h: 0.5,
    change7d: 8.7,
    volume24h: "$34.1K",
    totalSupply: 420000,
    warehouseBacking: 420000,
    fullyBacked: true,
    sparklineData: [
      0.78, 0.79, 0.8, 0.82, 0.81, 0.83, 0.84, 0.83, 0.85, 0.84, 0.86, 0.85,
      0.85,
    ],
  },
];

export const protocolStats = {
  tvl: "$2.4M",
  roundsTokenized: "4,280,000",
  uniqueHolders: "1,847",
  volume24h: "$312K",
};

/* ── Caliber Detail Page Data ── */

export interface CaliberDetailData {
  id: CaliberId;
  symbol: string;
  name: string;
  specLine: string;
  price: number;
  change24h: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  totalSupply: number;
  warehouseInventory: number;
  volume24h: number;
  marketCap: number;
  mintFee: number;
  redeemFee: number;
  minMint: number;
  userUsdcBalance: number;
  userTokenBalance: number;
}

export const caliberDetails: Record<CaliberId, CaliberDetailData> = {
  "9MM": {
    id: "9MM",
    symbol: "9MM",
    name: "9mm FMJ",
    specLine: "115gr \u00b7 Brass case \u00b7 Factory-new",
    price: 0.21,
    change24h: 3.2,
    change24hUsd: 0.006,
    high24h: 0.215,
    low24h: 0.198,
    totalSupply: 1240000,
    warehouseInventory: 1240000,
    volume24h: 45200,
    marketCap: 260400,
    mintFee: 1.5,
    redeemFee: 1.5,
    minMint: 50,
    userUsdcBalance: 1500.0,
    userTokenBalance: 476,
  },
  "556": {
    id: "556",
    symbol: "556",
    name: "5.56 NATO",
    specLine: "55gr \u00b7 Brass case \u00b7 Factory-new",
    price: 0.38,
    change24h: -0.8,
    change24hUsd: -0.003,
    high24h: 0.395,
    low24h: 0.375,
    totalSupply: 680000,
    warehouseInventory: 680000,
    volume24h: 78500,
    marketCap: 258400,
    mintFee: 1.5,
    redeemFee: 1.5,
    minMint: 50,
    userUsdcBalance: 1500.0,
    userTokenBalance: 210,
  },
  "22LR": {
    id: "22LR",
    symbol: "22LR",
    name: ".22 Long Rifle",
    specLine: "40gr \u00b7 Copper-plated \u00b7 Factory-new",
    price: 0.08,
    change24h: 1.1,
    change24hUsd: 0.001,
    high24h: 0.082,
    low24h: 0.077,
    totalSupply: 3200000,
    warehouseInventory: 3200000,
    volume24h: 12800,
    marketCap: 256000,
    mintFee: 1.5,
    redeemFee: 1.5,
    minMint: 100,
    userUsdcBalance: 1500.0,
    userTokenBalance: 1200,
  },
  "308": {
    id: "308",
    symbol: "308",
    name: ".308 Win",
    specLine: "168gr \u00b7 Brass case \u00b7 Factory-new",
    price: 0.85,
    change24h: 0.5,
    change24hUsd: 0.004,
    high24h: 0.87,
    low24h: 0.83,
    totalSupply: 420000,
    warehouseInventory: 420000,
    volume24h: 34100,
    marketCap: 357000,
    mintFee: 1.5,
    redeemFee: 1.5,
    minMint: 20,
    userUsdcBalance: 1500.0,
    userTokenBalance: 58,
  },
};

/** Generate realistic price chart data with controlled volatility */
function generateChartData(
  basePrice: number,
  volatility: number,
  points: number,
  startDate: Date,
  intervalMs: number,
): { date: string; price: number; timestamp: number }[] {
  const data: { date: string; price: number; timestamp: number }[] = [];
  let price = basePrice * (1 - volatility * 2);
  for (let i = 0; i < points; i++) {
    const change =
      (Math.sin(i * 0.3) * 0.4 +
        Math.sin(i * 0.7) * 0.3 +
        Math.sin(i * 1.1) * 0.15 +
        (i / points) * 0.6) *
      volatility *
      basePrice;
    price = basePrice + change;
    price = Math.max(
      basePrice * (1 - volatility * 3),
      Math.min(basePrice * (1 + volatility * 3), price),
    );
    const date = new Date(startDate.getTime() + i * intervalMs);
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: Math.round(price * 1000) / 1000,
      timestamp: date.getTime(),
    });
  }
  return data;
}

const thirtyDaysAgo = new Date(2026, 1, 8 - 30);
const dayMs = 24 * 60 * 60 * 1000;

export const chartDataByCaliber: Record<
  CaliberId,
  { date: string; price: number; timestamp: number }[]
> = {
  "9MM": generateChartData(0.21, 0.08, 30, thirtyDaysAgo, dayMs),
  "556": generateChartData(0.38, 0.06, 30, thirtyDaysAgo, dayMs),
  "22LR": generateChartData(0.08, 0.05, 30, thirtyDaysAgo, dayMs),
  "308": generateChartData(0.85, 0.07, 30, thirtyDaysAgo, dayMs),
};

export interface ActivityItem {
  id: string;
  type: "Mint" | "Redeem";
  amount: number;
  address: string;
  timeAgo: string;
}

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    type: "Mint",
    amount: 500,
    address: "0x1a2b...3c4d",
    timeAgo: "2 min ago",
  },
  {
    id: "2",
    type: "Redeem",
    amount: 200,
    address: "0x8f3e...9a1c",
    timeAgo: "5 min ago",
  },
  {
    id: "3",
    type: "Mint",
    amount: 1000,
    address: "0xd4c7...b2e5",
    timeAgo: "8 min ago",
  },
  {
    id: "4",
    type: "Mint",
    amount: 250,
    address: "0x72ae...f801",
    timeAgo: "12 min ago",
  },
  {
    id: "5",
    type: "Redeem",
    amount: 750,
    address: "0xbb19...4d6c",
    timeAgo: "18 min ago",
  },
  {
    id: "6",
    type: "Mint",
    amount: 100,
    address: "0x3e5f...a7b2",
    timeAgo: "25 min ago",
  },
  {
    id: "7",
    type: "Mint",
    amount: 2000,
    address: "0xc9d1...e3f4",
    timeAgo: "31 min ago",
  },
  {
    id: "8",
    type: "Redeem",
    amount: 400,
    address: "0x6a8b...1c2d",
    timeAgo: "45 min ago",
  },
  {
    id: "9",
    type: "Mint",
    amount: 150,
    address: "0xf1e2...d3c4",
    timeAgo: "52 min ago",
  },
  {
    id: "10",
    type: "Mint",
    amount: 800,
    address: "0x5b6a...7e8f",
    timeAgo: "1 hr ago",
  },
];

/* ── Portfolio Dashboard Data ── */

export interface PortfolioHolding {
  caliberId: CaliberId;
  symbol: string;
  name: string;
  balance: number;
  currentPrice: number;
  value: number;
  avgCost: number;
  pnl: number;
  pnlPercent: number;
}

export interface PortfolioOrder {
  id: string;
  orderId: string;
  type: "Mint" | "Redeem";
  caliberId: CaliberId;
  symbol: string;
  amount: number;
  status: "Processing" | "Shipped" | "Completed" | "Failed";
  createdAt: string;
}

export const portfolioHoldings: PortfolioHolding[] = [
  {
    caliberId: "9MM",
    symbol: "9MM",
    name: "9mm FMJ",
    balance: 476,
    currentPrice: 0.21,
    value: 99.96,
    avgCost: 0.19,
    pnl: 9.52,
    pnlPercent: 10.53,
  },
  {
    caliberId: "556",
    symbol: "556",
    name: "5.56 NATO",
    balance: 200,
    currentPrice: 0.38,
    value: 76.0,
    avgCost: 0.32,
    pnl: 12.0,
    pnlPercent: 18.75,
  },
];

export const portfolioOrders: PortfolioOrder[] = [
  {
    id: "1",
    orderId: "AMX-2024-001",
    type: "Mint",
    caliberId: "9MM",
    symbol: "9MM",
    amount: 476,
    status: "Processing",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    orderId: "AMX-R-2024-015",
    type: "Redeem",
    caliberId: "9MM",
    symbol: "9MM",
    amount: 200,
    status: "Shipped",
    createdAt: "3 days ago",
  },
  {
    id: "3",
    orderId: "AMX-2024-002",
    type: "Mint",
    caliberId: "556",
    symbol: "556",
    amount: 200,
    status: "Completed",
    createdAt: "5 days ago",
  },
];

export const portfolioStats = {
  totalValue: 175.96,
  change24h: 5.28,
  change24hPercent: 3.2,
  walletAddress: "0x1a2b...3c4d",
  fullAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
  primers: 1240,
};

/* ── Order Detail Data ── */

export type StepStatus = "completed" | "current" | "future" | "failed";

export interface OrderStep {
  label: string;
  status: StepStatus;
  meta?: string;
  link?: { url: string; label: string };
  errorMessage?: string;
}

export interface OrderDetail {
  orderId: string;
  type: "Mint" | "Redeem";
  caliberId: CaliberId;
  symbol: string;
  caliberFullName: string;
  amount: number;
  fee: string;
  status: "Processing" | "Shipped" | "Completed" | "Failed";
  createdAt: string;
  lastUpdated: string;
  txHash?: string;
  txHashShort?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  steps: OrderStep[];
}

export const orderDetails: Record<string, OrderDetail> = {
  /* Mint — in progress (step 3 of 5) */
  "AMX-2024-001": {
    orderId: "AMX-2024-001",
    type: "Mint",
    caliberId: "9MM",
    symbol: "9MM",
    caliberFullName: "9mm FMJ 115gr",
    amount: 476,
    fee: "1.50 USDC (1.5%)",
    status: "Processing",
    createdAt: "Feb 8, 2026 3:42 PM",
    lastUpdated: "Feb 8, 2026 5:15 PM",
    txHash:
      "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    txHashShort: "0x1a2b...3c4d",
    steps: [
      {
        label: "Order Placed",
        status: "completed",
        meta: "Feb 8, 2026 3:42 PM",
      },
      {
        label: "USDC Deposited",
        status: "completed",
        meta: "Tx: 0x1a2b...3c4d",
        link: {
          url: "https://snowtrace.io/tx/0x1a2b3c4d",
          label: "View on Snowtrace",
        },
      },
      { label: "Ammo Purchased", status: "current", meta: "In progress..." },
      { label: "Warehouse Verified", status: "future" },
      { label: "Tokens Minted", status: "future" },
    ],
  },
  /* Mint — completed (all 5 steps done) */
  "AMX-2024-002": {
    orderId: "AMX-2024-002",
    type: "Mint",
    caliberId: "556",
    symbol: "556",
    caliberFullName: "5.56 NATO 55gr",
    amount: 200,
    fee: "1.14 USDC (1.5%)",
    status: "Completed",
    createdAt: "Feb 3, 2026 10:15 AM",
    lastUpdated: "Feb 3, 2026 4:30 PM",
    txHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    txHashShort: "0xabcd...7890",
    steps: [
      {
        label: "Order Placed",
        status: "completed",
        meta: "Feb 3, 2026 10:15 AM",
      },
      {
        label: "USDC Deposited",
        status: "completed",
        meta: "Tx: 0xabcd...7890",
        link: {
          url: "https://snowtrace.io/tx/0xabcdef",
          label: "View on Snowtrace",
        },
      },
      {
        label: "Ammo Purchased",
        status: "completed",
        meta: "Feb 3, 2026 12:05 PM",
      },
      {
        label: "Warehouse Verified",
        status: "completed",
        meta: "Feb 3, 2026 2:45 PM",
      },
      {
        label: "Tokens Minted",
        status: "completed",
        meta: "Tx: 0xf1e2...d3c4",
        link: {
          url: "https://snowtrace.io/tx/0xf1e2d3c4",
          label: "View on Snowtrace",
        },
      },
    ],
  },
  /* Mint — failed at step 3 */
  "AMX-2024-003": {
    orderId: "AMX-2024-003",
    type: "Mint",
    caliberId: "308",
    symbol: "308",
    caliberFullName: ".308 Win 168gr",
    amount: 100,
    fee: "1.28 USDC (1.5%)",
    status: "Failed",
    createdAt: "Feb 6, 2026 1:20 PM",
    lastUpdated: "Feb 6, 2026 3:45 PM",
    txHash:
      "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    txHashShort: "0x9876...dcba",
    steps: [
      {
        label: "Order Placed",
        status: "completed",
        meta: "Feb 6, 2026 1:20 PM",
      },
      {
        label: "USDC Deposited",
        status: "completed",
        meta: "Tx: 0x9876...dcba",
        link: {
          url: "https://snowtrace.io/tx/0x9876dcba",
          label: "View on Snowtrace",
        },
      },
      {
        label: "Ammo Purchased",
        status: "failed",
        errorMessage:
          "Ammunition out of stock for this caliber. Your USDC deposit will be refunded within 24 hours.",
      },
      { label: "Warehouse Verified", status: "future" },
      { label: "Tokens Minted", status: "future" },
    ],
  },
  /* Redeem — shipped (step 5 of 6) */
  "AMX-R-2024-015": {
    orderId: "AMX-R-2024-015",
    type: "Redeem",
    caliberId: "9MM",
    symbol: "9MM",
    caliberFullName: "9mm FMJ 115gr",
    amount: 200,
    fee: "3 rounds (1.5%)",
    status: "Shipped",
    createdAt: "Feb 5, 2026 9:30 AM",
    lastUpdated: "Feb 7, 2026 2:10 PM",
    txHash:
      "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    txHashShort: "0x5a6b...5a6b",
    shippingAddress: "John D., 1234 Oak Street, Austin, TX 78701",
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    steps: [
      {
        label: "Redemption Initiated",
        status: "completed",
        meta: "Feb 5, 2026 9:30 AM",
      },
      {
        label: "Tokens Burned",
        status: "completed",
        meta: "Tx: 0x5a6b...5a6b",
        link: {
          url: "https://snowtrace.io/tx/0x5a6b",
          label: "View on Snowtrace",
        },
      },
      {
        label: "KYC Verified",
        status: "completed",
        meta: "Feb 5, 2026 9:45 AM",
      },
      {
        label: "Order Packed",
        status: "completed",
        meta: "Feb 6, 2026 11:00 AM",
      },
      {
        label: "Shipped",
        status: "current",
        meta: "Tracking: 1Z999AA10123456784",
        link: {
          url: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
          label: "Track Package",
        },
      },
      { label: "Delivered", status: "future" },
    ],
  },
  /* Redeem — delivered (all 6 steps done) */
  "AMX-R-2024-010": {
    orderId: "AMX-R-2024-010",
    type: "Redeem",
    caliberId: "556",
    symbol: "556",
    caliberFullName: "5.56 NATO 55gr",
    amount: 500,
    fee: "8 rounds (1.5%)",
    status: "Completed",
    createdAt: "Jan 28, 2026 2:00 PM",
    lastUpdated: "Feb 1, 2026 10:15 AM",
    txHash:
      "0xdeadbeef12345678deadbeef12345678deadbeef12345678deadbeef12345678",
    txHashShort: "0xdead...5678",
    shippingAddress: "John D., 1234 Oak Street, Austin, TX 78701",
    trackingNumber: "1Z999AA10987654321",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10987654321",
    steps: [
      {
        label: "Redemption Initiated",
        status: "completed",
        meta: "Jan 28, 2026 2:00 PM",
      },
      {
        label: "Tokens Burned",
        status: "completed",
        meta: "Tx: 0xdead...5678",
        link: {
          url: "https://snowtrace.io/tx/0xdeadbeef",
          label: "View on Snowtrace",
        },
      },
      {
        label: "KYC Verified",
        status: "completed",
        meta: "Jan 28, 2026 2:15 PM",
      },
      {
        label: "Order Packed",
        status: "completed",
        meta: "Jan 29, 2026 9:30 AM",
      },
      {
        label: "Shipped",
        status: "completed",
        meta: "Jan 29, 2026 4:00 PM",
        link: {
          url: "https://www.ups.com/track?tracknum=1Z999AA10987654321",
          label: "Track Package",
        },
      },
      { label: "Delivered", status: "completed", meta: "Feb 1, 2026 10:15 AM" },
    ],
  },
};
