import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node22",
  outDir: "dist",
  clean: true,
  dts: true,
  splitting: false,
  // Resolve .js → .ts for Prisma's generated TypeScript files
  esbuildOptions(options) {
    options.resolveExtensions = [".ts", ".js"];
  },
});
