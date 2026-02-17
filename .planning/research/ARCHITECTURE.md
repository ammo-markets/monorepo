# Architecture: Pitch Deck App Integration

**Research Date:** 2026-02-17
**Dimension:** Architecture -- `apps/pitchdeck` integration into existing Ammo Exchange monorepo, component hierarchy for custom slide system, PDF export pipeline
**Context:** Subsequent milestone -- adding a standalone pitch deck app to the existing Turborepo monorepo with pnpm workspaces

---

## 1. Monorepo Integration

### What Gets Created vs Modified

**New (create from scratch):**

| Path | Purpose |
|------|---------|
| `apps/pitchdeck/` | Next.js 15 app (standalone, no DB/contracts deps) |
| `apps/pitchdeck/package.json` | `@ammo-exchange/pitchdeck` |
| `apps/pitchdeck/app/layout.tsx` | Root layout with fonts + theme |
| `apps/pitchdeck/app/page.tsx` | PitchDeck orchestrator entry |
| `apps/pitchdeck/app/globals.css` | Tailwind v4 + brass/dark theme vars (copied from web, trimmed) |
| `apps/pitchdeck/components/` | All slide system components |
| `apps/pitchdeck/slides/` | Individual slide content components |
| `apps/pitchdeck/lib/utils.ts` | `cn()` helper (same as web) |
| `apps/pitchdeck/lib/pdf.ts` | PDF export logic |
| `apps/pitchdeck/next.config.ts` | Minimal config (no wagmi/prisma concerns) |
| `apps/pitchdeck/postcss.config.mjs` | `@tailwindcss/postcss` plugin |
| `apps/pitchdeck/tsconfig.json` | Extends root, `@/*` paths |

**Modified (update existing):**

| Path | Change |
|------|--------|
| `turbo.json` | No change needed -- `apps/*` glob already covers new app |
| `pnpm-workspace.yaml` | No change needed -- `apps/*` glob already covers new app |
| `package.json` (root) | No change needed -- turbo commands run across all apps |

**Not touched:**

| Path | Reason |
|------|--------|
| `packages/shared/` | Pitch deck has no shared type dependencies |
| `packages/db/` | No database needed |
| `packages/contracts/` | No smart contract interaction |
| `apps/web/` | Completely independent |
| `apps/worker/` | Completely independent |

### Why Standalone (Not a Route in apps/web)

The pitch deck app should be a separate Next.js app, not a route inside `apps/web`, for three reasons:

1. **Zero dependency overlap.** The web app pulls wagmi, viem, iron-session, prisma, tanstack-query, radix-ui, recharts. The pitch deck needs none of these. Bundling them together bloats the pitch deck build and creates unnecessary coupling.

2. **Independent deployment.** The pitch deck deploys to its own Vercel project (e.g., `pitch.ammoexchange.io` or a standalone URL for investor sharing). It should build and deploy independently without requiring DB migrations or contract builds.

3. **Build speed.** `turbo build --filter=@ammo-exchange/pitchdeck` builds only the pitch deck. No `^db:generate` or `^build` dependencies to wait for.

### Turborepo Build Order

The pitch deck app has **no workspace package dependencies**. Its dependency graph is:

```
@ammo-exchange/pitchdeck
  (no workspace deps)
  -> next, react, react-dom
  -> html2canvas, jspdf
  -> tailwindcss, lucide-react
```

This means:
- `turbo build` will build it in parallel with other apps
- `turbo dev` will run its dev server alongside web/worker
- No `dependsOn: ["^build", "^db:generate"]` applies (those resolve to empty for this app)
- The existing turbo.json tasks already handle this correctly -- `build.dependsOn: ["^build", "^db:generate"]` has no effect when the app has no workspace dependencies

### Package.json for apps/pitchdeck

```json
{
  "name": "@ammo-exchange/pitchdeck",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
    "lucide-react": "^0.563.0",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.6",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "tailwindcss": "^4.0.6",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.7.3"
  }
}
```

Note: Port 3001 to avoid conflict with `apps/web` on port 3000 during `turbo dev`.

---

## 2. Component Architecture

### Component Hierarchy

