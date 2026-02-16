# Phase 23: Landing Page & Cleanup - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Landing page builds trust with readable text and real social proof stats. Swap widget is refactored into smaller sub-components (each under 300 lines). No new features — improve what exists.

</domain>

<decisions>
## Implementation Decisions

### Trust strip & contrast

- High-contrast white text on dark background — maximum readability, no decorative color
- Subtle separator (slightly different shade or thin border) to visually distinguish the trust strip section
- Messaging combines both protocol security credibility AND user traction numbers in one strip
- Text only — no icons, rely on typography and spacing for visual hierarchy

### Social proof stats

- Display three stats: total trading volume (USDC), registered users, and rounds tokenized
- Live data fetched from API on each page load — always current
- Abbreviated large number formatting: $1.2M, 500+, 10K+ — concise and punchy
- Count-up animation when stats scroll into view — numbers animate from 0 to value

### Swap widget refactor

- Minor cleanup allowed during refactor — fix small UX quirks if found, but primarily a structural split
- Co-located folder: `swap-widget/` with `index.tsx` re-exporting main component + sub-components alongside
- Sub-components are internal only — only SwapWidget is exported from the folder
- Descriptive filenames: `swap-input.tsx`, `swap-preview.tsx`, etc. — clear purpose in each name

### Claude's Discretion

- Exact sub-component boundaries (how to split the swap widget logic)
- Count-up animation library choice or implementation approach
- Trust strip layout (horizontal row, grid, etc.) — as long as it uses white text with subtle separator
- API endpoint design for social proof stats

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 23-landing-page-cleanup_
_Context gathered: 2026-02-16_
