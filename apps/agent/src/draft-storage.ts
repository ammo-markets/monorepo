import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";
import type { DraftSet } from "./llm";
import type { SupportedMediaMimeType, TweetMedia } from "./twitter";

type StoredTweetMedia = {
  dataBase64: string;
  mimeType: SupportedMediaMimeType;
};

export type PendingDraft = {
  set: DraftSet;
  media: TweetMedia[];
  expiresAt: number;
};

type StoredPendingDraft = {
  set: DraftSet;
  media: StoredTweetMedia[];
  expiresAt: number;
};

const PENDING_DRAFTS_FILE = join(env.DATA_DIR, "drafts.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

async function readDrafts(): Promise<Record<string, StoredPendingDraft>> {
  try {
    return JSON.parse(await readFile(PENDING_DRAFTS_FILE, "utf8")) as Record<
      string,
      StoredPendingDraft
    >;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

async function writeDrafts(
  value: Record<string, StoredPendingDraft>,
): Promise<void> {
  await ensureDataDir();
  const tmp = `${PENDING_DRAFTS_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, PENDING_DRAFTS_FILE);
}

function serializeMedia(media: TweetMedia[]): StoredTweetMedia[] {
  return media.map((item) => ({
    mimeType: item.mimeType,
    dataBase64: item.data.toString("base64"),
  }));
}

function deserializeMedia(media: StoredTweetMedia[]): TweetMedia[] {
  return media.map((item) => ({
    mimeType: item.mimeType,
    data: Buffer.from(item.dataBase64, "base64"),
  }));
}

export async function upsertPendingDraft(entry: PendingDraft): Promise<void> {
  const current = await readDrafts();
  current[entry.set.id] = {
    set: entry.set,
    media: serializeMedia(entry.media),
    expiresAt: entry.expiresAt,
  };
  await writeDrafts(current);
}

export async function readPendingDraft(
  id: string,
): Promise<PendingDraft | null> {
  const current = await readDrafts();
  const entry = current[id];
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    delete current[id];
    await writeDrafts(current);
    return null;
  }
  return {
    set: entry.set,
    media: deserializeMedia(entry.media),
    expiresAt: entry.expiresAt,
  };
}

export async function deletePendingDraft(id: string): Promise<void> {
  const current = await readDrafts();
  if (!(id in current)) return;
  delete current[id];
  await writeDrafts(current);
}

export async function listPendingDrafts(): Promise<PendingDraft[]> {
  const current = await readDrafts();
  const now = Date.now();
  const active: PendingDraft[] = [];
  let removedExpired = false;

  for (const [id, entry] of Object.entries(current)) {
    if (entry.expiresAt < now) {
      delete current[id];
      removedExpired = true;
      continue;
    }
    active.push({
      set: entry.set,
      media: deserializeMedia(entry.media),
      expiresAt: entry.expiresAt,
    });
  }

  if (removedExpired) await writeDrafts(current);
  return active;
}

export async function sweepPendingDrafts(): Promise<number> {
  return (await listPendingDrafts()).length;
}