```
app/page.tsx
  -> <PitchDeck />                    (orchestrator: state, keyboard, routing)
       -> <SlideRenderer />           (transition wrapper: opacity/transform animations)
            -> <Slide />              (base layout wrapper: padding, max-width, background)
                 -> <SlideHeader />   (reusable: icon + title + subtitle)
                 -> [slide content]   (unique per slide)
       -> <SlideControls />           (prev/next buttons, slide counter, PDF button)
       -> <ProgressBar />             (horizontal progress indicator)
       -> <PDFExporter />             (hidden: off-screen rendering for PDF capture)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `PitchDeck` | Owns `currentSlide` state, keyboard event listener, slide array definition | SlideRenderer, SlideControls, ProgressBar, PDFExporter |
| `SlideRenderer` | Applies enter/exit transitions based on slide change direction | Slide (renders current slide component) |
| `Slide` | Provides consistent slide layout (full viewport, centered content, background) | SlideHeader, child content |
| `SlideHeader` | Renders icon + title + subtitle with consistent typography | None (pure presentational) |
| `SlideControls` | Previous/next navigation buttons, slide counter display, PDF export trigger | PitchDeck (calls onNext/onPrev/onExport) |
| `ProgressBar` | Visual indicator of progress through deck | PitchDeck (reads currentSlide/totalSlides) |
| `PDFExporter` | Renders all slides off-screen, captures with html2canvas, assembles with jsPDF | PitchDeck (triggered by export action) |

### State Management

No external state library needed. Single `useState` in PitchDeck:

```typescript
// components/pitch-deck.tsx
"use client";

import { useState, useCallback, useEffect } from "react";

const slides = [
  TitleSlide,
  ProblemSlide,
  SolutionSlide,
  MarketSlide,
  ProductSlide,
  TractionSlide,
  BusinessModelSlide,
  CompetitionSlide,
  TeamSlide,
  AskSlide,
] as const;

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? "forward" : "backward");
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [currentSlide, totalSlides]);

  const next = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") { /* could toggle overview mode */ }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ax-primary">
      <SlideRenderer direction={direction} slideKey={currentSlide}>
        <CurrentSlideComponent />
      </SlideRenderer>
      <ProgressBar current={currentSlide} total={totalSlides} />
      <SlideControls
        onPrev={prev}
        onNext={next}
        current={currentSlide}
        total={totalSlides}
      />
    </div>
  );
}
```

### Slide Transitions

Use CSS transitions with absolute positioning. Each slide occupies the full viewport. Transition on opacity + translateX for a smooth slide effect:

```typescript
// components/slide-renderer.tsx
"use client";

import { useRef, useEffect, useState } from "react";

interface SlideRendererProps {
  direction: "forward" | "backward";
  slideKey: number;
  children: React.ReactNode;
}

