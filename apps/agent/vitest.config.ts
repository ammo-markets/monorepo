import { defineConfig } from "vitest/config";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// env.ts validates at import time, so populate placeholder values BEFORE any
// test module is loaded. Tests that need real values can use vi.stubEnv().
const testDataDir = mkdtempSync(join(tmpdir(), "ammo-agent-test-"));
const testCharactersDir = mkdtempSync(join(tmpdir(), "ammo-agent-chars-"));

process.env.TELEGRAM_BOT_TOKEN ??= "test:bot-token";
process.env.TELEGRAM_ALLOWED_USER_IDS ??= "1";
process.env.OPENROUTER_API_KEY ??= "test-openrouter-key";
process.env.LLM_MODEL ??= "test/model";
process.env.TWITTER_API_KEY ??= "x";
process.env.TWITTER_API_SECRET ??= "x";
process.env.TWITTER_ACCESS_TOKEN ??= "x";
process.env.TWITTER_ACCESS_TOKEN_SECRET ??= "x";
process.env.DATA_DIR ??= testDataDir;
process.env.CHARACTERS_DIR ??= testCharactersDir;
process.env.DRY_RUN ??= "true";

export default defineConfig({});
