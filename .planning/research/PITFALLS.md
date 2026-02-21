# Domain Pitfalls

**Domain:** Pitch deck app added to DeFi protocol Turborepo monorepo
**Researched:** 2026-02-17

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: html2canvas-pro Cannot Parse oklch() Colors from Tailwind v4

**What goes wrong:** html2canvas and its forks throw "Attempting to parse an unsupported color function 'oklch'" when rendering any element styled with Tailwind CSS v4 default colors. The existing `apps/web/app/globals.css` defines ALL shadcn semantic tokens in oklch format (e.g., `--background: oklch(0.13 0.01 280)`). If the pitch deck app reuses this theme system, PDF export will crash or render with missing colors on every slide.

**Why it happens:** Tailwind CSS v4 adopted oklch() as the default color space for superior perceptual uniformity. html2canvas-pro claims oklch() support but has reported spacing/rendering issues. The original html2canvas does not support oklch() at all. This is a fundamental incompatibility between the rendering library and the CSS color format.

**Consequences:** PDF export produces blank pages, black backgrounds where colors should be, or crashes entirely. This is a complete blocker for the core feature of the pitch deck app.

**Prevention:**

1. Define ALL colors in the pitch deck's `globals.css` using hex/rgba exclusively. The Ammo Exchange custom tokens (`--brass: #c6a44e`, `--bg-primary: #0a0a0f`, etc.) already use hex and are safe -- replicate this pattern for ALL colors.
2. Do NOT import shadcn's oklch-based variables. Create a standalone color system for the pitch deck that maps the same visual brass/dark theme using hex values.
3. Test PDF export on the very first slide before building additional content. Validate that html2canvas-pro renders correctly with your exact color definitions.
4. Fallback option: use `@csstools/postcss-oklab-function` PostCSS plugin to auto-generate sRGB fallbacks alongside oklch values, but this adds complexity -- hex-only is simpler.

**Detection:** PDF export produces blank/white/black areas where colors should be. Console errors mentioning "unsupported color function." Colors render as transparent or default black.

