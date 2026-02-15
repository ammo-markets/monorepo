/**
 * Startup environment validation.
 *
 * Import this module at the top of the worker entry point to fail fast
 * with a clear error if any required variable is missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `[worker] FATAL: Missing required environment variable: ${name}`,
    );
    process.exit(1);
  }
  return value;
}

export const env = {
  FUJI_RPC_URL: requireEnv("FUJI_RPC_URL"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
} as const;
