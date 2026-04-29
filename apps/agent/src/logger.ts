import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

const LOG_FILE = join(env.DATA_DIR, "agent.log");

type LogLevel = "debug" | "info" | "warn" | "error";

function serialize(value: unknown): string {
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    });
  }
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function log(
  level: LogLevel,
  message: string,
  meta?: unknown,
): Promise<void> {
  try {
    await mkdir(env.DATA_DIR, { recursive: true });
    const line = [
      new Date().toISOString(),
      level.toUpperCase(),
      message,
      meta === undefined ? "" : serialize(meta),
    ]
      .filter(Boolean)
      .join(" ");
    await appendFile(LOG_FILE, `${line}\n`, "utf8");
  } catch (err) {
    console.error("[agent] failed to write log:", err);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
