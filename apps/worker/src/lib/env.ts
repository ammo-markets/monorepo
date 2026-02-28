import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  CHAIN: z.enum(["fuji", "mainnet"]).default("fuji"),
  RPC_URL: z.url(),
  POLL_INTERVAL_MS: z.coerce.number().positive().optional(),
});

export const env = envSchema.parse(process.env);
