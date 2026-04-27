import OpenAI from "openai";
import { env } from "./env";

const client = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export type DraftSet = {
  id: string;
  topic: string;
  variants: string[];
};

export type DraftContext = {
  // Full content of the active character file. Replaces the brand prompt entirely.
  character: string;
  memory: string;
  recentPosts: string[];
};

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function assembleSystemPrompt(ctx: DraftContext): string {
  const parts = [ctx.character.trim()];

  if (ctx.memory.trim()) {
    parts.push(
      "## Product context and ongoing guidance",
      "The user has told you the following. Treat as load-bearing facts and constraints:",
      "",
      ctx.memory.trim(),
    );
  }

  if (ctx.recentPosts.length > 0) {
    parts.push(
      "## Recently posted tweets (do not repeat angle or phrasing)",
      ...ctx.recentPosts.map((t, i) => `${i + 1}. ${t}`),
    );
  }

  return parts.join("\n\n");
}

export async function generateDrafts(
  topic: string,
  ctx: DraftContext,
): Promise<DraftSet> {
  const system = assembleSystemPrompt(ctx);
  const userPrompt = `Topic: ${topic}

Write exactly 3 distinct tweet drafts on this topic. They should differ in angle, not just wording — e.g., one informational, one provocative/thought-provoking, one with a concrete example or number.

Return ONLY the 3 drafts, numbered 1., 2., 3., with no preamble, no explanation, no closing remarks. Each draft on its own line or short block.`;

  const response = await client.chat.completions.create(
    {
      model: env.LLM_MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      // @ts-expect-error — OpenRouter-specific extension; OpenAI SDK tolerates unknown fields.
      models: [env.LLM_MODEL, ...env.LLM_FALLBACK_MODELS],
    },
    { headers: { "X-OpenRouter-Preferences": "quality" } },
  );

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const variants = parseNumberedList(text);
  if (variants.length < 3) {
    throw new Error(
      `Model returned fewer than 3 drafts. Served by: ${response.model}. Raw output:\n${text}`,
    );
  }

  return { id: newId(), topic, variants: variants.slice(0, 3) };
}

// Robust against:
// - LLM preamble before the numbered list ("Here are 3 drafts:")
// - Multi-line drafts under one number
// - Variable whitespace after the dot
export function parseNumberedList(text: string): string[] {
  const startRe = /^\s*\d+\.\s+(.*)$/;
  const items: string[] = [];
  let current: string[] | null = null;

  for (const line of text.split("\n")) {
    const match = line.match(startRe);
    if (match) {
      if (current !== null) items.push(current.join("\n").trim());
      current = [match[1] ?? ""];
    } else if (current !== null) {
      current.push(line);
    }
  }
  if (current !== null) items.push(current.join("\n").trim());

  return items.filter(Boolean);
}
