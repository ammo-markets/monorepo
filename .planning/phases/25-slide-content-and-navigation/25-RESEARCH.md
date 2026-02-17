# Phase 25: Slide Content & Navigation - Research

**Researched:** 2026-02-17
**Domain:** React slide system with keyboard navigation, CSS transitions, and Recharts charting within a hex-only static Next.js app
**Confidence:** HIGH

## Summary

Phase 25 builds the full 13-slide investor pitch deck and navigation system inside the existing `apps/pitchdeck` scaffold from Phase 24. The work divides cleanly into two concerns: (1) a slide orchestration system with keyboard/click navigation and CSS transitions, and (2) 13 individual slide content components.

The slide system is a lightweight custom implementation -- no presentation library needed. A `useDeck` hook manages the current slide index, keyboard bindings (`useEffect` on `keydown`), and exposes navigation functions. A `SlideRenderer` component applies CSS `opacity + translateX` transitions between slides. Individual slide components are pure presentational React components receiving static data. The only external dependency needed is `recharts` for SLIDE-03's price volatility chart.

The existing pitchdeck app (Phase 24) provides the foundation: Next.js 15 static export, Tailwind v4 hex-only theme, `@ammo-exchange/shared` workspace dependency. Phase 25 adds one new dependency (`recharts`) and creates ~20 new component files.

**Primary recommendation:** Build a `useDeck` custom hook for state management, a `SlideRenderer` wrapper for CSS transitions, `SlideControls` for Prev/Next buttons + counter, and 13 individual `Slide*.tsx` components. Use `recharts` directly (not the shadcn chart wrapper from `apps/web`) to avoid oklch/shadcn dependency. All slide content is hardcoded as static data objects -- no API calls, no database.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^19.0.0 | Component framework | Already installed in pitchdeck app |
| recharts | 2.15.4 | SVG charting for price volatility slide | Already used in apps/web, supports React 19, renders inline SVG with explicit hex colors |
| tailwindcss | ^4.0.6 | Styling | Already installed in pitchdeck app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @ammo-exchange/shared | workspace:* | CALIBER_SPECS, FEES constants | Slide content referencing protocol specs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom slide system | reveal.js / Slidev / react-slideshow | Massive overkill for 13 static slides; brings CSS/theme conflicts; harder to PDF-export later |
| Custom CSS transitions | framer-motion / react-spring | Adds ~50KB+ bundle; the requirement explicitly says "no animation library, CSS opacity + translateX" |
| Direct Recharts | shadcn Chart wrapper from apps/web | The shadcn wrapper uses oklch theme tokens (muted-foreground, border, etc.) that are wiped in pitchdeck; use Recharts directly with hex colors |

**Installation:**
```bash
pnpm --filter @ammo-exchange/pitchdeck add recharts@2.15.4
```

## Architecture Patterns

### Recommended Project Structure
```
apps/pitchdeck/
├── app/
│   ├── layout.tsx              # Root layout (unchanged from Phase 24)
│   ├── page.tsx                # PitchDeck orchestrator (replaces test slide)
│   └── globals.css             # Hex-only theme (unchanged, possibly add slide-specific tokens)
├── components/
│   ├── PitchDeck.tsx           # Client component: useDeck hook host, keyboard listener
│   ├── SlideRenderer.tsx       # CSS transition wrapper (opacity + translateX)
│   ├── SlideControls.tsx       # Prev/Next buttons + slide counter + progress bar
│   └── slides/
│       ├── index.ts            # Barrel export: SLIDES array of components
│       ├── SlideCover.tsx      # SLIDE-01: Cover
│       ├── SlideProblem.tsx    # SLIDE-02: Problem
│       ├── SlideVolatility.tsx # SLIDE-03: Price chart (Recharts)
│       ├── SlideSolution.tsx   # SLIDE-04: Solution
│       ├── SlideHowItWorks.tsx # SLIDE-05: How it works
│       ├── SlideMarket.tsx     # SLIDE-06: Market opportunity
│       ├── SlideCompetitive.tsx# SLIDE-07: Competitive landscape
│       ├── SlideRevenue.tsx    # SLIDE-08: Revenue model
│       ├── SlideTraction.tsx   # SLIDE-09: Traction/demo
│       ├── SlideRegulatory.tsx # SLIDE-10: Regulatory
│       ├── SlideRoadmap.tsx    # SLIDE-11: Roadmap
│       ├── SlideTeam.tsx       # SLIDE-12: Team
│       └── SlideAsk.tsx        # SLIDE-13: Ask/CTA
├── lib/
│   ├── useDeck.ts              # Custom hook: slide index, navigation, keyboard
│   └── slideData.ts            # Static data constants for all slides
└── public/                     # Static assets (logos, if any)
```