export function SlideRenderer({ direction, slideKey, children }: SlideRendererProps) {
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevKeyRef = useRef(slideKey);

  useEffect(() => {
    if (slideKey !== prevKeyRef.current) {
      setTransitioning(true);
      // Wait for exit animation, then swap content and enter
      const timeout = setTimeout(() => {
        setDisplayedChildren(children);
        setTransitioning(false);
        prevKeyRef.current = slideKey;
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timeout);
    } else {
      setDisplayedChildren(children);
    }
  }, [slideKey, children]);

  const translateX = transitioning
    ? direction === "forward" ? "-100%" : "100%"
    : "0%";

  return (
    <div
      className="absolute inset-0 transition-all duration-300 ease-in-out"
      style={{
        opacity: transitioning ? 0 : 1,
        transform: `translateX(${translateX})`,
      }}
    >
      {displayedChildren}
    </div>
  );
}
```

**Why CSS transitions over framer-motion:** The pitch deck has exactly one animation need (slide transitions). Adding framer-motion (30KB+ gzipped) for a single opacity+transform animation is unnecessary. CSS transitions handle this perfectly with zero bundle cost.

### Slide Base Component

```typescript
// components/slide.tsx
interface SlideProps {
  children: React.ReactNode;
  className?: string;
}

export function Slide({ children, className }: SlideProps) {
  return (
    <div className={cn(
      "flex h-screen w-screen flex-col items-center justify-center px-16 py-12",
      className
    )}>
      <div className="w-full max-w-5xl">
        {children}
      </div>
    </div>
  );
}
```

### SlideHeader Reusable Component

```typescript
// components/slide-header.tsx
import type { LucideIcon } from "lucide-react";

interface SlideHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function SlideHeader({ icon: Icon, title, subtitle }: SlideHeaderProps) {
  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-brass-muted p-2">
          <Icon className="h-6 w-6 text-brass" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-lg text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight`, `Space` | Next slide |
| `ArrowLeft` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| Number keys `1-9` | Jump to slide N |
| `Escape` | Reserved for future overview mode |

Keyboard handler lives in the PitchDeck orchestrator via `useEffect` on `window.addEventListener("keydown")`. No need for a separate hook -- it is a single effect.

---

## 3. PDF Export Pipeline

### Architecture

The PDF export uses off-screen DOM rendering. All slides are rendered simultaneously in a hidden container, captured one-by-one with html2canvas, then assembled into a multi-page PDF with jsPDF.

```
User clicks "Export PDF"
  -> PDFExporter renders ALL slides in a hidden div (visibility: hidden, position: absolute)
  -> For each slide div:
       html2canvas(slideEl, { scale: 2, useCORS: true })
       -> Returns Canvas element
       -> jsPDF.addImage(canvas.toDataURL("image/jpeg", 0.95))
       -> jsPDF.addPage() (except last)
  -> jsPDF.save("ammo-exchange-pitch-deck.pdf")
  -> Clean up hidden div
```

### PDFExporter Component

```typescript
// lib/pdf.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportToPDF(slideElements: HTMLElement[]) {
  // Landscape 16:9 aspect ratio
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  for (let i = 0; i < slideElements.length; i++) {
    const canvas = await html2canvas(slideElements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0a0a0f", // bg-primary
      width: 1920,
      height: 1080,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
  }

  pdf.save("ammo-exchange-pitch-deck.pdf");
}
```

### Off-Screen Rendering Strategy

The hidden container renders all slides at a fixed 1920x1080 resolution regardless of the user's viewport. This ensures consistent PDF output:

```typescript
// components/pdf-exporter.tsx
"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { exportToPDF } from "@/lib/pdf";

// Import all slide components
import { slides } from "@/slides";
import { Slide } from "./slide";

export interface PDFExporterHandle {
  export: () => Promise<void>;
}

export const PDFExporter = forwardRef<PDFExporterHandle>(function PDFExporter(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    async export() {
      if (!containerRef.current) return;
      const slideEls = Array.from(
        containerRef.current.querySelectorAll("[data-slide]")
      ) as HTMLElement[];
      await exportToPDF(slideEls);
    },
  }));

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed left-[-9999px] top-0"
      aria-hidden="true"
    >
      {slides.map((SlideComponent, i) => (
        <div
          key={i}
          data-slide
          style={{ width: 1920, height: 1080 }}
          className="bg-ax-primary"
        >
          <SlideComponent />
        </div>
      ))}
    </div>
  );
});
```

### PDF Export Limitations and Mitigations

| Limitation | Mitigation |
|------------|------------|
| Text becomes rasterized (not selectable) | Acceptable for pitch decks -- visual fidelity matters more than text selection |
| Large file size with scale: 2 | Use JPEG at 0.95 quality instead of PNG; ~2-4MB for 10 slides |
| Custom fonts may not render | Ensure fonts are loaded before capture (document.fonts.ready) |
| CSS gradients may render imperfectly | Test each slide; use solid fallbacks where gradients fail |
| html2canvas does not support all CSS | Avoid backdrop-filter, clip-path, mix-blend-mode in slide content |

---

## 4. File Organization

```
apps/pitchdeck/
  app/
    layout.tsx              # Root layout (Inter + JetBrains Mono fonts, dark theme)
    page.tsx                # "use client" -> <PitchDeck />
    globals.css             # Tailwind v4 imports + brass/dark theme CSS vars
  components/
    pitch-deck.tsx          # Orchestrator (state, keyboard, slides array)
    slide-renderer.tsx      # Transition wrapper (opacity + translateX)
    slide.tsx               # Base slide layout (full viewport, centered, max-width)
    slide-header.tsx        # Reusable header (icon + title + subtitle)
    slide-controls.tsx      # Navigation buttons + slide counter + export button
    progress-bar.tsx        # Horizontal progress indicator
    pdf-exporter.tsx        # Off-screen rendering container
  slides/
    index.ts                # Re-exports all slides as ordered array
    title-slide.tsx         # Slide 1: Ammo Exchange logo, tagline
    problem-slide.tsx       # Slide 2: Market problems
    solution-slide.tsx      # Slide 3: How Ammo Exchange solves them
    market-slide.tsx        # Slide 4: TAM/SAM/SOM
    product-slide.tsx       # Slide 5: Product screenshots / architecture
    traction-slide.tsx      # Slide 6: Metrics, milestones
    business-model-slide.tsx # Slide 7: Revenue model, fee structure
    competition-slide.tsx   # Slide 8: Competitive landscape
    team-slide.tsx          # Slide 9: Team
    ask-slide.tsx           # Slide 10: Investment ask, use of funds
  lib/
    utils.ts                # cn() helper
    pdf.ts                  # html2canvas + jsPDF export function
  public/
    fonts/                  # Self-hosted fonts if needed
    images/                 # Slide images, logos
  next.config.ts            # Minimal config
  postcss.config.mjs        # @tailwindcss/postcss
  tsconfig.json             # Extends root, @/* paths
  package.json              # @ammo-exchange/pitchdeck
