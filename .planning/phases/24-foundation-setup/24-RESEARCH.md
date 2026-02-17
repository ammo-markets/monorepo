# Phase 24: Foundation & Setup - Research

**Researched:** 2026-02-17
**Domain:** Next.js 15 static export app scaffold with Tailwind v4 hex-only colors for PDF-safe rendering
**Confidence:** HIGH

## Summary

Phase 24 scaffolds a standalone pitchdeck app at `apps/pitchdeck` inside the existing pnpm monorepo. The app uses Next.js 15 with `output: "export"` for pure static HTML/CSS/JS output (no server), Tailwind CSS v4 for styling, and a hex-only color system that avoids oklch values which crash html2canvas during PDF generation.

The existing monorepo (`apps/web`) provides a near-complete template to copy from: same Next.js 15 version, same Tailwind v4 + PostCSS setup, same `@ammo-exchange/shared` workspace dependency pattern with `transpilePackages`. The pitchdeck app is dramatically simpler -- no database, no wallet, no authentication, no API routes. The main novelty is the static export configuration and the hex-only color constraint.

**Primary recommendation:** Clone the `apps/web` scaffold pattern but strip it to bare minimum (no wagmi, no prisma, no iron-session, no shadcn). Define all colors as hex values in CSS custom properties within `@theme inline`, using `--color-*: initial` to wipe Tailwind's default oklch palette. Configure `output: "export"` and `images: { unoptimized: true }` in next.config.ts.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.1.6 | React framework with static export | Already used in apps/web, same version |
| react / react-dom | ^19.0.0 | UI library | Already used in apps/web |
| tailwindcss | ^4.0.6 | Utility-first CSS | Already used in apps/web |
| @tailwindcss/postcss | ^4.0.6 | PostCSS plugin for Tailwind v4 | Already used in apps/web |
| typescript | ^5.7.3 | Type safety | Already used across monorepo |

### Supporting (needed in later phases, not Phase 24)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| html2canvas-pro | ^1.6.7 | HTML-to-canvas rendering with oklch support | Phase 25+ for PDF export |
| jspdf | latest | PDF generation from canvas | Phase 25+ for PDF export |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html2canvas-pro | html2canvas (original) | Original crashes on oklch colors; -pro fork supports oklch/oklab but hex-only strategy avoids the issue entirely as defense-in-depth |
| Static export | Standard SSR Next.js | Static export is required for pitchdeck (no server, deployable as files) |
| Hex-only colors | oklch with html2canvas-pro | Even with html2canvas-pro supporting oklch, hex is safer for PDF rendering and eliminates an entire class of bugs |

**Installation:**
```bash
# From monorepo root - pitchdeck app dependencies
pnpm --filter @ammo-exchange/pitchdeck add next@^15.1.6 react@^19.0.0 react-dom@^19.0.0
pnpm --filter @ammo-exchange/pitchdeck add -D tailwindcss@^4.0.6 @tailwindcss/postcss@^4.0.6 @types/node@^22 @types/react@^19 @types/react-dom@^19 typescript@^5.7.3
```

## Architecture Patterns

### Recommended Project Structure
```
apps/pitchdeck/
├── app/
│   ├── layout.tsx          # Root layout (static, no providers needed)
│   ├── page.tsx            # Main pitchdeck page (or redirect to /slides)
│   └── globals.css         # Hex-only Tailwind theme
├── components/
│   └── slides/             # Individual slide components (later phases)
├── lib/                    # Utilities (later phases: pdf export, etc.)
├── public/                 # Static assets (logos, images)
├── next.config.ts          # output: "export", transpilePackages
├── postcss.config.mjs      # @tailwindcss/postcss plugin
├── tsconfig.json           # Extends root, paths: @/* -> ./*
└── package.json            # @ammo-exchange/pitchdeck
```

### Pattern 1: Static Export Configuration
**What:** next.config.ts with `output: "export"` produces pure static files in `out/` directory
**When to use:** Always for this app -- no server features needed

```typescript
// apps/pitchdeck/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@ammo-exchange/shared"],
  webpack: (config) => {
    // Resolve .js extension imports to .ts files in workspace packages
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
```
**Source:** https://nextjs.org/docs/app/guides/static-exports

