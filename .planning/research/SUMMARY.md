# Project Research Summary

**Project:** Ammo Exchange — Pitch Deck App (`apps/pitchdeck`)
**Domain:** Investor-facing pitch deck web app within an existing DeFi protocol monorepo
**Researched:** 2026-02-17
**Confidence:** HIGH

## Executive Summary

The pitch deck app is a standalone, statically-exported Next.js 15 app added to the existing Ammo Exchange Turborepo monorepo. It serves a single purpose: convert protocol whitepaper content into a compelling 13-slide investor/partner presentation with PDF export capability. Because the protocol (smart contracts, dashboard, admin, event indexer) already exists on Fuji testnet, the deck's credibility hook — showing a working product — costs nearly nothing to implement. The recommended approach is to build the deck as a pure client-side app with no database, no wallet connection, and no server-side dependencies; content is hardcoded in React components; the only new infrastructure is client-side PDF generation via `html2canvas-pro` + `jsPDF`.

The recommended stack reuses the monorepo's proven foundation (Next.js 15, React 19, Tailwind v4, TypeScript strict mode, pnpm workspaces, Turborepo) with exactly three new packages: `html2canvas-pro` (Tailwind v4-compatible DOM-to-canvas renderer), `jsPDF` v4 (PDF assembly), and `next-themes` (dark/light toggle with FOUC prevention). No presentation framework (Reveal.js, Spectacle, Slidev) is needed — a ~150-line custom orchestrator with CSS transitions is simpler, faster, and does not conflict with the Ammo Exchange brass/dark theme. The deck deploys independently as a static site (`output: "export"`) to its own Vercel project at a shareable investor URL.

The most critical risk is a CSS color compatibility issue: Tailwind v4 generates `oklch()` color values by default, which `html2canvas` cannot render, causing PDF export to produce blank pages. The mitigation is non-negotiable and must be established in Phase 1: all colors in the pitch deck's `globals.css` must use hex/rgba exclusively. The Ammo Exchange custom token system (`--brass: #c6a44e`, `--bg-primary: #0a0a0f`) already does this — the pitfall is accidentally reusing shadcn's oklch-based semantic tokens from `apps/web`, which must be explicitly excluded.

---

## Key Findings

### Recommended Stack

The stack is minimal and almost entirely inherited from the existing monorepo. Three new packages are the only additions. `html2canvas-pro` is the critical dependency: it is a maintained fork of `html2canvas` with explicit modern CSS support (`oklch()`, `color()`, `calc()` in background-position, CSS `rotate`), which is mandatory for Tailwind v4 compatibility. `jsPDF` v4.1.0 adds PDF assembly with a security patch for CVE-2025-68428. `next-themes` v0.4.6 provides SSR-safe dark mode with `suppressHydrationWarning` on `<html>` and React 19 peer dep compatibility.

The deck is explicitly scoped to `apps/pitchdeck/` on port 3001 with no dependency on `@ammo-exchange/db`, `@ammo-exchange/contracts`, wagmi, viem, iron-session, Prisma, or TanStack Query. Build dependency graph: `packages/shared (no build step) → apps/pitchdeck`. Turbo handles this correctly with zero config changes to the monorepo root.

**Core technologies:**

- `html2canvas-pro ^1.6.7`: DOM-to-canvas rendering — only fork supporting Tailwind v4's modern CSS color functions
- `jsPDF ^4.1.0`: PDF assembly — industry standard, v4 includes security patches (CVE-2025-68428)
- `next-themes ^0.4.6`: Dark/light mode — React 19 compatible, handles SSR FOUC, 15KB footprint
- `lucide-react ^0.563.0`: Icons — already in `apps/web`, zero additional bundle cost via pnpm hoisting
- `@ammo-exchange/shared`: Protocol constants and caliber specs for slide content (optional — only if needed)

### Expected Features

The feature landscape divides into 10 table-stakes slides (the actual deck content), 7 differentiators, and 6 anti-features to explicitly avoid. All 10 table-stakes slides are independent of each other and can be built in parallel. The investor-optimized narrative flow: Cover → Problem → Price Volatility → Solution → How It Works → Market Opportunity → Competitive Landscape → Revenue Model → Traction/Demo → Regulatory → Roadmap → Team → Ask (13 slides, ~4 minute read time).

**Must have (table stakes):**

