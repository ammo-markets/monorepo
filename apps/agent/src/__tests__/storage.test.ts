import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "../env";
import {
  appendPosted,
  appendToMemory,
  clearMemory,
  getActiveCharacterName,
  isValidCharacterName,
  listCharacters,
  listPosted,
  readActiveCharacter,
  readMemory,
  setActiveCharacter,
} from "../storage";

// Wipe DATA_DIR contents between tests so each test starts clean. The directory
// itself is created by vitest.config.ts (mkdtempSync) and reused.
function wipeDataDir(): void {
  let entries: string[] = [];
  try {
    entries = readdirSync(env.DATA_DIR);
  } catch {
    return;
  }
  for (const name of entries) {
    rmSync(`${env.DATA_DIR}/${name}`, { recursive: true, force: true });
  }
}

function wipeCharactersDir(): void {
  // Reset to a clean, empty (but existing) directory so the next test can
  // freely write character files even if a prior test deleted the dir.
  rmSync(env.CHARACTERS_DIR, { recursive: true, force: true });
  mkdirSync(env.CHARACTERS_DIR, { recursive: true });
}

function writeCharacter(name: string, content: string): void {
  writeFileSync(join(env.CHARACTERS_DIR, `${name}.md`), content, "utf8");
}

describe("memory storage", () => {
  beforeEach(wipeDataDir);
  afterEach(wipeDataDir);

  it("readMemory returns empty string when memory.md does not exist", async () => {
    expect(await readMemory()).toBe("");
  });

  it("appendToMemory creates the file with a heading and timestamped entry", async () => {
    await appendToMemory("first fact", { tgUserId: 42, tgUsername: "alice" });
    const content = await readMemory();
    expect(content).toMatch(/^# Memory\n/);
    expect(content).toContain("(@alice)");
    expect(content).toContain("first fact");
    expect(content).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
  });

  it("appendToMemory appends additional entries without rewriting the heading", async () => {
    await appendToMemory("first", { tgUserId: 1, tgUsername: "alice" });
    await appendToMemory("second", { tgUserId: 1, tgUsername: "alice" });
    const content = await readMemory();
    const headingCount = (content.match(/^# Memory$/gm) ?? []).length;
    expect(headingCount).toBe(1);
    expect(content).toContain("first");
    expect(content).toContain("second");
  });

  it("falls back to numeric tg id when no username is provided", async () => {
    await appendToMemory("anon fact", { tgUserId: 99 });
    expect(await readMemory()).toContain("(tg:99)");
  });

  it("clearMemory wipes the file", async () => {
    await appendToMemory("something", { tgUserId: 1, tgUsername: "alice" });
    expect((await readMemory()).length).toBeGreaterThan(0);
    await clearMemory();
    expect(await readMemory()).toBe("");
  });
});

describe("posted-tweet storage", () => {
  beforeEach(wipeDataDir);
  afterEach(wipeDataDir);

  const sample = (n: number) => ({
    tweetId: `tweet-${n}`,
    text: `tweet number ${n}`,
    topic: "test",
    variantIdx: 0,
    approvedByTgUserId: 1,
    postedAt: new Date(2026, 0, n + 1).toISOString(),
    dryRun: false,
  });

  it("returns empty array when nothing has been posted", async () => {
    expect(await listPosted()).toEqual([]);
  });

  it("appends and lists posted tweets in reverse chronological order", async () => {
    await appendPosted(sample(1));
    await appendPosted(sample(2));
    await appendPosted(sample(3));
    const list = await listPosted();
    expect(list.map((p) => p.tweetId)).toEqual([
      "tweet-3",
      "tweet-2",
      "tweet-1",
    ]);
  });

  it("respects the limit parameter", async () => {
    for (let i = 1; i <= 5; i++) await appendPosted(sample(i));
    const list = await listPosted({ limit: 2 });
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.tweetId)).toEqual(["tweet-5", "tweet-4"]);
  });

  it("defaults to limit 20 when not specified", async () => {
    for (let i = 1; i <= 25; i++) await appendPosted(sample(i));
    const list = await listPosted();
    expect(list).toHaveLength(20);
    expect(list[0]?.tweetId).toBe("tweet-25");
    expect(list[19]?.tweetId).toBe("tweet-6");
  });
});

describe("character storage", () => {
  beforeEach(() => {
    wipeDataDir();
    wipeCharactersDir();
  });
  afterEach(() => {
    wipeDataDir();
    wipeCharactersDir();
  });

  it("isValidCharacterName accepts lowercase alphanumerics and hyphens", () => {
    expect(isValidCharacterName("default")).toBe(true);
    expect(isValidCharacterName("arms-dealer")).toBe(true);
    expect(isValidCharacterName("v2")).toBe(true);
  });

  it("isValidCharacterName rejects uppercase, paths, dots, and empty", () => {
    expect(isValidCharacterName("Default")).toBe(false);
    expect(isValidCharacterName("../etc/passwd")).toBe(false);
    expect(isValidCharacterName("a.b")).toBe(false);
    expect(isValidCharacterName("")).toBe(false);
    expect(isValidCharacterName("-leading-hyphen")).toBe(false);
  });

  it("listCharacters returns sorted names without .md, ignoring non-md files", async () => {
    writeCharacter("default", "default content");
    writeCharacter("arms-dealer", "dealer content");
    writeFileSync(join(env.CHARACTERS_DIR, "README.txt"), "ignore me");
    expect(await listCharacters()).toEqual(["arms-dealer", "default"]);
  });

  it("listCharacters returns empty array when directory missing", async () => {
    wipeCharactersDir();
    rmSync(env.CHARACTERS_DIR, { recursive: true, force: true });
    expect(await listCharacters()).toEqual([]);
  });

  it("getActiveCharacterName returns 'default' when no active file is set", async () => {
    expect(await getActiveCharacterName()).toBe("default");
  });

  it("setActiveCharacter persists the choice and getActiveCharacterName reads it", async () => {
    writeCharacter("default", "default content");
    writeCharacter("arms-dealer", "dealer content");
    await setActiveCharacter("arms-dealer");
    expect(await getActiveCharacterName()).toBe("arms-dealer");
  });

  it("setActiveCharacter throws when character file does not exist", async () => {
    writeCharacter("default", "default content");
    await expect(setActiveCharacter("ghost")).rejects.toThrow(/not found/);
  });

  it("setActiveCharacter throws on invalid names (path traversal etc)", async () => {
    await expect(setActiveCharacter("../etc/passwd")).rejects.toThrow();
  });

  it("readActiveCharacter loads content of active character", async () => {
    writeCharacter("default", "DEFAULT BODY");
    writeCharacter("arms-dealer", "DEALER BODY");
    await setActiveCharacter("arms-dealer");
    const result = await readActiveCharacter();
    expect(result.name).toBe("arms-dealer");
    expect(result.content).toBe("DEALER BODY");
  });

  it("readActiveCharacter falls back to default when active file was deleted", async () => {
    writeCharacter("default", "DEFAULT BODY");
    writeCharacter("temp", "TEMP BODY");
    await setActiveCharacter("temp");
    rmSync(join(env.CHARACTERS_DIR, "temp.md"));
    const result = await readActiveCharacter();
    expect(result.name).toBe("default");
    expect(result.content).toBe("DEFAULT BODY");
  });

  it("readActiveCharacter throws clearly when no characters exist at all", async () => {
    await expect(readActiveCharacter()).rejects.toThrow(/No character files/);
  });
});