### Pattern 2: Hex-Only Color Theme (Tailwind v4)
**What:** Wipe all default oklch colors with `--color-*: initial`, define custom palette in hex only
**When to use:** Required for this app to prevent oklch from leaking into rendered CSS

```css
/* apps/pitchdeck/app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Wipe ALL default Tailwind colors (they use oklch) */
  --color-*: initial;

  /* === Ammo Exchange Pitch Deck Palette (hex only) === */
  --color-background: #0a0a0f;
  --color-surface: #12121a;
  --color-surface-elevated: #1a1a25;

  --color-brass: #c6a44e;
  --color-brass-light: #d4b76a;
  --color-brass-dark: #a8893f;

  --color-text: #e8e8ed;
  --color-text-secondary: #8a8a9a;
  --color-text-muted: #8585a0;

  --color-white: #ffffff;
  --color-black: #000000;

  --color-green: #2ecc71;
  --color-red: #e74c3c;
  --color-amber: #f39c12;
  --color-blue: #3498db;

  /* Font families */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}

:root {
  background-color: var(--color-background);
  color: var(--color-text);
}
```
**Source:** https://tailwindcss.com/docs/customizing-colors + https://github.com/tailwindlabs/tailwindcss/discussions/15119

### Pattern 3: Workspace Dependency (shared package)
**What:** Reference `@ammo-exchange/shared` as workspace dependency, transpile in next.config.ts
**When to use:** When importing types, constants, or config from the shared package

The shared package ships raw TypeScript (no build step). Consumers must transpile it. The existing `apps/web` pattern works:
- `package.json`: `"@ammo-exchange/shared": "workspace:*"` in dependencies
- `next.config.ts`: `transpilePackages: ["@ammo-exchange/shared"]`
- `webpack.resolve.extensionAlias`: map `.js` to `[".ts", ".tsx", ".js"]`

### Pattern 4: Turborepo Integration
**What:** pitchdeck app registers in turbo pipeline via its package.json scripts
**When to use:** Automatic -- Turbo discovers all workspace packages

The pitchdeck app does NOT depend on `@ammo-exchange/db` or `@ammo-exchange/contracts`, so:
- `build` depends on `^build` (shared has no build, so this is a no-op)
- `build` does NOT depend on `^db:generate` (pitchdeck has no db dependency)
- The turbo.json `build` task has `dependsOn: ["^build", "^db:generate"]` which will gracefully skip db:generate for pitchdeck since it has no db dependency
- `outputs` in turbo.json currently lists `.next/**` and `dist/**`; static export outputs to `out/**` which needs to be added

### Anti-Patterns to Avoid
- **Using oklch anywhere in globals.css:** Even a single oklch value will leak into the rendered DOM and can cause html2canvas crashes. Use hex exclusively.
- **Using `@import "tw-animate-css"` or `@import "shadcn/tailwind.css"`:** These shadcn imports bring oklch colors. The pitchdeck app should NOT use shadcn.
- **Adding `images: { loader: "custom" }` complexity:** Use `unoptimized: true` for static export. No need for Cloudinary or custom loaders.
- **Adding Server Components that fetch data at build time:** Keep it pure client-side. No build-time data fetching needed for a pitchdeck.
- **Including `@ammo-exchange/db` or `@ammo-exchange/contracts` as dependencies:** Pitchdeck has no chain or database interaction.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS theme system | Custom CSS variables from scratch | Tailwind v4 `@theme inline` with `--color-*` namespace | Tailwind generates all utility classes automatically from theme variables |
| PostCSS pipeline | Manual PostCSS config | Copy `postcss.config.mjs` from apps/web (just `@tailwindcss/postcss`) | Identical setup, zero config needed |
| Monorepo wiring | Manual path resolution | pnpm workspace protocol + Next.js `transpilePackages` | Proven pattern from apps/web |
| Font loading | Manual @font-face | `next/font/google` (Inter, JetBrains Mono) | Same as apps/web, automatic font optimization |