- Cover slide — brand identity, tagline ("Make Your Ammo Liquid"), 5-second hook
- Problem slide — $8B market, no liquid secondary exchange, price volatility data
- Price Volatility chart — interactive 9mm prices 2019-2025, 4x swing, the single most compelling visual
- Solution slide — USDC in, tokens out, redeem for physical; one diagram, three steps
- How It Works — two-step async mint/redeem flow, per-caliber tokens (9MM, 556, 22LR, 308)
- Market Opportunity — TAM/SAM/SOM with 26.2M first-time gun buyers since 2020
- Competitive Landscape — "PAXG for ammunition" framing vs. AmmoSeek, AmmoSquared
- Revenue Model — fee structure table, wholesale spread unit economics, conservative projections
- Regulatory Positioning — no FFL required, KYC at redemption only, token classification rationale
- Team and The Ask — fundraising strategy, use-of-funds breakdown, milestones unlocked

**Should have (competitive differentiators):**

- Interactive 9mm price volatility chart — the "wow" slide; hardcoded historical data, built with Recharts
- Live testnet demo link — existing Fuji dashboard, link with CTA costs near zero to add
- PDF export — practical necessity for investor email distribution
- URL-param personalization ("Prepared for [Investor Name]") — low effort, high perceived value

**Defer to v2+:**

- Animated protocol flow visualization — Medium-High complexity; static diagram covers 90% of value
- Live on-chain metrics feed — API work required; "as of [date]" static numbers work initially
- Custom view analytics — use Plausible/PostHog initially instead of building custom event tracking

**Explicit anti-features (do not build):**

- Presentation editor or CMS — content changes quarterly, edit the code
- Presenter mode, speaker notes, slide transitions beyond CSS opacity+translateX
- Full dApp embedded inside deck — link out to Fuji dashboard instead
- Multi-language support — English-only for U.S.-focused initial investor outreach
- Governance token/tokenomics slides — deferred in whitepaper; including them invites securities scrutiny

### Architecture Approach

The pitch deck uses a thin custom slide system: a `PitchDeck` orchestrator component owns all slide state, keyboard navigation, and the slides array definition. A `SlideRenderer` wrapper handles CSS opacity+translateX transitions — no Framer Motion needed, one CSS transition does not justify 30KB+ of animation library. Each slide is a full-viewport React component rendered one at a time. PDF export uses an off-screen clone technique: all slides are rendered simultaneously in a hidden `position: fixed; left: -9999px` container at fixed 1920x1080 resolution, captured sequentially with `html2canvas-pro`, then assembled into a multi-page landscape PDF by `jsPDF`. The `output: "export"` Next.js config produces a fully static site — no server, no API routes, deployable to any static host.

No new shared packages are needed. The CSS theme variables from `apps/web` (~20 lines of custom properties) and the `cn()` utility (3 lines) are copied directly into the pitch deck — creating a `packages/ui/` shared package for this overlap adds build complexity for near-zero benefit. The overlap is intentionally minimal.

**Major components:**

1. `PitchDeck` orchestrator — owns `currentSlide` state, keyboard event listener, slides array definition
2. `SlideRenderer` — CSS transition wrapper (opacity + translateX, no external animation library)
3. `Slide` base — full-viewport layout wrapper (consistent padding, max-width, brass/dark background)
4. `SlideHeader` — reusable icon + title + subtitle presentational component
5. `SlideControls` — prev/next buttons, slide counter, PDF export trigger
6. `PDFExporter` — off-screen hidden container rendering all slides at 1920x1080 for capture
7. Individual slide components (13 files in `slides/`) — one per slide, pure presentational content

### Critical Pitfalls

1. **oklch() color crash in PDF export** — Tailwind v4 defaults generate `oklch()` colors that `html2canvas` cannot parse, causing blank PDF pages. Prevention: define ALL colors in pitchdeck's `globals.css` using hex/rgba exclusively; never import shadcn's oklch semantic tokens; validate PDF export on the first slide before building any more content.

2. **Blurry text in PDF output** — Default html2canvas `scale:1` produces ~72 DPI rasterization, visibly fuzzy in print. Prevention: always set `scale: 2` in html2canvas options; pass page dimensions (not canvas dimensions) to `jsPDF.addImage()` so the 2x image scales back down to fit the page.

3. **Navigation chrome captured in PDF** — html2canvas captures the full DOM including prev/next buttons, progress bars, and hover states. Prevention: separate `SlideContent` from `SlideControls` in the component hierarchy from day one; use `data-html2canvas-ignore` on all interactive chrome; use the off-screen clone technique so only content elements are captured.

4. **CSS clamp()/viewport units break in off-screen rendering** — `vw`/`vh` units resolve against the browser window, not the off-screen clone container, causing text size mismatches between PDF and screen. Prevention: use a fixed-dimension slide container (1920x1080) with CSS `transform: scale()` for responsive on-screen display; slide content uses fixed `px`/`rem`, not fluid typography.