### Pattern 1: useDeck Custom Hook
**What:** Manages slide index state, keyboard event listener, and navigation boundary logic
**When to use:** Single source of truth for slide navigation state

```typescript
// apps/pitchdeck/lib/useDeck.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export function useDeck(totalSlides: number) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentSlide ? "right" : "left");
      setCurrentSlide(index);
    },
    [currentSlide, totalSlides],
  );

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);
  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(totalSlides - 1), [goTo, totalSlides]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goFirst();
          break;
        case "End":
          e.preventDefault();
          goLast();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, goFirst, goLast]);

  return {
    currentSlide,
    direction,
    totalSlides,
    next,
    prev,
    goTo,
    goFirst,
    goLast,
    isFirst: currentSlide === 0,
    isLast: currentSlide === totalSlides - 1,
  };
}
```

### Pattern 2: CSS Slide Transitions (opacity + translateX)
**What:** Pure CSS transitions between slides without animation libraries
**When to use:** Required by NAV-03 -- no framer-motion or similar

The key insight: keep all slides mounted but only show the active one. Use CSS `transition` on `opacity` and `transform` for smooth entrance/exit.

```css
/* In globals.css -- slide transition classes */
.slide-enter-right {
  opacity: 0;
  transform: translateX(30px);
}

.slide-enter-left {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.slide-exit {
  opacity: 0;
  transition: opacity 200ms ease-in;
  position: absolute;
  inset: 0;
}
```

Alternative (simpler): Only render the active slide, use a CSS transition on a wrapper div that applies `translateX` based on direction. This avoids mounting all 13 slides simultaneously.

```tsx
// SlideRenderer.tsx approach
function SlideRenderer({ slide, direction }: { slide: number; direction: "left" | "right" }) {
  const SlideComponent = SLIDES[slide];
  return (
    <div
      key={slide}
      className="slide-active"
      style={{
        animation: direction === "right"
          ? "slideInRight 300ms ease-out"
          : "slideInLeft 300ms ease-out",
      }}
    >
      <SlideComponent />
    </div>
  );
}
```

**Recommended approach:** Use CSS `@keyframes` for enter animation on the active slide. Only mount the active slide component (not all 13). Use `key={currentSlide}` on the wrapper to force React to remount and trigger the CSS animation on each slide change.

```css
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Pattern 3: Slide Layout (16:9 Aspect Ratio)
**What:** Each slide renders in a consistent 16:9 container for PDF export compatibility
**When to use:** All slides need a uniform container

```tsx
// SlideLayout wrapper component
function SlideLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-full w-full flex-col p-12 ${className ?? ""}`}>
      {children}
    </div>
  );
}
```

The outer container should enforce 16:9 aspect ratio using `aspect-video` (which is 16/9). The slide viewport should be sized to fill the browser window while maintaining aspect ratio.

### Pattern 4: Recharts with Hex Colors (No oklch)
**What:** Use Recharts directly with explicit hex color props -- no CSS variable references that might resolve to oklch
**When to use:** SLIDE-03 price volatility chart

```tsx
// Direct hex colors -- safe for pitchdeck's hex-only theme
<LineChart data={priceData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
  <XAxis dataKey="date" stroke="#8a8a9a" tick={{ fontSize: 12 }} />
  <YAxis stroke="#8a8a9a" tick={{ fontSize: 12 }} />
  <Line
    type="monotone"
    dataKey="price"
    stroke="#c6a44e"  /* brass hex */
    strokeWidth={2}
    dot={false}
  />
</LineChart>
```

Recharts renders inline SVG with explicit `stroke` and `fill` attributes. As long as hex values are passed directly (not CSS variables that could resolve to oklch), there is zero oklch risk. Recharts does not inject its own CSS custom properties.

### Pattern 5: "use client" Boundary
**What:** The PitchDeck orchestrator and all interactive components need "use client"
**When to use:** Required because keyboard event listeners, useState, useEffect are client-side APIs