**Key insight:** Nearly everything in Phase 24 is a simplified copy of `apps/web`. The novel parts are `output: "export"` and the hex-only color wipe. Don't invent new patterns when proven ones exist.

## Common Pitfalls

### Pitfall 1: oklch Colors Leaking from Tailwind Defaults
**What goes wrong:** Tailwind v4 default palette uses oklch. If you use `bg-gray-500` or any default color utility without wiping defaults, oklch values end up in the DOM.
**Why it happens:** Tailwind v4 changed the entire default color palette from rgb to oklch.
**How to avoid:** Use `--color-*: initial` in `@theme` block to wipe ALL defaults. Only define custom hex colors. Verify with browser DevTools that no oklch values appear in computed styles.
**Warning signs:** Seeing `oklch(...)` in any CSS custom property value in the browser inspector.

### Pitfall 2: Static Export Missing `out/` in Turbo Outputs
**What goes wrong:** `pnpm build` succeeds but Turbo doesn't cache the pitchdeck output correctly, or the output directory isn't found.
**Why it happens:** turbo.json `build.outputs` lists `.next/**` and `dist/**` but not `out/**`. Static export writes to `out/` by default.
**How to avoid:** Add `"out/**"` to the `build.outputs` array in turbo.json. Alternatively, set `distDir` in next.config.ts but `out/` is the Next.js default for static export.
**Warning signs:** Turbo reports 0 files cached for pitchdeck builds.

### Pitfall 3: `db:generate` Failing for Pitchdeck
**What goes wrong:** Turbo tries to run `db:generate` as a dependency of pitchdeck build, which doesn't have Prisma.
**Why it happens:** turbo.json has `"dependsOn": ["^build", "^db:generate"]` on the build task.
**How to avoid:** This should NOT be an issue because `^db:generate` means "run db:generate in my dependencies." Since pitchdeck only depends on `@ammo-exchange/shared` (which has no `db:generate` script), Turbo will skip it. Verify by running `pnpm build --filter @ammo-exchange/pitchdeck` and confirming no db-related errors.
**Warning signs:** Build errors mentioning Prisma or database URL.

### Pitfall 4: Port Conflict with Web App
**What goes wrong:** Running `pnpm dev` starts both web (3000) and pitchdeck (default 3000) on the same port.
**Why it happens:** Next.js defaults to port 3000 for dev.
**How to avoid:** Set `"dev": "next dev --port 3001"` in pitchdeck's package.json scripts.
**Warning signs:** "Port 3000 is in use" error when running dev.

### Pitfall 5: `next/image` Breaking Static Export
**What goes wrong:** Build fails with "Image Optimization using the default loader is not compatible with output: export."
**Why it happens:** `next/image` requires a server for image optimization by default.
**How to avoid:** Set `images: { unoptimized: true }` in next.config.ts. Or use regular `<img>` tags for static images.
**Warning signs:** Build error mentioning image optimization.

### Pitfall 6: Missing `extensionAlias` Webpack Config
**What goes wrong:** Import errors when consuming `@ammo-exchange/shared` because its TypeScript files use `.js` extensions in imports (ESM convention).
**Why it happens:** The shared package uses `import { foo } from "./bar/index.js"` but the actual file is `index.ts`. Without extensionAlias, webpack can't resolve it.
**How to avoid:** Include the `webpack.resolve.extensionAlias` config from apps/web's next.config.ts.
**Warning signs:** "Module not found: Can't resolve './config/index.js'" errors.

## Code Examples

### Minimal next.config.ts for Static Export
```typescript
// Source: Next.js docs + apps/web pattern
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@ammo-exchange/shared"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
```

### Minimal package.json
```json
{
  "name": "@ammo-exchange/pitchdeck",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "@ammo-exchange/shared": "workspace:*",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.6",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "tailwindcss": "^4.0.6",
    "typescript": "^5.7.3"
  }
}
```

