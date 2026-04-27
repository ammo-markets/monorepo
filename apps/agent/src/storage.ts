import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

export type PostedTweet = {
  tweetId: string;
  text: string;
  topic: string;
  variantIdx: number;
  approvedByTgUserId: number;
  postedAt: string;
};

const POSTED_FILE = join(env.DATA_DIR, "posted.json");
const MEMORY_FILE = join(env.DATA_DIR, "memory.md");
const ACTIVE_CHARACTER_FILE = join(env.DATA_DIR, "active_character.txt");
const DEFAULT_CHARACTER_NAME = "default";
const CHARACTER_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

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

// ─── Characters ────────────────────────────────────────────────

export function isValidCharacterName(name: string): boolean {
  return CHARACTER_NAME_RE.test(name);
}

export async function listCharacters(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(env.CHARACTERS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -".md".length))
    .filter(isValidCharacterName)
    .sort();
}

async function readCharacterFile(name: string): Promise<string> {
  if (!isValidCharacterName(name)) {
    throw new Error(`Invalid character name: ${name}`);
  }
  return await readFile(join(env.CHARACTERS_DIR, `${name}.md`), "utf8");
}

export async function getActiveCharacterName(): Promise<string> {
  try {
    const raw = (await readFile(ACTIVE_CHARACTER_FILE, "utf8")).trim();
    if (raw && isValidCharacterName(raw)) return raw;
    return DEFAULT_CHARACTER_NAME;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_CHARACTER_NAME;
    }
    throw err;
  }
}

export async function setActiveCharacter(name: string): Promise<void> {
  if (!isValidCharacterName(name)) {
    throw new Error(
      `Character names must be lowercase alphanumeric or hyphens (got: ${name})`,
    );
  }
  const available = await listCharacters();
  if (!available.includes(name)) {
    throw new Error(
      `Character "${name}" not found. Available: ${available.join(", ") || "(none)"}`,
    );
  }
  await writeTextAtomic(ACTIVE_CHARACTER_FILE, name);
}

export async function readActiveCharacter(): Promise<{
  name: string;
  content: string;
}> {
  const name = await getActiveCharacterName();
  try {
    return { name, content: await readCharacterFile(name) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    if (name !== DEFAULT_CHARACTER_NAME) {
      // Active character file was deleted — fall back to default.
      return {
        name: DEFAULT_CHARACTER_NAME,
        content: await readCharacterFile(DEFAULT_CHARACTER_NAME),
      };
    }
    throw new Error(
      `No character files found. Expected at minimum ${env.CHARACTERS_DIR}/default.md`,
    );
  }
}