```
app/page.tsx          → Server Component (imports PitchDeck)
components/PitchDeck  → "use client" (useDeck hook, keyboard listeners)
components/slides/*   → "use client" (only needed for SlideVolatility with Recharts; others can be server components imported into client tree)
```

Since `PitchDeck.tsx` is a client component and renders slides as children, all slide components will be part of the client bundle regardless. Mark `PitchDeck.tsx` as `"use client"` and keep slide components as regular components (they'll be bundled client-side automatically because they're rendered by a client component).

### Anti-Patterns to Avoid
- **Mounting all 13 slides simultaneously:** Wastes memory and makes PDF export harder. Only mount the active slide.
- **Using framer-motion or any animation library:** The requirement explicitly forbids this. Use CSS transitions/keyframes only.
- **Importing shadcn chart wrapper from apps/web:** It uses oklch CSS variables (muted-foreground, border) that are wiped in pitchdeck. Use Recharts directly.
- **Using CSS `transition` with `key` prop:** When React unmounts/remounts via `key`, CSS `transition` won't fire (no previous state to transition from). Use `@keyframes animation` instead.
- **Fetching slide data from API:** This is a static export. All data must be hardcoded or imported from constants.
- **Using `useRouter` for slide navigation:** Slides are not separate pages/routes. Use local state (useDeck hook) for slide index.
- **Responsive design at this stage:** The pitch deck targets 1920x1080 landscape for PDF export. Responsive mobile layout is not a requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG charts | Custom SVG path generation | Recharts `LineChart` + `AreaChart` | Axes, tooltips, responsive sizing, data binding all handled |
| Keyboard event handling | Manual addEventListener in each component | Single `useEffect` in useDeck hook | One listener, one cleanup, consistent behavior |
| Slide content data | Inline JSX strings everywhere | Centralized `slideData.ts` constants | Easier to review, update, and reuse across slides |
| Progress indicator | Custom width calculation | CSS `width: ${(current / total) * 100}%` with transition | Trivial one-liner, no component needed |

**Key insight:** The slide system is simple enough that custom code is cleaner than any library. The complexity is in the 13 slide CONTENT components, not the navigation/transition infrastructure.

## Common Pitfalls

### Pitfall 1: CSS Transition vs Animation on Remount
**What goes wrong:** Using CSS `transition` on a slide wrapper with `key={currentSlide}` results in no visible transition -- the slide just appears instantly.
**Why it happens:** When React changes `key`, it unmounts old and mounts new. The new element starts with its final CSS state -- there's no previous state for `transition` to animate FROM.
**How to avoid:** Use CSS `@keyframes animation` instead of `transition`. Animations play from their `from` state on mount, regardless of React remounting.
**Warning signs:** Slides appear instantly with no visual transition despite CSS `transition` properties being set.

### Pitfall 2: Space Key Scrolling the Page
**What goes wrong:** Pressing Space to advance slides also scrolls the page down.
**Why it happens:** Space is the browser default for scrolling down a page.
**How to avoid:** Call `e.preventDefault()` in the keydown handler for Space. Also consider setting `overflow: hidden` on the slide container or body.
**Warning signs:** Page jumps/scrolls when pressing Space to navigate.

### Pitfall 3: Recharts oklch Colors via CSS Variables
**What goes wrong:** Recharts components using CSS variable references like `var(--color-foreground)` could theoretically resolve to oklch if any Tailwind default leaked through.
**Why it happens:** The shadcn chart wrapper in apps/web injects CSS variables via `ChartStyle` component. If copied, those variables could conflict.
**How to avoid:** Do NOT copy the shadcn Chart component from apps/web. Use Recharts directly with hardcoded hex values: `stroke="#c6a44e"`, `fill="#12121a"`.
**Warning signs:** Any `oklch(...)` appearing in the SVG output or computed styles.

### Pitfall 4: Recharts ResponsiveContainer Height
**What goes wrong:** Recharts `ResponsiveContainer` renders with zero height, making the chart invisible.
**Why it happens:** `ResponsiveContainer` needs its parent to have an explicit height. If the parent uses only `flex` or auto height, Recharts can't determine the available space.
**How to avoid:** Give the chart's parent container an explicit height: `<div className="h-[400px] w-full">`. Or use `aspect-[16/9]` with a width constraint.
**Warning signs:** Chart area appears blank or collapsed to zero height.

