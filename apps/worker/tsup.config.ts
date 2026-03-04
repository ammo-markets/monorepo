import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node22",
  outDir: "dist",
  clean: true,
  splitting: false,
  // Bundle workspace packages that ship raw TypeScript (no build step).
  // @ammo-exchange/db is excluded — it has its own tsup build.
  noExternal: ["@ammo-exchange/shared", "@ammo-exchange/contracts"],
});
