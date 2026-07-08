# Design Review Checklist

Run this against any screen you have just built or materially changed. Every item is pass/fail — no "mostly". Fix failures before presenting the work; if you intentionally deviate, say so and why.

## Hierarchy and layout
- [ ] Squint test: the page's single most important element (title + primary action) is identifiable in 5 seconds at a blur.
- [ ] Exactly one `h1` and at most one primary (filled) button visible per screen.
- [ ] All spacing values come from the 4/8/12/16/24/32/48/64 scale; no hand-typed odd margins.
- [ ] Space between groups ≥ 2× space within groups — grouping is legible without borders doing all the work.
- [ ] Labels, values, and headings share left-alignment lines; no ragged or accidental indents.
- [ ] Forms/reading content constrained to ~720–840px; tables/dashboards use full width.
- [ ] No card-inside-card nesting; structure comes from spacing, dividers, and headings.

## Type and color
- [ ] Every text size is from the scale (24/18/15–16/14/12–13); nothing under 12px.
- [ ] Body text has ~1.5 line-height; comparative numbers use tabular-nums.
- [ ] Colors referenced via role tokens (surface/border/text/semantic), no ad-hoc hex in components.
- [ ] Contrast: 4.5:1 normal text, 3:1 large text and UI boundaries — checked, not assumed (amber and disabled text are the usual offenders).
- [ ] Semantic colors used only for meaning; primary accent not diluted across decoration.
- [ ] If the app has dark mode: this screen re-checked in it (surfaces lighten forward, shadows replaced, contrast re-verified).

## States and data extremes
- [ ] Loading state: skeleton matches final layout; no layout shift; no loader flash for <300ms responses.
- [ ] Empty states: first-use (teaches the primary action) and filtered-to-empty (offers clear-filters) both exist and differ.
- [ ] Error state: says what happened + how to recover, with retry; partial failures degrade per-section.
- [ ] Overflow tested: a 200-character name, 0 items, 1 item, 10,000 items, a huge number — nothing breaks layout; truncation has tooltips.
- [ ] Long-running actions show pending state; buttons show in-flight spinners and prevent double-submit.

## Interaction and accessibility
- [ ] Entire screen operable by keyboard alone, in a sensible tab order; Esc closes the top layer; Enter submits.
- [ ] Every interactive element has a visible `:focus-visible` ring at ≥3:1 contrast.
- [ ] Semantic elements throughout: `<button>`/`<a>`/`<table>`/`<label for>`/landmarks; zero clickable `div`s; heading levels don't skip.
- [ ] Hit targets ≥44px touch / ≥32px pointer, ≥8px apart.
- [ ] No status, error, or requirement communicated by color alone — icon or text accompanies it.
- [ ] Modals/drawers trap focus, restore it on close; dynamic updates announced via `aria-live`.
- [ ] Animations ≤300ms and gated on `prefers-reduced-motion`.

## Workflow integrity
- [ ] Every possible backend state has a visible, labeled representation (badge/filter); "who holds the ball" is legible.
- [ ] Available actions match the state machine; unavailable transitions are absent or disabled with a why-tooltip.
- [ ] Destructive actions: named-verb confirm with specific consequences, or an undo window — never a bare "OK".
- [ ] Changes are auditable where it matters: who/what/when visible or one click away.
- [ ] Filter/selection/detail state that users would share lives in the URL.

## Copy
- [ ] Buttons are verb-first and specific ("Create project", not "Submit"/"OK").
- [ ] Sentence case everywhere; no exclamation marks; no unexplained jargon or codes.
- [ ] Error copy: what happened + how to fix, near the field it concerns.
- [ ] Empty-state copy is honest about why and names the next action.
- [ ] Dates/numbers formatted consistently; relative times carry absolute tooltips.

## Responsiveness
- [ ] Fully usable at 1024px wide; designed target 1280px; nothing wasted at 1536px+.
- [ ] No page-level horizontal scroll at any width — wide tables scroll within their own container with a sticky identifier column.
- [ ] Side rails/columns stack sensibly below 1280px; nav collapses without hiding the current location.