```

---

## 5. Theme Integration

### What to Copy from apps/web

The pitch deck reuses the Ammo Exchange brass/dark theme. Copy the CSS custom properties from `apps/web/app/globals.css` but strip out shadcn component variables (sidebar, chart colors) that are not needed.

**Copy these variables:**

```css
/* Core theme */
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-tertiary: #1a1a25;
--bg-glass: rgba(26, 26, 37, 0.7);

/* Brass accent */
--brass: #c6a44e;
--brass-hover: #d4b76a;
--brass-muted: rgba(198, 164, 78, 0.15);
--brass-border: rgba(198, 164, 78, 0.3);

/* Text */
--text-primary: #e8e8ed;
--text-secondary: #8a8a9a;
--text-muted: #8585a0;

/* Status colors */
--green: #2ecc71;
--red: #e74c3c;
--amber: #f39c12;
--blue: #3498db;

/* Borders */
--border-default: rgba(255, 255, 255, 0.06);
--border-hover: rgba(255, 255, 255, 0.12);
--border-active: rgba(198, 164, 78, 0.4);
```

**Do NOT copy:** shadcn semantic colors (--background, --card, --popover, etc.), sidebar colors, chart colors, radius variables. The pitch deck does not use shadcn components.

### Tailwind v4 Theme Mapping

The pitch deck `globals.css` maps CSS variables to Tailwind utility classes using the same `@theme inline` pattern as the web app:

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-brass: var(--brass);
  --color-brass-hover: var(--brass-hover);
  --color-brass-muted: var(--brass-muted);
  --color-brass-border: var(--brass-border);
  --color-ax-primary: var(--bg-primary);
  --color-ax-secondary: var(--bg-secondary);
  --color-ax-tertiary: var(--bg-tertiary);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}
```

This enables classes like `bg-ax-primary`, `text-brass`, `border-brass-border` -- identical to the web app.

### Fonts

Same fonts as the web app: Inter (body) + JetBrains Mono (code/numbers). Loaded via `next/font/google` in `layout.tsx` with the same CSS variable names (`--font-inter`, `--font-jetbrains`).

---

## 6. What is Shared vs Standalone

| Concern | Shared with apps/web? | Approach |
|---------|-----------------------|----------|
| CSS theme variables | Copy, do not import | Copy the ~20 custom property declarations into pitchdeck's own globals.css |
| Tailwind v4 + PostCSS config | Same pattern, independent files | Each app has its own postcss.config.mjs and globals.css |
| `cn()` utility | Duplicate (3 lines) | Not worth creating a shared package for `clsx` + `twMerge` |
| Fonts (Inter, JetBrains Mono) | Same fonts, independent loading | Each app loads via next/font/google independently |
| TypeScript config | Extends root `tsconfig.json` | Same as web app pattern |
| React / Next.js version | Same versions in both apps | pnpm hoists shared versions |
| shadcn components | NOT shared | Pitch deck does not use shadcn; too heavy |
| lucide-react icons | Same package, independent imports | Both apps depend on lucide-react |

**Key decision: No new shared package.** The overlap between the web app and pitch deck is limited to CSS variables (20 lines) and the `cn()` utility (3 lines). Creating a shared UI package for this would add build complexity, turborepo dependency edges, and maintenance overhead for near-zero benefit. Copy the small amount of shared code.

---

## 7. Next.js Configuration

The pitch deck app needs a minimal Next.js config compared to the web app:

```typescript
// apps/pitchdeck/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No transpilePackages needed (no workspace deps)
  // No serverExternalPackages needed (no Prisma)
  // No webpack customization needed (no wagmi/viem polyfills)
  output: "export", // Static export -- no server needed for a pitch deck
};

export default nextConfig;
```

**Static export (`output: "export"`)** is the right choice because:
- The pitch deck is 100% client-side (no API routes, no server components that fetch data)
- Enables deployment to any static host (Vercel, Netlify, S3, GitHub Pages)
- Faster builds, simpler deployment
- Can be shared as a folder of HTML/CSS/JS files

