# Technology Stack

**Project:** Ammo Exchange Pitch Deck App (`apps/pitchdeck`)
**Researched:** 2026-02-17

## Context

Adding a standalone pitch deck app to the existing Ammo Exchange monorepo. The app renders an investor-facing slide deck in the browser with PDF export capability. It shares `packages/shared` for caliber specs and chain config but has NO dependency on `packages/db`, `packages/contracts`, or any Web3 libraries.

## Recommended Stack

### Inherited from Monorepo (DO NOT install separately)

These are already validated and configured at the monorepo level:

| Technology   | Version | Purpose             | Notes                                              |
| ------------ | ------- | ------------------- | -------------------------------------------------- |
| Next.js      | ^15.1.6 | App framework       | Match `apps/web` exactly                           |
| React        | ^19.0.0 | UI library          | Already in monorepo                                |
| React DOM    | ^19.0.0 | DOM rendering       | Already in monorepo                                |
| Tailwind CSS | ^4.0.6  | Styling             | Use `@tailwindcss/postcss` pattern from `apps/web` |
| TypeScript   | ^5.7.3  | Type safety         | Shared tsconfig at root                            |
| Turborepo    | ^2.4.4  | Build orchestration | Already configured                                 |
| pnpm         | 10.4.1  | Package manager     | Workspace protocol                                 |

### NEW Dependencies -- PDF Export

| Technology      | Version | Purpose                  | Why This                                                                                                                                                                                                                                                                                        |
| --------------- | ------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| html2canvas-pro | ^1.6.7  | DOM-to-canvas rendering  | Fork of html2canvas with modern CSS support: `oklch()`, `color()`, `calc()` in background-position, CSS `rotate`. Critical because Tailwind v4 generates modern CSS color functions that original html2canvas cannot render. No peer dependencies. [HIGH confidence -- npm verified 2026-02-17] |
| jsPDF           | ^4.1.0  | Canvas-to-PDF conversion | Industry standard client-side PDF generation. v4.x includes security patches (CVE-2025-68428 path traversal fix). No peer dependencies. [HIGH confidence -- npm verified 2026-02-17]                                                                                                            |

### NEW Dependencies -- Presentation & Theming

| Technology   | Version  | Purpose                | Why This                                                                                                                                                                                                                               |
| ------------ | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| next-themes  | ^0.4.6   | Dark/light mode toggle | Works with Next.js 15 App Router + React 19 (peer deps verified: `react ^16.8                                                                                                                                                          |     | ^17 |     | ^18 |     | ^19`). Adds `class="dark"`to`<html>`which Tailwind v4`dark:` variant reads natively. Handles SSR flash-of-wrong-theme, system preference detection, localStorage persistence. 15KB. [HIGH confidence -- npm verified, peer deps confirmed] |
| lucide-react | ^0.563.0 | Icons                  | ALREADY in `apps/web` at this version (latest is 0.564.0). Use same version range for consistency. Tree-shakeable, consistent stroke-based style. Do NOT add a second icon library. [HIGH confidence -- already validated in monorepo] |

### Shared Package Dependencies

