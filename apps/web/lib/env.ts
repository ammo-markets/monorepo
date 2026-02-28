import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    RPC_URL: z.url(),
    SESSION_SECRET: z.string().min(32),
    ALLOWED_ORIGINS: z.string().optional(),
    APP_DOMAIN: z.string().min(1),
    APP_URL: z.url(),
    FAUCET_PRIVATE_KEY: z
      .string()
      .startsWith("0x")
      .length(66)
      .optional(),
  },
  client: {
    NEXT_PUBLIC_CHAIN: z.enum(["fuji", "mainnet"]).default("fuji"),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    RPC_URL: process.env.RPC_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    APP_DOMAIN: process.env.APP_DOMAIN,
    APP_URL: process.env.APP_URL,
    FAUCET_PRIVATE_KEY: process.env.FAUCET_PRIVATE_KEY,
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
});
