---
name: enterprise-ui-design
description: Expert UI design guidance for professional web applications, written by a senior enterprise product designer. Provides opinionated, concrete defaults (spacing, type scale, color roles, component specs) and decision rules for building or reviewing web app UI — especially enterprise and workflow surfaces such as admin consoles, dashboards, data tables, multi-step wizards, forms, approval/review flows, and settings pages. Invoke whenever designing, implementing, or reviewing any web app UI in React/HTML/CSS, whenever choosing layout/typography/color/component patterns, or whenever a screen you just built needs a design-quality pass. Not needed for pure backend, CLI, or non-UI work.
---

# Enterprise UI Design

You are getting the working rules of a designer who has spent a decade shipping admin consoles, approval pipelines, and data-heavy dashboards used eight hours a day by people who did not choose the software. Apply these rules directly while writing React/CSS/HTML. They are defaults: use them without asking, and deviate only with a reason you could defend in a design crit.

Supporting references — load when relevant:
- `references/component-canon.md` — detailed specs for tables, forms, wizards, dashboards, states, and modal/drawer/inline decisions. Load when building any of those components.
- `references/review-checklist.md` — a pass/fail checklist. Run it against every screen you finish before declaring it done.

## 1. Philosophy: this is decision-support, not a brochure

Enterprise workflow UI has one job: help a person understand system state and act on it correctly, hundreds of times, without fatigue. Every instinct imported from consumer design must be re-examined:

- **Clarity beats cleverness.** No novel navigation, no mystery-meat icons, no scroll-driven animation. A user in their 400th session should never have to think about the chrome.
- **Density is calibrated to task frequency, not aesthetics.** Power users doing repetitive work (triage queues, data entry, reconciliation) want high density: more rows, tighter spacing, keyboard shortcuts. Occasional users (a manager approving expenses monthly) want low density: bigger targets, more explanation, fewer choices per screen. Decide who the screen is for *first*, then pick density. When both use the same screen, default to comfortable density and offer a density toggle on tables.
- **Whitespace is not the enemy; unstructured whitespace is.** Consumer instinct says "add air everywhere." Enterprise reality: a table showing 8 rows when the user needs to scan 200 is a worse design, not a calmer one. Spend whitespace to create grouping, not to look minimal.
- **Progressive disclosure over simplification.** Don't remove capability to look clean — stage it. Primary action visible; secondary actions in an overflow menu; advanced settings behind an "Advanced" disclosure; raw detail in a drawer. Nothing the user needs is more than one click deeper than the summary of it.
- **The system's state machine is the design.** Workflow software is a state machine with a face. If a record can be Draft → Submitted → In review → Approved/Rejected, the UI must make current state, who holds the ball, and available transitions legible at a glance. When state is ambiguous on screen, the design has failed regardless of how it looks.
- **Boring is a feature.** Reuse the same patterns everywhere. The third identical-looking form is a gift to the user, not a failure of imagination.

## 2. Layout and information architecture

### Page shell
- **Sidebar nav (left, 240–280px, collapsible to 64px icon rail)** when the product has 5+ top-level sections or deep hierarchies — the default for consoles and admin tools. Sidebar items: 32–40px tall, 13–14px text, icon + label, current item marked by background fill *and* a 2–3px accent bar (never color alone).
- **Top nav only** when there are ≤5 sections and content wants full width (dashboards, editors). Never both a top nav *and* a sidebar for primary navigation — top bar is then reserved for global search, environment/org switcher, notifications, user menu.
- **Breadcrumbs** on any page 2+ levels deep. Last crumb is the current page, not a link.
- Page header block: breadcrumb (12–13px) → page title (`h1`) + primary action button right-aligned on the same row → optional one-line description (14px, secondary text). Keep it under ~120px tall; the content is the point.

### Spacing: the 8px scale
All spacing comes from one scale: **4, 8, 12, 16, 24, 32, 48, 64**. Define them as tokens (`--space-1: 4px` … `--space-8: 64px`) and never hand-type `13px` or `18px` of margin.
- 4px: icon-to-label, inside compact chips
- 8px: between related controls, table cell padding (compact)
- 12–16px: internal card/panel padding, between form fields
- 24px: between form sections, card gutters, grid gap
- 32–48px: between major page regions
- Rule of thumb: space *between* groups ≥ 2× space *within* a group, or the grouping doesn't read.

### Widths
- Full-bleed (fill viewport minus nav) for tables, dashboards, kanban.
- **Max-width 720–840px for forms and reading content**, left-aligned within the content area, not centered in a sea of space. Text line length target: 60–75 characters (~65ch).
- Detail pages: main column + optional 320–360px metadata rail on the right at ≥1280px; rail stacks below on narrow screens.
- Breakpoints that matter for enterprise: 1024 (small laptop, must be fully usable), 1280 (default design target), 1536+ (let tables and dashboards breathe). Mobile is usually a read/approve subset, not parity — but never broken.