### Pitfall 5: Static Export + "use client" Confusion
**What goes wrong:** Developers think `output: "export"` means no client-side JavaScript, then are confused when `"use client"` components work fine.
**Why it happens:** `output: "export"` means no Node.js server at runtime -- it still bundles and serves client-side JavaScript. Client components work normally.
**How to avoid:** Understand that static export produces HTML + JS bundles. `"use client"` components hydrate on the client. The constraint is no server-side runtime features (API routes, Server Actions, dynamic routes without `generateStaticParams`).
**Warning signs:** None -- this is just a conceptual misunderstanding.

### Pitfall 6: Slide Counter Off-by-One
**What goes wrong:** Slide counter shows "0 / 13" instead of "1 / 13".
**Why it happens:** Internal state uses zero-based index, display should be one-based.
**How to avoid:** Display `currentSlide + 1` in the counter: `{currentSlide + 1} / {totalSlides}`.
**Warning signs:** Counter showing 0 or 14.

## Code Examples

### Recharts Line Chart with Hex Colors
```tsx
// Source: Recharts docs + hex-only constraint
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

const PRICE_DATA = [
  { year: "2018", price: 0.18 },
  { year: "2019", price: 0.17 },
  { year: "2020", price: 0.35 },
  { year: "2021", price: 0.82 },
  { year: "2022", price: 0.38 },
  { year: "2023", price: 0.24 },
  { year: "2024", price: 0.22 },
  { year: "2025", price: 0.21 },
];

export function PriceChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={PRICE_DATA}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c6a44e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c6a44e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
          <XAxis dataKey="year" stroke="#8a8a9a" fontSize={12} />
          <YAxis
            stroke="#8a8a9a"
            fontSize={12}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#12121a",
              border: "1px solid #1a1a25",
              borderRadius: "8px",
              color: "#e8e8ed",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}/rd`, "9mm FMJ"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#c6a44e"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Slide Controls Component
```tsx
// Source: custom for Phase 25
interface SlideControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SlideControls({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: SlideControlsProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="rounded-lg bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        Prev
      </button>

      {/* Slide counter */}
      <span className="font-mono text-sm text-text-muted">
        {currentSlide + 1} / {totalSlides}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        className="rounded-lg bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
```

### CSS Keyframe Animations for Slide Transitions
```css
/* In globals.css */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### PitchDeck Orchestrator
```tsx
// apps/pitchdeck/components/PitchDeck.tsx
"use client";

import { useDeck } from "@/lib/useDeck";
import { SlideControls } from "./SlideControls";
import { SLIDES } from "./slides";

