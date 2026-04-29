import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

const MEMORY_FILE = join(env.DATA_DIR, "memory.md");

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

async function writeTextAtomic(path: string, value: string): Promise<void> {
  await ensureDataDir();
  const tmp = `${path}.tmp`;
  await writeFile(tmp, value, "utf8");
  await rename(tmp, path);
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
