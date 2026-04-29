import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getActiveCharacterName,
  isValidCharacterName,
  listCharacters,
  readActiveCharacter,
  setActiveCharacter,
} from "../characters";
import {
  deletePendingDraft,
  listPendingDrafts,
  readPendingDraft,
  upsertPendingDraft,
} from "../draft-storage";
import { env } from "../env";
import { appendToMemory, clearMemory, readMemory } from "../memory-store";
import { appendPosted, listPosted } from "../posted-store";
import {
  appendTelegramHistory,
  listTelegramHistory,
} from "../telegram-history-store";

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

describe("pending draft storage", () => {
  beforeEach(wipeDataDir);
  afterEach(wipeDataDir);

  it("persists draft text and attached media", async () => {
    await upsertPendingDraft({
      set: {
        id: "draft-1",
        topic: "launch",
        variants: ["one", "two", "three"],
      },
      media: [{ data: Buffer.from("image-bytes"), mimeType: "image/jpeg" }],
      expiresAt: Date.now() + 60_000,
    });

    const draft = await readPendingDraft("draft-1");
    expect(draft?.set.variants).toEqual(["one", "two", "three"]);
    expect(draft?.media[0]?.mimeType).toBe("image/jpeg");
    expect(draft?.media[0]?.data.toString()).toBe("image-bytes");
  });

  it("filters expired drafts when reading and listing", async () => {
    await upsertPendingDraft({
      set: { id: "expired", topic: "old", variants: ["a", "b", "c"] },
      media: [],
      expiresAt: Date.now() - 1,
    });

    expect(await readPendingDraft("expired")).toBeNull();
    expect(await listPendingDrafts()).toEqual([]);
  });

  it("deletes a pending draft by id", async () => {
    await upsertPendingDraft({
      set: { id: "draft-2", topic: "launch", variants: ["a", "b", "c"] },
      media: [],
      expiresAt: Date.now() + 60_000,
    });

    await deletePendingDraft("draft-2");
    expect(await readPendingDraft("draft-2")).toBeNull();
  });
});

describe("telegram history storage", () => {
  beforeEach(wipeDataDir);
  afterEach(wipeDataDir);

  it("returns empty history when no entries exist", async () => {
    expect(await listTelegramHistory()).toEqual([]);
  });

  it("appends and lists command history in reverse chronological order", async () => {
    await appendTelegramHistory({
      timestamp: "2026-01-01T00:00:00.000Z",
      kind: "command",
      command: "help",
      args: "",
      authorized: true,
      tgUserId: 1,
      chatId: 1,
      messageId: 10,
      hasMedia: false,
    });
    await appendTelegramHistory({
      timestamp: "2026-01-01T00:01:00.000Z",
      kind: "command",
      command: "draft",
      args: "test",
      authorized: true,
      tgUserId: 2,
      chatId: 2,
      messageId: 11,
      hasMedia: true,
    });

    const history = await listTelegramHistory();
    expect(history.map((entry) => entry.command)).toEqual(["draft", "help"]);
  });

  it("filters history by Telegram user ID", async () => {
    await appendTelegramHistory({
      timestamp: "2026-01-01T00:00:00.000Z",
      kind: "command",
      command: "help",
      authorized: true,
      tgUserId: 1,
    });
    await appendTelegramHistory({
      timestamp: "2026-01-01T00:01:00.000Z",
      kind: "callback",
      callbackData: "approve:abc:0",
      authorized: true,
      tgUserId: 2,
    });

    const history = await listTelegramHistory({ tgUserId: 2 });
    expect(history).toHaveLength(1);
    expect(history[0]?.callbackData).toBe("approve:abc:0");
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