**Confidence:** HIGH -- verified via [niklasvh/html2canvas#3269](https://github.com/niklasvh/html2canvas/issues/3269), [html2canvas-pro npm](https://www.npmjs.com/package/html2canvas-pro), and direct inspection of the project's `globals.css` which uses oklch() for 20+ color variables.

**Phase impact:** Must be addressed in Phase 1 (foundation/setup). The CSS color strategy is foundational -- changing it after slides are built means rewriting every color reference.

---

### Pitfall 2: Blurry Text in PDF Output (Canvas DPI/Scale Mismatch)

**What goes wrong:** html2canvas renders DOM content as a bitmap, then jsPDF embeds that bitmap into the PDF. At default settings (scale: 1), all text is rendered at CSS pixel resolution, which is half or third the resolution of modern Retina displays. The resulting PDF has visibly blurry text -- unacceptable for a pitch deck meant to impress investors.

**Why it happens:** html2canvas captures at 1x CSS pixel density by default, ignoring `window.devicePixelRatio`. When this low-resolution bitmap is placed into a PDF at standard print dimensions (letter or A4), the effective DPI is roughly 72 instead of the 144-216 needed for sharp text.

**Consequences:** Text is fuzzy, gradients show banding, thin borders and lines disappear. The pitch deck looks unprofessional, undermining credibility with investors and partners.

**Prevention:**

1. Set `scale: 2` in html2canvas options. This renders at 2x resolution, producing sharp text on all displays.
2. When adding the canvas to jsPDF, use the page dimensions (not canvas dimensions) so the high-res image is scaled down to fit: `pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, slideWidth, slideHeight)`.
3. Do NOT use `scale: 3` or higher -- file sizes balloon (60MB+ reported) with diminishing quality returns. `scale: 2` is the sweet spot for text clarity vs file size.
4. For slides with photos/gradients, use JPEG at quality 0.92 instead of PNG to keep file sizes reasonable.

**Detection:** Export a PDF and zoom to 200%. If text appears pixelated compared to the on-screen version, the scale is too low.

**Confidence:** HIGH -- well-documented across [html2canvas#576](https://github.com/niklasvh/html2canvas/issues/576), [html2canvas#158](https://github.com/niklasvh/html2canvas/issues/158), and [html2pdf.js#85](https://github.com/eKoopmans/html2pdf.js/issues/85).

**Phase impact:** Must be configured in the PDF export implementation. The `scale: 2` setting is a one-line fix, but slide layout dimensions must be designed for a fixed resolution from the start (e.g., 1280x720 base, rendered at 2560x1440 for capture).

---

### Pitfall 3: On-Screen UI Artifacts Captured in PDF (Navigation Chrome, Scroll Offset)

**What goes wrong:** html2canvas captures exactly what exists in the DOM, including navigation arrows, slide progress indicators, keyboard shortcut hints, hover states, active button highlights, and page scroll offsets. The exported PDF contains visible "Next/Previous" buttons, slide counters, or has mysterious white space at the top from scroll position.

**Why it happens:** html2canvas clones the target DOM node and renders it as-is. It makes no distinction between "presentation content" and "interactive UI." Additionally, `window.scrollY` affects the capture viewport -- if the page is scrolled, the top of the captured image gets white space.

**Consequences:** PDFs look broken or amateur. Navigation buttons appear on every slide. White space at the top pushes content down. Any hover state active at capture time gets frozen into the image.

**Prevention:**

1. **Off-screen clone technique (recommended):** For PDF export, clone each slide's content DOM into a hidden container with fixed dimensions (1280x720), strip all navigation/interactive elements, then capture the clone. Position the clone at `position: fixed; left: -9999px; top: 0;` so it is in the document but off-screen.
2. Mark ALL navigation UI elements with the `data-html2canvas-ignore` attribute so they are automatically excluded from capture.
3. Set `scrollX: 0, scrollY: -window.scrollY` in html2canvas options to neutralize scroll offset.
4. Use the `onclone` callback to manipulate the cloned document: remove unwanted elements, force specific widths, reset animation states, disable hover effects.
5. Separate content components from navigation components architecturally: `<SlideContent>` (captured) vs `<SlideControls>` (ignored).

**Detection:** Export a PDF and inspect every slide for buttons, indicators, or white space that should not be there.

**Confidence:** HIGH -- the project context explicitly mentions P2 Markets encountered this exact issue and needed off-screen DOM duplication for clean PDF output.

**Phase impact:** Must be designed into the architecture from the start. The separation between "capturable content" and "interactive chrome" needs to be in the component hierarchy from Phase 1, not retrofitted later.

---

## Moderate Pitfalls

### Pitfall 4: Port Collision When Running Multiple Next.js Apps in Dev

**What goes wrong:** Running `pnpm dev` at the monorepo root triggers `turbo dev`, which starts ALL apps in parallel. Both `apps/web` (port 3000) and `apps/pitchdeck` will try to bind to port 3000 if the pitch deck has no explicit port configured. One fails silently or Next.js auto-picks a random port, causing confusion.

**Prevention:**

1. Set an explicit, unique port in `apps/pitchdeck/package.json`: `"dev": "next dev --port 3001"`.
2. Alternatively, during pitch deck development, use `turbo dev --filter=@ammo-exchange/pitchdeck` to run only that app.
3. Document the port assignment in the monorepo CLAUDE.md.

**Detection:** `turbo dev` output shows both apps starting but one has a different port than expected, or one shows "Port 3000 already in use."

**Confidence:** HIGH -- directly observable from `apps/web/package.json` which hardcodes `--port 3000`.

**Phase impact:** Phase 1 setup. Trivial one-line fix but confusing to debug if missed.

---

### Pitfall 5: Tailwind v4 Automatic Content Scanning Misses New App

**What goes wrong:** Tailwind CSS v4 uses automatic content detection, scanning from the CSS file's directory. A new app (`apps/pitchdeck`) without its own PostCSS and CSS configuration will have missing utility classes. Styles silently fail to apply, elements appear unstyled.

**Why it happens:** Tailwind v4 removed the explicit `content` configuration from `tailwind.config.js` (which no longer exists in v4). Instead, it scans for class usage based on the `@import "tailwindcss"` directive location. If the pitch deck app does not have its own `globals.css` with `@import "tailwindcss"` and its own `postcss.config.mjs`, Tailwind has nothing to scan.

**Prevention:**

1. Create `apps/pitchdeck/postcss.config.mjs` mirroring `apps/web/postcss.config.mjs`:
   ```js
   const config = {
     plugins: { "@tailwindcss/postcss": {} },
   };
   export default config;
   ```
2. Create `apps/pitchdeck/app/globals.css` with `@import "tailwindcss"` and the pitch deck's hex-only color tokens.
3. Verify Tailwind is generating classes by inspecting a styled element in DevTools.

**Detection:** Elements with Tailwind classes (e.g., `bg-brass`, `text-lg`) render unstyled. DevTools shows no matching CSS rules generated.

**Confidence:** HIGH -- documented in [Turborepo Tailwind guide](https://turborepo.dev/docs/guides/tools/tailwind) and [community PostCSS fix](https://medium.com/@preciousmbaekwe/fixing-tailwind-css-v4-component-styling-issues-in-turborepo-monorepos-the-postcss-base-path-1ceefbdc12b1).

**Phase impact:** Phase 1 setup. Must be correct before any styling work begins.

---

### Pitfall 6: CSS clamp() and Viewport Units Fail in html2canvas Off-Screen Rendering

**What goes wrong:** Fluid typography using `clamp()` (e.g., `font-size: clamp(1rem, 2.5vw, 2rem)`) renders incorrectly when html2canvas captures an off-screen clone. Viewport units (`vw`, `vh`) resolve relative to the actual browser viewport, not the off-screen container dimensions. Text sizes in the PDF differ significantly from on-screen appearance.

**Why it happens:** html2canvas re-parses CSS and resolves viewport-relative units against the browser window dimensions, not the cloned element's dimensions. An off-screen clone at `left: -9999px` still resolves `vw` against the full browser viewport. The `clamp()` function itself may not be fully parsed by html2canvas's CSS engine.

**Prevention:**

1. Use a fixed-dimension slide container (e.g., 1280x720px) with `transform: scale()` for responsive on-screen display. The content uses fixed `px` or `rem` values. Scaling is handled by the container, not the typography.
2. This means html2canvas captures the unscaled, fixed-dimension slides -- no viewport units to resolve incorrectly.
3. If clamp() is used for on-screen responsiveness, override with fixed values in the `onclone` callback before capture.

**Detection:** Text in the exported PDF is significantly larger or smaller than on-screen. Elements sized with `vw`/`vh` appear wrong proportionally.

**Confidence:** MEDIUM -- inferred from html2canvas's known limitations with viewport units and its CSS parser scope. The [html2canvas features page](https://html2canvas.hertzen.com/features/) lists supported properties but does not explicitly address clamp().

**Phase impact:** This determines the slide CSS architecture. Choose `transform: scale()` over fluid typography in Phase 1.

---

### Pitfall 7: Missing transpilePackages Breaks Shared Package Imports

**What goes wrong:** The pitch deck app imports from `@ammo-exchange/shared` (for types, constants, brand assets config) but Next.js fails to compile because the shared package ships raw TypeScript without a build step. Build errors with "Unexpected token" on TypeScript syntax in node_modules.

**Why it happens:** Next.js does not transpile workspace dependencies by default. The `@ammo-exchange/shared` package has `"type": "module"` and ships `.ts` files directly. Without `transpilePackages`, Next.js treats the import as pre-compiled JavaScript and chokes on TypeScript syntax.

**Prevention:**

1. Copy the relevant `next.config.ts` settings from `apps/web`:
   ```ts
   transpilePackages: ["@ammo-exchange/shared"],
   webpack: (config) => {
     config.resolve.extensionAlias = {
       ".js": [".ts", ".tsx", ".js"],
     };
     return config;
   },
   ```
2. The pitch deck likely does NOT need `@ammo-exchange/db` or `@ammo-exchange/contracts` -- omit those to keep dependencies minimal.
3. Do NOT add Prisma-related `serverExternalPackages` since the pitch deck has no database interaction.

**Detection:** `next build` or `next dev` fails immediately with syntax errors pointing to files in `node_modules/@ammo-exchange/shared`.

**Confidence:** HIGH -- directly observable from `apps/web/next.config.ts` which already solves this exact pattern.

**Phase impact:** Phase 1 setup. Copy from the existing app's config.

---

### Pitfall 8: Keyboard Navigation Conflicts with Browser Defaults

**What goes wrong:** Arrow keys, Space, Escape, and Enter -- the natural presentation shortcuts -- conflict with browser scrolling, form input behavior, and browser keyboard shortcuts. Space scrolls the page down. Arrow keys scroll. Escape may trigger browser-specific behavior. The presentation feels broken because keyboard input does not work as expected.

**Why it happens:** The browser has default handlers for these keys at the document level. Without explicit `event.preventDefault()`, browser behavior takes priority over custom keyboard handlers.

**Prevention:**

1. Use a focusable slide container with `tabIndex={0}` and an `onKeyDown` handler. Call `event.preventDefault()` for captured keys (ArrowLeft, ArrowRight, Space, Escape).
2. Only capture keys when the presentation container has focus. Do NOT add a global `window.addEventListener('keydown')` -- this creates conflicts with browser chrome and any overlaid modals (like the PDF export progress dialog).
3. Ensure Tab key is NOT captured -- it must still move focus out of the presentation for accessibility (WCAG "no keyboard traps" criterion).
4. Add a custom focus indicator (subtle outline or none with `outline: none` plus a visual cue) so the browser's default blue focus ring does not look jarring on a full-width slide container.

**Detection:** Press Space while viewing the deck -- if the page scrolls instead of advancing slides, keyboard capture is broken. Press Tab -- if focus gets trapped inside the presentation, accessibility is violated.

**Confidence:** HIGH -- standard web accessibility concern, documented in [freecodecamp keyboard accessibility guide](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/).

**Phase impact:** Phase 2 (slide system/navigation). Straightforward if addressed deliberately.

---

### Pitfall 9: CSS Animations Captured Mid-State in PDF

**What goes wrong:** Slides with entrance animations (fade-in, slide-up, scale) or CSS transitions are captured by html2canvas while the animation is in progress. The resulting PDF slide shows content at partial opacity, shifted position, or mid-transform. Elements that animate on scroll or on intersection may not be visible at all if they are in their initial (pre-animation) state.

**Prevention:**

1. In the off-screen clone or `onclone` callback, inject a style that disables all animations:
   ```css
   *,
   *::before,
   *::after {
     animation: none !important;
     transition: none !important;
     opacity: 1 !important;
   }
   ```
2. For elements using CSS `transform` for animation, reset transforms in the clone to their final state.
3. If using Intersection Observer for scroll-triggered animations, ensure the off-screen clone elements are in their "visible" state.

**Detection:** Exported PDF slides have partially transparent text, elements shifted from their expected positions, or missing content that should be visible.

**Confidence:** MEDIUM -- logical consequence of html2canvas's DOM cloning behavior. Not widely documented but follows directly from how the library works.

**Phase impact:** PDF export phase. A single CSS injection in the clone handler prevents the issue.

---

## Minor Pitfalls

### Pitfall 10: Font Loading Race Condition During PDF Capture

**What goes wrong:** When capturing slides for PDF export (especially using off-screen clones), custom fonts (Inter, JetBrains Mono loaded via `next/font`) may not be ready for the cloned elements. The PDF renders with system fallback fonts (Arial, Helvetica) instead of the project's chosen fonts, creating visual inconsistency.

**Prevention:**

1. Await `document.fonts.ready` before starting any html2canvas capture:
   ```ts
   await document.fonts.ready;
   const canvas = await html2canvas(element, options);
   ```
2. Ensure font-face declarations are global (loaded in the root layout), not dynamically injected per component.
3. Next.js `next/font` handles loading well, but the promise ensures fonts are fully rasterized before capture begins.

**Detection:** PDF shows sans-serif system fonts instead of Inter. Most visible in monospace code blocks where JetBrains Mono should appear.

**Confidence:** HIGH -- documented in [html2canvas#1940](https://github.com/niklasvh/html2canvas/issues/1940).

**Phase impact:** PDF export phase. One line of code (`await document.fonts.ready`) prevents it.

---

### Pitfall 11: Large PDF File Sizes from Multi-Slide High-Res Capture

**What goes wrong:** With `scale: 2` and 15+ slides, each slide generates a ~2-4MB PNG canvas. The full pitch deck PDF can reach 30-60MB -- too large to email (most providers cap at 25MB), attach to investor portals, or share casually.

**Prevention:**

1. Use JPEG format for slides with gradients, photos, or complex backgrounds: `canvas.toDataURL('image/jpeg', 0.85)`.
2. Use PNG only for slides with text on solid backgrounds where JPEG compression artifacts would be visible.
3. Target a maximum of 10-15MB for a 15-slide deck. Test with representative content early.
4. Consider offering "Standard" (scale: 1.5, JPEG) and "High Quality" (scale: 2, PNG) export options.

**Detection:** Check exported PDF file size. If over 20MB for 15 slides, optimization is needed.

**Confidence:** MEDIUM -- depends on slide content complexity. Text-heavy slides compress well; image-heavy slides do not.

**Phase impact:** PDF export phase. Worth testing with representative content early to calibrate quality settings.

---

### Pitfall 12: Static Export Breaks If Server Features Are Accidentally Added

**What goes wrong:** If the pitch deck uses `output: "export"` in next.config.ts for static deployment, accidentally adding a Route Handler (`app/api/`), Server Action (`"use server"`), or dynamic route without `generateStaticParams` will cause `next build` to fail with cryptic errors.

**Prevention:**

1. Decide upfront: the pitch deck is a purely static, client-side app. Set `output: "export"` and commit to it.
2. All logic (PDF generation, keyboard navigation, slide state) is client-side only.
3. Do not add `app/api/` directories. If analytics or tracking are needed later, use client-side services (PostHog, Plausible script).
4. If PDF generation later needs server-side rendering (e.g., using Puppeteer), remove `output: "export"` at that point and deploy to a server runtime.

**Detection:** `next build` fails with clear error messages about API routes or server features being incompatible with static export.

**Confidence:** HIGH -- documented in [Next.js static export docs](https://nextjs.org/docs/messages/api-routes-static-export).

**Phase impact:** Phase 1 decision. Choose the deployment model upfront.

---

### Pitfall 13: Turbo Build Dependency Graph Includes Unnecessary Tasks for Pitch Deck

**What goes wrong:** The existing `turbo.json` configures `build` to depend on `^build` and `^db:generate`. When building the pitch deck, Turbo runs Prisma generation and Foundry contract compilation even though the pitch deck has no database or contract dependencies. This slows builds and introduces failure modes (e.g., missing DATABASE_URL env var fails the build even though the pitch deck does not need it).

**Prevention:**

1. Ensure the pitch deck's `package.json` does NOT list `@ammo-exchange/db` or `@ammo-exchange/contracts` as dependencies. Turbo's `^build` and `^db:generate` only trigger for actual dependency graph edges.
2. For isolated pitch deck builds, use `turbo build --filter=@ammo-exchange/pitchdeck` which only builds the pitch deck and its actual dependencies.
3. If `@ammo-exchange/shared` depends on `db` or `contracts`, consider whether the pitch deck actually needs the shared package, or if it only needs a subset (e.g., brand constants). If it only needs types/constants, the dependency is lightweight.

**Detection:** `turbo build` for the pitch deck triggers Prisma generation or Foundry compilation. Build times are longer than expected for a simple static site.

**Confidence:** HIGH -- directly follows from the existing `turbo.json` configuration and Turbo's dependency resolution behavior.

**Phase impact:** Phase 1 setup. Keep the pitch deck's dependency surface minimal.

---

## Phase-Specific Warnings

| Phase Topic                      | Likely Pitfall                                                                                    | Mitigation                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Project setup (Phase 1)          | Port collision (#4), Tailwind scanning (#5), transpilePackages (#7), unnecessary build deps (#13) | Copy proven patterns from apps/web, set unique port, keep deps minimal                |
| CSS/Theme (Phase 1)              | oklch() color crash (#1), clamp() rendering (#6)                                                  | Hex-only colors in pitchdeck globals.css; use transform: scale() not fluid typography |
| Component architecture (Phase 1) | UI artifacts in PDF (#3)                                                                          | Separate SlideContent from SlideControls in component hierarchy from day one          |
| Slide system (Phase 2)           | Keyboard conflicts (#8)                                                                           | tabIndex container, preventDefault on captured keys, no keyboard traps                |
| PDF export (Phase 3)             | Blurry text (#2), animations mid-state (#9), font loading (#10), file size (#11)                  | scale: 2, onclone animation reset, document.fonts.ready, JPEG for image slides        |
| Deployment (Phase 3)             | Static export incompatibility (#12)                                                               | Commit to output: "export" upfront, all logic client-side                             |

---

## Sources

- [html2canvas oklch issue #3269](https://github.com/niklasvh/html2canvas/issues/3269) -- HIGH confidence
- [html2canvas-pro npm package](https://www.npmjs.com/package/html2canvas-pro) -- HIGH confidence
- [html2canvas blurry fix #576](https://github.com/niklasvh/html2canvas/issues/576) -- HIGH confidence
- [html2canvas blurry canvas #158](https://github.com/niklasvh/html2canvas/issues/158) -- HIGH confidence
- [html2pdf.js DPI/Scale #85](https://github.com/eKoopmans/html2pdf.js/issues/85) -- HIGH confidence
- [html2canvas font caching #1940](https://github.com/niklasvh/html2canvas/issues/1940) -- HIGH confidence
- [html2canvas off-screen rendering #117](https://github.com/niklasvh/html2canvas/issues/117) -- MEDIUM confidence
- [html2canvas features page](https://html2canvas.hertzen.com/features/) -- HIGH confidence
- [Turborepo Tailwind CSS guide](https://turborepo.dev/docs/guides/tools/tailwind) -- HIGH confidence
- [Tailwind v4 PostCSS base path fix](https://medium.com/@preciousmbaekwe/fixing-tailwind-css-v4-component-styling-issues-in-turborepo-monorepos-the-postcss-base-path-1ceefbdc12b1) -- MEDIUM confidence
- [Next.js static export docs](https://nextjs.org/docs/messages/api-routes-static-export) -- HIGH confidence
- [freecodecamp keyboard accessibility](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/) -- HIGH confidence
- [Joyfill: Creating PDFs from HTML+CSS](https://joyfill.io/blog/creating-pdfs-from-html-css-in-javascript-what-actually-works) -- MEDIUM confidence

---

_Pitfalls analysis for pitch deck milestone: 2026-02-17_