### Hierarchy and scanning
- Exactly **one** `h1`-level element and **one** primary (filled) button per screen. Everything else is visibly subordinate.
- Dense pages are scanned in an F-pattern: the most decision-relevant information goes top-left and in the first 1–2 columns of a table; actions go right. Don't bury the identifying column (name/ID) mid-table.
- Establish hierarchy with size + weight + color *of text* and spacing — not boxes inside boxes. If you're nesting a card in a card, flatten it: use a divider or a heading instead.
- Align to a grid. Left-align labels, values, and headings down the page so the eye travels one vertical line. Ragged left edges are the most common amateur tell.

## 3. Typography and color

### Type scale (define as tokens, use nothing else)
System stack — never load a webfont for a console unless brand demands it:
`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
Monospace for IDs, code, logs: `ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace;`

| Role | Size / line-height | Weight | Use |
|---|---|---|---|
| h1 / page title | 24px / 32px | 600 | One per page |
| h2 / section | 18px / 28px | 600 | Page sections, modal titles |
| h3 / subsection | 15–16px / 24px | 600 | Card titles, form groups |
| Body | **14px / 20–21px (1.5)** | 400 | Default UI text |
| Body strong | 14px | 500–600 | Emphasis, table header |
| Small / meta | 12–13px / 16–18px | 400 | Timestamps, captions, helper text |
| Overline/label | 11–12px / 16px | 600, +0.04em tracking, uppercase optional | Column headers, tiny labels |

- Body text is 14px in dense enterprise UI, 16px in reading-heavy or occasional-user surfaces. Never below 12px, ever.
- Numbers users compare (metrics, money): `font-variant-numeric: tabular-nums;` so digits align.
- Don't use font-weight 300, and don't use more than 3 weights total (400/500/600).

### Color as roles, not palette
Define semantic tokens; components reference roles, never raw hex:
- **Surfaces (3 levels):** `--surface-page` (app background, slightly off-white e.g. gray-50), `--surface-raised` (cards/panels, white), `--surface-sunken` (wells, input backgrounds, table header). Dark mode inverts *lightness relationships*, not hues: page darkest, raised surfaces lighter as they come "forward."
- **Borders (2 levels):** `--border-default` (visible structure, ~gray-200/300) and `--border-strong` (inputs, interactive edges). Prefer borders and background shifts over drop shadows for structure; reserve shadow for genuinely floating layers (menus, modals: one shadow token each, e.g. `0 4px 12px rgb(0 0 0 / 0.15)`).
- **Text (3 levels):** primary (near-black, ~gray-900), secondary (~gray-600), disabled/placeholder (~gray-400). Never pure #000 on pure #fff; slightly soften both.
- **One accent/brand color** doing interactive duty: primary buttons, links, focus rings, selected states. If everything is brand-colored, nothing is.
- **Semantic set, each with 3 shades (text-on-light, background-tint, border):** success (green), warning (amber — pair with icon, amber text fails contrast easily), danger (red), info (blue/neutral). Use them *only* for meaning. A red button means destructive, so decorative red is banned.

### Contrast and dark mode discipline
- WCAG AA minimums, non-negotiable: **4.5:1** for normal text, **3:1** for large text (≥18.66px bold or ≥24px) and for UI component boundaries/icons against adjacent colors.
- Dark mode is a second theme, not a filter: desaturate accents slightly (fully saturated colors vibrate on dark), replace shadows with lighter surface + subtle border, re-check every semantic color's contrast, and keep pure white text off pure black (use ~gray-100 on ~gray-900).
- Color is never the only signal — every status color travels with an icon or label (see §7).

## 4. The component canon (summary — full specs in `references/component-canon.md`)

- **Data tables** are the beating heart of enterprise software. Left-align text, right-align numbers, headers align with their column. Row heights: 32px compact / 40px default / 48px relaxed. Sticky header always; sticky first column when horizontally scrolling. Truncate with ellipsis + tooltip, never wrap IDs. Bulk actions appear in a bar when rows are selected. Pagination for >100 rows (25/50/100 page sizes) over infinite scroll — people need to reference "page 3."
- **Forms:** labels **above** inputs (13px, weight 500), never placeholder-as-label. Field width matches expected content (ZIP ≠ full width). Validate on blur, re-validate on change after first error, never on first keystroke. One column unless fields are genuinely paired (first/last name).
- **Wizards/steppers** for 3–7 step processes with dependencies; a long single page with sections for everything else. Always show step names, allow back navigation, persist state.
- **Status badges** render the state machine: color + label, tinted background, 12px text, radius 4–6px or full pill — consistently one or the other product-wide.
- **Empty, loading, error, and success states are designed screens**, not afterthoughts: skeletons that match final layout, empty states that teach the primary action, errors that say what happened and what to do.
- **Modal vs drawer vs inline:** modal for short interruptions and confirmations (max-width 480–640px); drawer (480–640px, right side) for viewing/editing detail without losing list context; inline/full page for anything long, multi-section, or needing a URL.

## 5. Workflow-specific patterns

- **Long-running processes:** never fake a blocking spinner for server-side work >10s. Kick off, show a status ("Export started — we'll notify you"), surface progress in a jobs/activity area, and make results retrievable later. Optimistic UI for cheap reversible actions; explicit pending state for expensive ones.
- **Statuses and transitions:** define the state machine first, then render it. Every entity list gets a status column (badge) and a status filter. Detail pages show current status prominently in the header plus *what can happen next* — available transitions as buttons, unavailable ones absent or disabled-with-tooltip-why. Show "who holds the ball": `In review — waiting on Finance` beats `In review`.
- **Review/approve flows:** the approver's screen must contain everything needed to decide — the diff/summary, requester, timestamps, prior comments — without navigating away. Approve and Reject are peer-visible but not peer-styled: Approve is primary, Reject is secondary/danger-outline, and Reject requires a reason (textarea, required). Batch approval only for homogeneous low-risk items.
- **Audit visibility:** every meaningful object gets an activity/history section (who, what, when, old → new value), newest first, timestamps absolute-on-hover (`3h ago` with `title="2026-07-08 14:32 UTC"`). Trust in workflow software is built here.
- **Destructive actions:** confirmation modal with the specific consequence ("This deletes project *Atlas* and its 14 environments. This cannot be undone."), danger-styled confirm button labeled with the verb ("Delete project", never "OK"/"Yes"). For high-blast-radius deletes, require typing the resource name. Prefer undo (5–10s toast window) over confirmation for reversible actions — undo respects the user; confirmation trains click-through.
- **Keyboard-first for repeat users:** visible focus everywhere, logical tab order, `Enter` submits, `Esc` closes topmost layer, `/` or `Cmd/Ctrl+K` focuses search/command palette. In triage queues, add j/k row navigation and single-key actions with a `?` shortcut cheatsheet. If a workflow is done 50× a day, it must be completable without the mouse.

## 6. Microcopy

- **Buttons are verb-first and specific:** "Create project", "Save changes", "Send invite" — never "Submit", "OK", "Yes", "Continue" (except wizard next-steps, where "Next: Review" is better still). Destructive buttons name the destruction: "Delete 3 users".
- **Errors = what happened + how to fix**, in that order, human tone: "Couldn't save — the project name is already in use. Choose a different name." Never blame the user, never bare codes ("Error 422"), never dead ends ("Something went wrong" alone). Field errors sit directly below the field, 12–13px, danger text + icon.
- **Empty states are honest and useful:** say why it's empty and what to do. First-use: "No API keys yet. Create a key to start making requests." + primary button. Filtered-to-empty: "No results match your filters." + "Clear filters" action. Never a lone sad illustration.
- **Sentence case everywhere** — titles, buttons, labels, menu items ("Add team member", not "Add Team Member"). Title Case Is Harder To Read And Reads As Marketing.
- **Cut jargon and filler:** "Delete" not "Remove from the system", "Save" not "Persist", no "please" in labels, no exclamation marks in a console. Confirmations state the result: "Invite sent to maya@example.com", not "Success!"
- Numbers and dates: locale-format, tabular, consistent. Relative time for recency ("2h ago"), absolute for records ("Jan 14, 2026"); when in doubt show both (relative text, absolute tooltip).

## 7. Accessibility is the floor

Not a feature, not a pass at the end — build it in or the screen isn't done:

- **Focus states:** every interactive element has a visible focus ring — `outline: 2px solid var(--accent); outline-offset: 2px;` (or `:focus-visible` box-shadow ring). Never `outline: none` without a replacement at 3:1 contrast.
- **Semantic HTML first:** `<button>` for actions, `<a>` for navigation, real `<table>` for tabular data, `<label for>` on every input (or `aria-label` when visually hidden), landmarks (`<nav>`, `<main>`, `<header>`), heading levels that don't skip. A `div onClick` is a bug.
- **Hit targets:** ≥44×44px touch, ≥32×32px pointer (24px icon buttons get padding to reach it). Adjacent targets ≥8px apart or visually separated.
- **Color never the only signal:** status = color + icon/label; required = asterisk + "required" semantics, not red alone; chart series get shape/pattern or direct labels.
- **Announce dynamic changes:** async results, toasts, and validation summaries in `aria-live="polite"` regions; move focus into opened modals and return it on close; trap focus inside modals.
- **Motion:** transitions 150–200ms ease-out for micro-interactions, nothing over 300ms, honor `prefers-reduced-motion` by disabling non-essential animation.
- Contrast per §3. Test the screen with keyboard only before calling it finished.

## 8. Before you ship: run the review

After building or materially changing any screen, run `references/review-checklist.md` against it. Minimum inline version — every answer must be yes:

1. One clear primary action; hierarchy readable in a 5-second squint test.
2. All spacing/type/colors from tokens on the defined scales.
3. Empty, loading, error, and overflow (long text, 0, 1, 10,000 items) states handled.
4. Fully keyboard-operable with visible focus; semantic elements; AA contrast.
5. Every status has icon/label alongside color; destructive paths confirmed or undoable.
6. Copy: verb-first buttons, sentence case, errors say how to recover.
7. Usable at 1024px wide without horizontal page scroll (tables scroll within their container).

If any item fails, fix it before presenting the work.
