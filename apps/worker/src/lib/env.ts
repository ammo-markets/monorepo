import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  FUJI_RPC_URL: z.url(),
  POLL_INTERVAL_MS: z.coerce.number().positive().optional(),
});

export const env = envSchema.parse(process.env);