**Caveat:** If `output: "export"` is used, `next/font/google` still works (fonts are downloaded at build time). However, if you need `next/image` optimization, you would need to either remove `output: "export"` or use `unoptimized: true` in the image config.

---

## 8. Anti-Patterns to Avoid

### Anti-Pattern 1: Sharing a UI Component Library Between Web and Pitchdeck

**What:** Creating `packages/ui/` with shared Button, Card, etc. components
**Why bad:** The web app uses shadcn/radix (heavy, accessible, interactive). The pitch deck needs static display components. The overlap is near zero. A shared package creates coupling, build dependencies, and versioning headaches.
**Instead:** Each app owns its own components. The pitch deck has ~6 components total.

### Anti-Pattern 2: Using a Presentation Framework (reveal.js, mdx-deck, spectacle)

**What:** Pulling in a full presentation framework instead of building the simple slide system
**Why bad:** These frameworks are opinionated about theming, bring their own CSS, and make custom brass/dark theme integration harder. They also add significant bundle weight for features the pitch deck does not need (speaker notes, live coding, markdown parsing).
**Instead:** Build the ~150 lines of orchestrator + transition code directly. The reference architecture (PitchDeck orchestrator + Slide wrapper) is simpler than configuring a framework.

### Anti-Pattern 3: Server-Side PDF Generation

**What:** Using puppeteer/playwright on the server to generate PDFs
**Why bad:** Requires a server runtime (defeats static export), adds heavyweight dependencies (headless Chrome), and complicates deployment. The pitch deck is ~10 slides -- client-side html2canvas + jsPDF handles this fine.
**Instead:** Client-side html2canvas + jsPDF. User clicks export, browser does the work, downloads the file.

### Anti-Pattern 4: Dynamic Data Fetching in Slides

**What:** Fetching real-time protocol stats, prices, or TVL in the pitch deck
**Why bad:** Creates a dependency on the API/database, means the pitch deck cannot be statically exported, and makes PDF export unreliable (data might not load). Investor presentations should have fixed, curated numbers.
**Instead:** Hardcode all data in slide components. Update numbers manually before each pitch.

---

## 9. Scalability Considerations

| Concern | Current (10 slides) | If 20+ slides | If multiple decks |
|---------|---------------------|----------------|-------------------|
| Bundle size | Negligible (~50KB app code) | Still fine, slides are mostly JSX | Add route-based code splitting per deck |
| PDF export time | ~3-5 seconds | ~8-12 seconds, add progress indicator | Export per-deck, not all at once |
| Keyboard nav | Simple array index | Same, no change | Add deck selection before entering nav |
| Theme customization | Single theme | Same | CSS variable overrides per deck |

The current architecture handles the 10-slide pitch deck with no scalability concerns. If multiple decks are needed later, add Next.js routes (`/investor`, `/partner`, `/technical`) each mounting their own `PitchDeck` with a different slides array.

---

## 10. Build and Deploy

### Local Development

```bash
# Start just the pitch deck
pnpm --filter @ammo-exchange/pitchdeck dev

# Or start all apps together
pnpm dev
# Pitch deck available at http://localhost:3001
```

### Production Build

```bash
# Build just the pitch deck
turbo build --filter=@ammo-exchange/pitchdeck

# Output: apps/pitchdeck/out/ (static files, if using output: "export")
```

### Deployment

With `output: "export"`, the `apps/pitchdeck/out/` directory contains a fully static site. Deploy options:
- **Vercel:** Auto-detects static export from monorepo (set root directory to `apps/pitchdeck`)
- **Any static host:** Upload the `out/` directory

---

## Sources

- Existing codebase analysis: `turbo.json`, `pnpm-workspace.yaml`, `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/app/globals.css` (HIGH confidence -- direct source inspection)
- [html2canvas + jsPDF React integration](https://medium.com/@saidularefin8/generating-pdfs-from-html-in-a-react-application-with-html2canvas-and-jspdf-d46c5785eff2) (MEDIUM confidence -- community tutorial, verified pattern)
- [html2canvas high resolution issues](https://github.com/niklasvh/html2canvas/issues/3009) (MEDIUM confidence -- GitHub issues)
- [jsPDF best practices 2026](https://copyprogramming.com/howto/node-jspdf-pdf-generation-node-js) (MEDIUM confidence -- tutorial, cross-referenced)
- Next.js static export behavior with next/font: based on Next.js 15 documentation (HIGH confidence)

---

_Architecture research: 2026-02-17_
_Informs: Pitch deck milestone structure and implementation phases_