5. **Phase 1 setup traps (four independent issues)** — port collision (must use `--port 3001`), Tailwind v4 not scanning the new app (needs own `postcss.config.mjs`), missing `transpilePackages: ["@ammo-exchange/shared"]` in `next.config.ts`, and pitch deck inheriting unnecessary db/contracts Turbo build deps. All are one-line fixes but collectively block the entire setup if missed.

---

## Implications for Roadmap

Based on research, the pitch deck builds naturally in three phases following a foundation → content → export/deploy progression:

### Phase 1: Foundation and Setup

**Rationale:** The CSS color strategy is foundational — changing from oklch to hex after slides are built means touching every color reference across 13 components. All four setup traps (#4 port collision, #5 Tailwind scanning, #7 transpilePackages, #13 Turbo deps) must be resolved before any slide content can be written or tested. The `output: "export"` deployment choice must be made upfront because adding API routes later is incompatible with static export.
**Delivers:** Working `apps/pitchdeck` scaffold — Next.js 15 app running on port 3001, Tailwind v4 with hex-only brass/dark theme, PostCSS config, TypeScript config extending root, `next.config.ts` with `transpilePackages` and `output: "export"`, first blank slide renders correctly in browser and exports a non-blank page to PDF.
**Addresses:** Prerequisites for all slide and PDF work; validates that html2canvas-pro renders the brass/dark color palette without errors.
**Avoids:** oklch crash (#1), port collision (#4), Tailwind silent failure (#5), transpilePackages build error (#7), unnecessary Turbo build deps (#13)

### Phase 2: Core Slide Content and Navigation

**Rationale:** All 13 slides are independent of each other and can be built in parallel once the scaffold exists. Slide content is drawn entirely from existing whitepaper sections — no new research or decisions needed except team bios and fundraising figures (which can use placeholders). The custom slide navigation system (keyboard arrows, progress bar, slide counter, CSS transitions) also belongs here as it is purely presentational with no PDF coupling.
**Delivers:** Complete 13-slide investor deck visible in browser with keyboard navigation (ArrowLeft/Right/Space/Home/End), progress indicator, and CSS slide transitions; interactive 9mm price volatility chart; live testnet demo link CTA; URL parameter personalization for investor-specific cover slides.
**Uses:** Next.js 15, React 19, Tailwind v4, lucide-react, Recharts (for price chart), whitepaper content
**Implements:** PitchDeck orchestrator, SlideRenderer, Slide base, SlideHeader, SlideControls, ProgressBar, all 13 slide components
**Avoids:** Keyboard conflicts with browser defaults (#8) via `tabIndex` container and `preventDefault` on captured keys

### Phase 3: PDF Export and Deployment

**Rationale:** PDF export depends on all slides being finalized in Phase 2. The off-screen rendering architecture, animation reset handling, font loading synchronization, and file size optimization are all PDF-specific concerns that belong together after slide content stabilizes.
**Delivers:** Working PDF export (all 13 slides, `scale: 2`, JPEG compression targeting 10-15MB output); "Export PDF" button in SlideControls; animation reset injected via `onclone` callback; `document.fonts.ready` await before capture; deployment to Vercel static host at shareable investor URL.
**Avoids:** Blurry text (#2), UI artifacts in PDF (#3), CSS clamp rendering failure (#6), animation mid-state capture (#9), font loading race condition (#10), oversized PDF files (#11), static export incompatibility (#12)

### Phase Ordering Rationale

- Phase 1 before Phase 2: CSS color foundation must be validated (PDF renders a non-blank slide) before slide content is written. Fixing oklch colors after 13 slides are built means touching every component.
- Phase 2 before Phase 3: PDF export is tested against finalized slides. Layout changes after PDF architecture is built may require adjusting the off-screen clone dimensions and capture logic.
- Content (Phase 2) is entirely internal — all whitepaper data is available now, no external blockers except team bios and fundraising figures (use placeholders).
- Phase 3 is the natural completion boundary: a shareable URL + downloadable PDF constitutes a shippable pitch deck.

### Research Flags

Phases with standard, well-documented patterns (research-phase can be skipped):

- **Phase 1:** Every setup step has a direct analog in `apps/web`. Copy `next.config.ts`, `postcss.config.mjs`, `package.json` patterns. Zero novel decisions. The pitfalls document provides exact prevention code for each setup trap.
- **Phase 2:** Slide content comes from the whitepaper. Component patterns are fully specified in ARCHITECTURE.md with code samples. The CSS slide transition is ~50 lines of React using no external libraries.
- **Phase 3:** PDF export architecture is fully specified in ARCHITECTURE.md (off-screen clone, `scale: 2`, `onclone` animation reset, `document.fonts.ready`). All pitfalls documented with prevention code. No additional research needed.

None of the three phases require additional `/gsd:research-phase` work. The research is comprehensive and the implementation path is unambiguous.

---

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                                                        |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack        | HIGH       | All versions npm-verified 2026-02-17. Peer dependencies confirmed. Monorepo compatibility verified via direct codebase inspection of `apps/web` patterns.                                                    |
| Features     | HIGH       | Slide structure derived from multiple funded DeFi/RWA pitch deck analyses. Narrative flow validated across investor psychology research. Slide content sourced from existing whitepaper.                     |
| Architecture | HIGH       | Derived directly from existing `apps/web` codebase patterns. Component hierarchy is a known, simple pattern with no novel design decisions. Reference code included in ARCHITECTURE.md.                      |
| Pitfalls     | HIGH       | 10 of 13 pitfalls rated HIGH confidence with specific GitHub issue references, npm package inspection, and direct codebase verification. 3 pitfalls rated MEDIUM (logically inferred from library behavior). |

**Overall confidence:** HIGH

### Gaps to Address

- **Team bios and photos** (Slide 12): Content depends on team providing materials. Mark as placeholder in Phase 2 and fill before launch. Not a technical blocker.
- **Fundraising decisions for The Ask slide** (Slide 13): Raise amount and use-of-funds breakdown require founder decision before slide content can be written. Same placeholder approach. Not a technical blocker.
- **Historical 9mm price data** (Price Volatility chart, Slide 3): Data available from AmmoSeek/AmmoStats archives. Source and format as a JSON array before building the chart component. Build the component with sample data first, replace with real data before launch.
- **PDF file size validation**: Actual file size depends on slide content complexity. The JPEG-at-0.85 approach targets 10-15MB but should be validated with representative content early in Phase 3. Adjust quality parameter if needed.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection (`turbo.json`, `pnpm-workspace.yaml`, `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/app/globals.css`) — monorepo compatibility and CSS patterns
- [html2canvas-pro on npm](https://www.npmjs.com/package/html2canvas-pro) — v1.6.7, modern CSS support verified 2026-02-17
- [jsPDF on npm](https://www.npmjs.com/package/jspdf) — v4.1.0, CVE-2025-68428 patch confirmed
- [next-themes on npm](https://www.npmjs.com/package/next-themes) — v0.4.6, React 19 peer dep confirmed
- [html2canvas oklch issue #3269](https://github.com/niklasvh/html2canvas/issues/3269) — oklch() color crash confirmed
- [html2canvas blurry text #576](https://github.com/niklasvh/html2canvas/issues/576), [#158](https://github.com/niklasvh/html2canvas/issues/158) — scale:2 fix
- [html2canvas font loading #1940](https://github.com/niklasvh/html2canvas/issues/1940) — document.fonts.ready pattern
- [Next.js static export docs](https://nextjs.org/docs/messages/api-routes-static-export) — output: "export" constraints
- [Turborepo Tailwind CSS guide](https://turborepo.dev/docs/guides/tools/tailwind) — per-app PostCSS config requirement

### Secondary (MEDIUM confidence)

- [Ink Narrates DeFi Pitch Deck Guide](https://www.inknarrates.com/post/defi-pitch-deck) — slide narrative structure and investor expectations
- [Storydoc pitch deck engagement data](https://www.storydoc.com/blog/best-pitch-deck-software) — interactive deck 2.3x sharing statistic
- [Nerdbot pitch deck 2026 rules](https://nerdbot.com/2025/11/07/what-are-the-5-new-rules-for-designing-a-pitch-deck-in-2026/) — live data and mobile-first trend
- [IMARC Group ammunition market](https://www.imarcgroup.com/ammunition-market) — $26.7B civilian ammunition market in 2025
- [Tailwind v4 PostCSS base path fix](https://medium.com/@preciousmbaekwe/fixing-tailwind-css-v4-component-styling-issues-in-turborepo-monorepos-the-postcss-base-path-1ceefbdc12b1) — per-app config validation

### Tertiary (LOW confidence)

- Market size estimates vary significantly ($24B-$80B) depending on scope (civilian vs. military). Use the $26-29B civilian estimate for pitch materials as the more defensible figure. Grand View's $80B estimate includes military; do not lead with it.

---

_Research completed: 2026-02-17_
_Ready for roadmap: yes_
