import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

export type PostedTweet = {
  tweetId: string;
  text: string;
  topic: string;
  variantIdx: number;
  approvedByTgUserId: number;
  postedAt: string;
  dryRun: boolean;
};

const POSTED_FILE = join(env.DATA_DIR, "posted.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

async function readPosted(): Promise<PostedTweet[]> {
  try {
    return JSON.parse(await readFile(POSTED_FILE, "utf8")) as PostedTweet[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writePosted(value: PostedTweet[]): Promise<void> {
  await ensureDataDir();
  const tmp = `${POSTED_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, POSTED_FILE);
}

export async function appendPosted(entry: PostedTweet): Promise<void> {
  const current = await readPosted();
  current.push(entry);
  await writePosted(current);
}

export async function listPosted(opts?: {
  limit?: number;
}): Promise<PostedTweet[]> {
  const all = await readPosted();
  const limit = opts?.limit ?? 20;
  return all.slice(-limit).reverse();
}
