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
const MEMORY_FILE = join(env.DATA_DIR, "memory.md");
const CONTEXT_FILES = [
  "brand.md",
  "guardrails.md",
  "campaigns.md",
  "examples.md",
];

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await ensureDataDir();
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, path);
}

async function writeTextAtomic(path: string, value: string): Promise<void> {
  await ensureDataDir();
  const tmp = `${path}.tmp`;
  await writeFile(tmp, value, "utf8");
  await rename(tmp, path);
}

export async function appendPosted(entry: PostedTweet): Promise<void> {
  const current = await readJson<PostedTweet[]>(POSTED_FILE, []);
  current.push(entry);
  await writeJsonAtomic(POSTED_FILE, current);
}

export async function listPosted(opts?: {
  limit?: number;
}): Promise<PostedTweet[]> {
  const all = await readJson<PostedTweet[]>(POSTED_FILE, []);
  const limit = opts?.limit ?? 20;
  return all.slice(-limit).reverse();
}

export async function readMemory(): Promise<string> {
  try {
    return await readFile(MEMORY_FILE, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw err;
  }
}

export async function appendToMemory(
  text: string,
  author: { tgUserId: number; tgUsername?: string },
): Promise<void> {
  const existing = await readMemory();
  const timestamp = new Date().toISOString();
  const byline = author.tgUsername
    ? `@${author.tgUsername}`
    : `tg:${author.tgUserId}`;
  const entry = `\n- [${timestamp}] (${byline}) ${text.trim()}\n`;
  const next = existing ? existing + entry : `# Memory\n${entry}`;
  await writeTextAtomic(MEMORY_FILE, next);
}

export async function clearMemory(): Promise<void> {
  await writeTextAtomic(MEMORY_FILE, "");
}

export async function readContext(): Promise<string> {
  const sections: string[] = [];
  for (const file of CONTEXT_FILES) {
    try {
      const content = (
        await readFile(join(env.CONTEXT_DIR, file), "utf8")
      ).trim();
      if (content) sections.push(content);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw err;
    }
  }
  return sections.join("\n\n");
}