| Package                 | Why Used                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ammo-exchange/shared` | Caliber specs (names, descriptions, categories), chain config (network details for protocol slides), protocol constants (fee percentages, supported calibers) |

### NOT Needed (explicitly exclude)

| Technology                 | Why Exclude                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wagmi / viem               | No wallet connection in a pitch deck                                                                                                                                                           |
| iron-session               | No auth needed                                                                                                                                                                                 |
| Prisma / @ammo-exchange/db | No database -- static content                                                                                                                                                                  |
| @ammo-exchange/contracts   | No on-chain interaction                                                                                                                                                                        |
| @tanstack/react-query      | No async data fetching                                                                                                                                                                         |
| Reveal.js                  | 300KB+, opinionated CSS that fights Tailwind, PDF export requires separate plugin, no control over slide-to-canvas pipeline                                                                    |
| Spectacle                  | React-based but heavyweight theme system conflicts with Tailwind, custom layout primitives fight against standard HTML/CSS                                                                     |
| Slidev                     | Vue-based, wrong ecosystem entirely                                                                                                                                                            |
| html2pdf.js                | Wraps original html2canvas (not -pro) + jsPDF. Locks you into html2canvas without modern CSS support. The abstraction hides configuration we need to control (scale, backgroundColor, format). |
| jspdf-html2canvas          | Convenience wrapper that adds a dependency for ~20 lines of glue code. Not worth the indirection when we need precise control over the render pipeline.                                        |
| react-to-pdf               | Uses html2canvas (not -pro) under the hood. Same modern CSS rendering problem.                                                                                                                 |
| @react-pdf/renderer        | Requires rewriting all slides in react-pdf primitives (View, Text, Image) instead of HTML/CSS. Defeats the purpose of a visual web deck that doubles as a presentation.                        |

## PDF Export Architecture

The export pipeline renders each slide DOM element to a canvas image, then assembles them into a multi-page landscape PDF:

```
Slide DOM elements (16:9 aspect ratio)
    --> html2canvas-pro (renders each slide to canvas, honoring Tailwind v4 CSS)
    --> jsPDF (creates multi-page landscape PDF from canvas images)
    --> Browser download via blob URL
```

**Key configuration:**

```typescript
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