### Minimal layout.tsx (No Providers, No Wallet)
```tsx
// Source: apps/web/app/layout.tsx (simplified)
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Ammo Exchange | Pitch Deck",
  description: "Tokenized ammunition trading on Avalanche",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

### Test Slide Page (Validates Scaffold + Colors)
```tsx
// Source: custom for Phase 24 success criteria
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brass">Ammo Exchange</h1>
        <p className="mt-4 text-xl text-text-secondary">
          Pitch Deck - Test Slide
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="w-16 h-16 rounded bg-brass" />
          <div className="w-16 h-16 rounded bg-green" />
          <div className="w-16 h-16 rounded bg-red" />
          <div className="w-16 h-16 rounded bg-blue" />
        </div>
      </div>
    </div>
  );
}
```

### postcss.config.mjs (Identical to apps/web)
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### tsconfig.json (Extends Root)
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "incremental": true,
    "noEmit": true,
    "allowJs": true
  },
  "include": [
    "*.ts",
    "*.tsx",
    "next-env.d.ts",
    "app",
    "components",
    "lib",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next export` command | `output: "export"` in next.config.js | Next.js 14.0.0 | Must use config option, not CLI command |
| Tailwind v3 rgb colors | Tailwind v4 oklch colors | Tailwind v4.0 (Jan 2025) | Default palette uses oklch, breaks html2canvas |
| html2canvas | html2canvas-pro | 2024+ | Pro fork supports oklch/oklab, but hex-only strategy avoids the issue |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4.0 | Single import replaces three directives |
| `tailwind.config.js` (JS config) | `@theme` CSS directive | Tailwind v4.0 | Configuration is CSS-native, no JS config file needed |

**Deprecated/outdated:**
- `next export` CLI command: Removed in Next.js 14+. Use `output: "export"` config.
- `tailwind.config.js` / `tailwind.config.ts`: Still supported in v4 but CSS-first `@theme` is preferred.
- `@tailwind base; @tailwind components; @tailwind utilities;`: Replaced by `@import "tailwindcss"` in v4.

## Open Questions

1. **Turbo output caching for `out/`**
   - What we know: turbo.json `build.outputs` has `.next/**` and `dist/**` but not `out/**`
   - What's unclear: Whether adding `out/**` globally affects other apps, or if per-package turbo config is needed
   - Recommendation: Add `"out/**"` to the global build.outputs array. Other apps don't produce `out/` so it's harmless.

2. **Whether `--color-*: initial` fully prevents oklch in computed styles**
   - What we know: The Tailwind docs and Adam Wathan confirm `--color-*: initial` wipes default colors
   - What's unclear: Whether Tailwind v4 injects oklch values anywhere OUTSIDE the `--color-*` namespace (e.g., in preflight/base styles)
   - Recommendation: After scaffolding, inspect the built CSS output and browser computed styles for any oklch occurrences. If found, add targeted overrides.

## Sources

### Primary (HIGH confidence)
- Next.js Static Export docs (https://nextjs.org/docs/app/guides/static-exports) - verified static export config, unsupported features, output directory
- Tailwind CSS v4 Color docs (https://tailwindcss.com/docs/customizing-colors) - verified `@theme`, `--color-*: initial`, hex color definition
- Existing codebase `apps/web/` - verified monorepo patterns, next.config.ts, postcss.config.mjs, globals.css, tsconfig.json, package.json

### Secondary (MEDIUM confidence)
- Tailwind CSS Discussion #15119 (https://github.com/tailwindlabs/tailwindcss/discussions/15119) - Adam Wathan confirms `--color-*: initial` approach for hex-only palette
- html2canvas Issue #3269 (https://github.com/niklasvh/html2canvas/issues/3269) - confirms oklch crash in html2canvas with Tailwind v4
- html2canvas-pro npm (https://www.npmjs.com/package/html2canvas-pro) - v1.6.7, supports oklch/oklab

### Tertiary (LOW confidence)
- None. All findings verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - identical to existing apps/web, just stripped down
- Architecture: HIGH - direct simplification of existing monorepo pattern
- Pitfalls: HIGH - oklch/html2canvas issue well-documented; static export config well-documented
- Hex-only strategy: MEDIUM - `--color-*: initial` confirmed by Tailwind maintainer, but edge cases around preflight CSS need runtime verification

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable -- Next.js 15 and Tailwind v4 are mature releases)
