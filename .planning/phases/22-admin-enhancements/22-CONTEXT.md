# Phase 22: Admin Enhancements - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin order management improvements: reject/refund actions for mint and redeem orders, dashboard alert indicators for pending orders, clickable order detail views with full information, and table search/filter/pagination. All within the existing admin dashboard structure.

</domain>

<decisions>
## Implementation Decisions

### Reject/Refund UX
- Reject/cancel buttons appear **inline in the table row** (visible directly, no dropdown menu)
- Admin **must provide a reason** when rejecting/canceling (required field, not optional)
- Confirmation uses **AlertDialog** pattern (modal with warning text, reason input, confirm/cancel buttons — matches Phase 20 wallet disconnect pattern)
- After successful action, **row visually transitions** to rejected/canceled state inline (no toast — status change is the feedback)

### Dashboard Alerts
- Pending order indicators use **highlighted stat card** style (border/glow color change when pending orders exist, not a numeric badge overlay)
- **Pending orders only** trigger alert state (no stale/age-based thresholds)
- Quick action via **clickable stat cards** — clicking a highlighted pending card navigates to the filtered order table
- **Separate cards** for pending mints and pending redeems (distinct counts, individual click-through to respective filtered views)

### Order Detail View
- Full order details presented in a **slide-out drawer** from the right (table stays visible behind, quick dismiss)
- **Order status + type** is the most prominent info at top of drawer (big status badge — Pending/Fulfilled/Rejected — and mint/redeem type)
- Drawer **includes reject/cancel action buttons** in footer (admin can review details then act without returning to table)
- Order history displayed as **vertical timeline** with dots/lines showing progression (created → pending → fulfilled/rejected)

### Claude's Discretion
- Table search/filter/pagination design (not discussed — Claude has full flexibility on search behavior, filter UI components, pagination style)
- Exact drawer width and responsive behavior
- Specific timeline dot/line styling
- Loading and error states within the drawer

</decisions>

<specifics>
## Specific Ideas

- AlertDialog confirmation pattern should be consistent with Phase 20's wallet disconnect dialog (same component, similar warning tone)
- Row status transition should feel immediate — the row updates visually without needing a full table refresh
- Stat card highlighting should use existing theme variables (brass/accent border or glow — not a new color)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-admin-enhancements*
*Context gathered: 2026-02-16*
