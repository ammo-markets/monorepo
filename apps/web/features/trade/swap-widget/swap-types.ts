import { CALIBER_SPECS, LAUNCH_CALIBERS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";

/* Token definitions */

export type TokenId = Caliber | "USDT";

export interface Token {
  id: TokenId;
  symbol: string;
  name: string;
  price: number;
  balance: number;
}

export function buildTokens(marketData: MarketCaliberFromAPI[]): Token[] {
  const base: Token[] = [
    { id: "USDT", symbol: "USDT", name: "Tether USD", price: 1.0, balance: 0 },
  ];
  for (const cal of LAUNCH_CALIBERS) {
    const market = marketData.find((m) => m.caliber === cal);
    base.push({
      id: cal,
      symbol: cal,
      name: CALIBER_SPECS[cal].description,
      price: market?.pricePerRound ?? 0,
      balance: 0,
    });
  }
  return base;
}

export function getToken(tokens: Token[], id: TokenId): Token {
  return tokens.find((t) => t.id === id) ?? tokens[0]!;
}