async function exportToPdf(slides: HTMLElement[]) {
  // Landscape 16:9 at 1920x1080
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  for (let i = 0; i < slides.length; i++) {
    const canvas = await html2canvas(slides[i], {
      scale: 2, // 2x for crisp rendering (retina quality)
      useCORS: true, // if loading external images/logos
      backgroundColor: null, // respect slide's own background
    });

    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
  }

  pdf.save("ammo-exchange-pitch-deck.pdf");
}
```

**Limitation to accept:** PDF text is rasterized (not selectable/searchable). For an investor pitch deck this is acceptable -- visual fidelity and consistent styling matter more than text search. If searchable text becomes a requirement, that would need a server-side renderer (Puppeteer/Playwright), which is a fundamentally different architecture.

## Fluid Typography with clamp()

Use CSS `clamp()` for responsive text sizing that works across screen sizes AND in the PDF export (html2canvas-pro computes the resolved value at render time):

```css
/* In Tailwind v4 via @theme or arbitrary values */
.slide-title {
  font-size: clamp(2rem, 4vw, 4rem);
}
.slide-body {
  font-size: clamp(1rem, 2vw, 1.5rem);
}
```

## next-themes Setup Pattern

Required configuration for Next.js 15 App Router:

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- `suppressHydrationWarning` on `<html>` is mandatory -- next-themes modifies the element client-side
- `attribute="class"` makes Tailwind v4 `dark:` variants work automatically
- `defaultTheme="dark"` because pitch decks look better on dark backgrounds for investor presentations

## Integration with Monorepo

### Package Configuration

The new app slots into the existing workspace with zero changes to `pnpm-workspace.yaml` (already has `apps/*` glob):

```jsonc
// apps/pitchdeck/package.json
{
  "name": "@ammo-exchange/pitchdeck",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "check": "tsc --noEmit",
  },
  "dependencies": {
    "@ammo-exchange/shared": "workspace:*",
    "html2canvas-pro": "^1.6.7",
    "jspdf": "^4.1.0",
    "lucide-react": "^0.563.0",
    "next": "^15.1.6",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.6",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "tailwindcss": "^4.0.6",
    "typescript": "^5.7.3",
  },
}
```

### Port Assignment

| App              | Port | Purpose        |
| ---------------- | ---- | -------------- |
| `apps/web`       | 3000 | Main dashboard |
| `apps/pitchdeck` | 3001 | Pitch deck     |

No conflict when running `pnpm dev` (Turbo TUI shows both).

### Turbo Integration

No changes to `turbo.json` needed. Existing task definitions (`build`, `dev`, `check`) apply automatically. The pitchdeck app has no `db:generate` dependency -- Turbo handles missing scripts gracefully (skips the task for packages that do not define it).

### Build Dependency Graph

```
packages/shared (no build step) --> apps/pitchdeck
```

Single dependency. Significantly simpler than `apps/web` which depends on shared + db + contracts.

## Installation

```bash
# From monorepo root, after creating apps/pitchdeck/package.json
pnpm install
```

All dependencies resolve through the workspace. Summary of what is NEW to the monorepo:

| Package                | New to monorepo?                       | Unpacked size               |
| ---------------------- | -------------------------------------- | --------------------------- |
| html2canvas-pro        | YES                                    | ~450KB                      |
| jsPDF                  | YES                                    | ~2.5MB (includes font data) |
| next-themes            | YES                                    | ~15KB                       |
| lucide-react           | No (shared with apps/web via hoisting) | 0 additional                |
| next, react, react-dom | No (shared with apps/web via hoisting) | 0 additional                |

**Total new dependency weight:** ~3MB unpacked. Minimal footprint.

## Alternatives Considered

| Category       | Recommended                         | Alternative                        | Why Not                                                                                                               |
| -------------- | ----------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| DOM capture    | html2canvas-pro                     | html2canvas (original)             | No modern CSS support -- fails on `oklch()`, `color()`, `calc()` in background-position. Tailwind v4 generates these. |
| DOM capture    | html2canvas-pro                     | dom-to-image                       | Less maintained, worse cross-browser, no modern CSS fixes                                                             |
| DOM capture    | html2canvas-pro                     | modern-screenshot                  | Newer but smaller community, less battle-tested for multi-slide PDF pipelines                                         |
| PDF generation | jsPDF (client-side)                 | Puppeteer/Playwright (server-side) | Adds server infrastructure for a static deck. Client-side export is simpler and works offline.                        |
| PDF generation | jsPDF                               | @react-pdf/renderer                | Forces rewriting slides in non-HTML primitives. Cannot reuse the web presentation as-is.                              |
| Theming        | next-themes                         | Manual CSS variables + script      | next-themes handles FOUC prevention, system preference, persistence in 15KB. Reinventing this is error-prone.         |
| Slide system   | Custom (CSS scroll-snap + sections) | Reveal.js                          | 300KB, opinionated CSS conflicts with Tailwind, PDF export is a separate plugin with its own quirks                   |
| Slide system   | Custom                              | Spectacle (Formidable)             | React-based but has its own theme/layout system that duplicates what Tailwind already provides                        |
| Icons          | lucide-react                        | heroicons, react-icons             | Already using lucide in `apps/web`. Consistency across the monorepo is more important than marginal preference.       |

## Sources

- [html2canvas-pro on npm](https://www.npmjs.com/package/html2canvas-pro) -- v1.6.7 verified 2026-02-17
- [jsPDF on npm](https://www.npmjs.com/package/jspdf) -- v4.1.0 verified 2026-02-17
- [next-themes on npm](https://www.npmjs.com/package/next-themes) -- v0.4.6, React 19 peer dep verified
- [next-themes on GitHub](https://github.com/pacocoursey/next-themes) -- App Router setup pattern with suppressHydrationWarning
- [lucide-react on npm](https://www.npmjs.com/package/lucide-react) -- v0.564.0 latest, using ^0.563.0 to match apps/web
- [html2canvas-pro DeepWiki](https://deepwiki.com/yorickshan/html2canvas-pro) -- Modern CSS support details (oklch, color functions)
- [shadcn/ui dark mode guide](https://ui.shadcn.com/docs/dark-mode/next) -- next-themes + Next.js App Router integration pattern
- [Best HTML to Canvas Solutions 2025](https://portalzine.de/best-html-to-canvas-solutions-in-2025/) -- DOM capture library comparison
