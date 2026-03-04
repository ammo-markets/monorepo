import { defineConfig } from "vitest/config";
import { readFileSync } from "fs";
import { resolve } from "path";

// Parse .env before any test modules are imported (env.ts validates at import time)
const envPath = resolve(import.meta.dirname, "../../.env");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1]!.trim();
    // Strip surrounding quotes (single or double)
    const val = match[2]!.trim().replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] ??= val;
  }
}

export default defineConfig({});
