import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

export type TelegramHistoryEntry = {
  timestamp: string;
  kind: "command" | "callback";
  command?: string;
  args?: string;
  callbackData?: string;
  authorized: boolean;
  tgUserId?: number;
  tgUsername?: string;
  chatId?: number;
  messageId?: number;
  hasMedia?: boolean;
};

const TELEGRAM_HISTORY_FILE = join(env.DATA_DIR, "telegram-history.jsonl");

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

export async function appendTelegramHistory(
  entry: TelegramHistoryEntry,
): Promise<void> {
  await ensureDataDir();
  await appendFile(TELEGRAM_HISTORY_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function listTelegramHistory(opts?: {
  limit?: number;
  tgUserId?: number;
}): Promise<TelegramHistoryEntry[]> {
  let raw = "";
  try {
    raw = await readFile(TELEGRAM_HISTORY_FILE, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const entries = raw
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as TelegramHistoryEntry];
      } catch {
        return [];
      }
    })
    .filter((entry) =>
      opts?.tgUserId === undefined ? true : entry.tgUserId === opts.tgUserId,
    );

  const limit = opts?.limit ?? 20;
  return entries.slice(-limit).reverse();
}
