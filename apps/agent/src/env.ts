import { z } from "zod";

const envSchema = z
  .object({
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_ALLOWED_USER_IDS: z
      .string()
      .min(1)
      .transform((s) =>
        s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .map((x) => {
            const n = Number(x);
            if (!Number.isInteger(n)) {
              throw new Error(`Invalid Telegram user ID: ${x}`);
            }
            return n;
          }),
      ),

    OPENROUTER_API_KEY: z.string().min(1),
    LLM_MODEL: z.string().default("anthropic/claude-sonnet-4.6"),
    LLM_FALLBACK_MODELS: z
      .string()
      .default("anthropic/claude-opus-4.7,openai/gpt-5")
      .transform((s) =>
        s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      ),

    // Twitter creds are optional at the schema level — required only when
    // DRY_RUN is off, enforced by the refine() below.
    TWITTER_API_KEY: z.string().default(""),
    TWITTER_API_SECRET: z.string().default(""),
    TWITTER_ACCESS_TOKEN: z.string().default(""),
    TWITTER_ACCESS_TOKEN_SECRET: z.string().default(""),

    DATA_DIR: z.string().default("./data"),
    CHARACTERS_DIR: z.string().default("./characters"),

    // When true, /draft -> approve logs the would-be tweet instead of calling X.
    // Useful for testing the bot end-to-end without an X dev account.
    DRY_RUN: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
  })
  .refine(
    (data) =>
      data.DRY_RUN ||
      (data.TWITTER_API_KEY &&
        data.TWITTER_API_SECRET &&
        data.TWITTER_ACCESS_TOKEN &&
        data.TWITTER_ACCESS_TOKEN_SECRET),
    {
      message:
        "TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET are required when DRY_RUN is not 'true'.",
    },
  );

export const env = envSchema.parse(process.env);
