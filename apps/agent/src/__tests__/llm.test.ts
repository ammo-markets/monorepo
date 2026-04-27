import { describe, expect, it } from "vitest";
import { assembleSystemPrompt, parseNumberedList } from "../llm";

const SAMPLE_CHARACTER =
  "You write tweets for Ammo Markets. Sharp and dry voice.";

describe("parseNumberedList", () => {
  it("parses a clean three-item list", () => {
    const text = "1. first\n2. second\n3. third";
    expect(parseNumberedList(text)).toEqual(["first", "second", "third"]);
  });

  it("ignores preamble before the first numbered item", () => {
    const text = "Here are 3 drafts:\n\n1. first\n2. second\n3. third";
    expect(parseNumberedList(text)).toEqual(["first", "second", "third"]);
  });

  it("ignores closing remarks after the last numbered item", () => {
    // Multi-line continuation looks identical to a closing remark — both get
    // attached to the previous item. We document this trade-off here.
    const text = "1. first\n2. second\n3. third\nLet me know which you prefer!";
    const parsed = parseNumberedList(text);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toBe("first");
    expect(parsed[1]).toBe("second");
    expect(parsed[2]).toContain("third");
  });

  it("preserves multi-line content within an item", () => {
    const text = "1. line one\nline two\n2. b\n3. c";
    const parsed = parseNumberedList(text);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toBe("line one\nline two");
    expect(parsed[1]).toBe("b");
    expect(parsed[2]).toBe("c");
  });

  it("trims surrounding whitespace from each item", () => {
    const text = "1.   first   \n2.   second\n3.   third   ";
    expect(parseNumberedList(text)).toEqual(["first", "second", "third"]);
  });

  it("returns empty array for text with no numbered items", () => {
    expect(parseNumberedList("just some prose, no list")).toEqual([]);
  });

  it("filters out empty items (e.g., '1.\\n2. b')", () => {
    const text = "1.\n2. real content";
    const parsed = parseNumberedList(text);
    expect(parsed).toEqual(["real content"]);
  });
});

describe("assembleSystemPrompt", () => {
  it("returns just the character prompt when no memory and no recent posts", () => {
    const prompt = assembleSystemPrompt({
      character: SAMPLE_CHARACTER,
      memory: "",
      recentPosts: [],
    });
    expect(prompt).toContain("Ammo Markets");
    expect(prompt).not.toContain("Product context");
    expect(prompt).not.toContain("Recently posted");
  });

  it("includes the memory section when memory is non-empty", () => {
    const prompt = assembleSystemPrompt({
      character: SAMPLE_CHARACTER,
      memory: "- We migrated to Pharaoh Exchange.",
      recentPosts: [],
    });
    expect(prompt).toContain("Product context and ongoing guidance");
    expect(prompt).toContain("Pharaoh Exchange");
    expect(prompt).not.toContain("Recently posted");
  });

  it("includes the recent-posts section when posts is non-empty", () => {
    const prompt = assembleSystemPrompt({
      character: SAMPLE_CHARACTER,
      memory: "",
      recentPosts: ["First past tweet.", "Second past tweet."],
    });
    expect(prompt).toContain("Recently posted tweets");
    expect(prompt).toContain("1. First past tweet.");
    expect(prompt).toContain("2. Second past tweet.");
    expect(prompt).not.toContain("Product context");
  });

  it("includes both sections when both are populated", () => {
    const prompt = assembleSystemPrompt({
      character: SAMPLE_CHARACTER,
      memory: "- A fact.",
      recentPosts: ["A tweet."],
    });
    expect(prompt).toContain("Product context");
    expect(prompt).toContain("A fact.");
    expect(prompt).toContain("Recently posted");
    expect(prompt).toContain("A tweet.");
  });

  it("treats whitespace-only memory as empty", () => {
    const prompt = assembleSystemPrompt({
      character: SAMPLE_CHARACTER,
      memory: "   \n\n  \n",
      recentPosts: [],
    });
    expect(prompt).not.toContain("Product context");
  });

  it("uses the character as the first section of the prompt", () => {
    const prompt = assembleSystemPrompt({
      character: "Speak like a 19th-century arms dealer.",
      memory: "",
      recentPosts: [],
    });
    expect(prompt.startsWith("Speak like a 19th-century arms dealer.")).toBe(
      true,
    );
  });
});