export function PitchDeck() {
  const deck = useDeck(SLIDES.length);
  const SlideComponent = SLIDES[deck.currentSlide];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Slide viewport */}
      <div className="relative flex-1 overflow-hidden">
        <div
          key={deck.currentSlide}
          className="absolute inset-0"
          style={{
            animation: `${
              deck.direction === "right" ? "slideInRight" : "slideInLeft"
            } 300ms ease-out`,
          }}
        >
          <SlideComponent />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-brass"
          style={{
            width: `${((deck.currentSlide + 1) / deck.totalSlides) * 100}%`,
            transition: "width 300ms ease-out",
          }}
        />
      </div>

      {/* Controls */}
      <SlideControls
        currentSlide={deck.currentSlide}
        totalSlides={deck.totalSlides}
        onPrev={deck.prev}
        onNext={deck.next}
        isFirst={deck.isFirst}
        isLast={deck.isLast}
      />
    </div>
  );
}
```

## Slide Content Reference

Each slide's content comes from the whitepaper. Key data points per slide:

| Slide | Component | Key Content | Data Source |
|-------|-----------|-------------|-------------|
| 1 - Cover | SlideCover | "Ammo Exchange" brand, tagline "Make your ammo liquid", 5-sec hook | whitepaper title |
| 2 - Problem | SlideProblem | $8B market, no futures/exchange/instrument, high friction | whitepaper section 1 |
| 3 - Volatility | SlideVolatility | 9mm price history 2018-2025 ($0.17-$0.82), Recharts area chart | whitepaper section 1.2 |
| 4 - Solution | SlideSolution | USDC in -> tokens out -> redeem for physical | whitepaper section 2.1 |
| 5 - How It Works | SlideHowItWorks | 2-step async mint/redeem, per-caliber tokens, 4 calibers | whitepaper section 2.2-2.3, CALIBER_SPECS |
| 6 - Market | SlideMarket | TAM $8B, SAM ~$800M (10%), SOM ~$80M (1%), 32% gun ownership | whitepaper section 8 |
| 7 - Competitive | SlideCompetitive | "PAXG for ammunition", vs AmmoSeek/AmmoSquared/forums | whitepaper section 1.3 |
| 8 - Revenue | SlideRevenue | Mint 1.5%, redeem 1.5%, wholesale spread 5-15%, unit economics | whitepaper section 5 |
| 9 - Traction | SlideTraction | Live testnet link, Fuji dashboard CTA | protocol fact |
| 10 - Regulatory | SlideRegulatory | No FFL required, KYC at redemption, token classification | whitepaper section 7 |
| 11 - Roadmap | SlideRoadmap | 4 phases: MVP, Expansion, DeFi Integration, Scale | whitepaper section 9 |
| 12 - Team | SlideTeam | Placeholder bios (TBD) | requirement |
| 13 - Ask/CTA | SlideAsk | Investor CTA, partnership opportunities | requirement |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Presentation libraries (reveal.js) | Custom React slide systems | 2023+ | Modern React apps build custom decks for full control and PDF export |
| framer-motion for all animations | CSS @keyframes for simple transitions | Always valid | No bundle cost, better performance for simple opacity+transform |
| Class-based animation toggling | `key` prop + CSS animation | React pattern | React remount triggers animation without managing class state |
| Recharts 2.x with React 18 | Recharts 2.15.x with React 19 support | 2024 | Peer dependency expanded to include ^19.0.0 |

**Deprecated/outdated:**
- `recharts` v1.x: Use v2.15+ for React 19 compatibility
- CSS `transition` for mount animations: Use `@keyframes animation` -- transitions require a "from" state that doesn't exist on mount

## Open Questions

1. **Slide aspect ratio enforcement strategy**
   - What we know: PDF export in Phase 26 will render at 1920x1080. Slides should target this ratio.
   - What's unclear: Whether to enforce exact 1920x1080 or use CSS `aspect-video` (16/9) with fluid sizing
   - Recommendation: Use `aspect-video` with `max-w-[1920px]` and `max-h-[1080px]` for the slide container. This keeps slides viewable at any window size while targeting the PDF dimensions. The `h-screen` approach with overflow hidden is simpler and works well for a presentation tool.

2. **Price data granularity for SLIDE-03**
   - What we know: Whitepaper mentions 9mm prices at yearly granularity (2018-2025)
   - What's unclear: Whether to fabricate monthly data points for a smoother chart or stick to yearly
   - Recommendation: Use yearly data points from the whitepaper. Add a few more points at critical moments (pre-pandemic baseline, pandemic spike peak, recovery) for a more compelling visual -- approximately 8-10 data points total.

3. **Whether SLIDE-09 traction link should be a real URL**
   - What we know: The requirement says "live testnet link CTA to Fuji dashboard"
   - What's unclear: Whether the pitchdeck should link to the actual deployed web app or use a placeholder
   - Recommendation: Use the actual Fuji testnet URL if deployed, otherwise a placeholder with clear "Coming Soon" or a demo link. Since this is a static export, external links work fine.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `apps/pitchdeck/` scaffold (Phase 24 output) -- verified structure, theme, config
- Existing codebase: `apps/web/components/ui/chart.tsx` -- Recharts usage pattern with shadcn wrapper
- Existing codebase: `apps/web/package.json` -- confirmed Recharts 2.15.4 with React 19 peer support
- Existing codebase: `packages/shared/src/constants/index.ts` -- CALIBER_SPECS, FEES constants
- Existing codebase: `whitepaper.md` -- all slide content data (market size, prices, fees, roadmap, regulatory)

### Secondary (MEDIUM confidence)
- Recharts official docs (recharts.org) -- ResponsiveContainer, AreaChart, LineChart API
- MDN Web Docs -- CSS @keyframes animation vs transition behavior on mount

### Tertiary (LOW confidence)
- None. All findings verified against codebase or official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts already in monorepo, only new dependency for pitchdeck
- Architecture: HIGH - Custom slide system is straightforward React patterns (useState, useEffect, key prop)
- Slide content: HIGH - All data available in whitepaper.md and shared constants
- CSS transitions: HIGH - Well-understood CSS @keyframes pattern, no library needed
- Pitfalls: HIGH - CSS transition vs animation on mount is a known React gotcha

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable -- all technologies are mature)
