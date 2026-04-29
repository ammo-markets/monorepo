import type { TelegramHistoryEntry } from "./telegram-history-store";

// Chunks long text to fit Telegram's 4096-char message limit.
export function chunk(text: string, max = 3800): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + max));
    i += max;
  }
  return out;
}

export function formatHistoryLine(entry: TelegramHistoryEntry): string {
  const who = entry.tgUsername
    ? `@${entry.tgUsername}`
    : entry.tgUserId
      ? `tg:${entry.tgUserId}`
      : "unknown";
  const when = entry.timestamp.slice(0, 16).replace("T", " ");
  const auth = entry.authorized ? "ok" : "blocked";
  if (entry.kind === "callback") {
    return `${when} ${auth} ${who} callback:${entry.callbackData ?? ""}`;
  }
  const args = entry.args ? ` ${entry.args}` : "";
  const media = entry.hasMedia ? " [media]" : "";
  return `${when} ${auth} ${who} /${entry.command ?? "unknown"}${args}${media}`;
}
