import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env";

const CONTEXT_FILES = [
  "brand.md",
  "guardrails.md",
  "campaigns.md",
  "examples.md",
];

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
