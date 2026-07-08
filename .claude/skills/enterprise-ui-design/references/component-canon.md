# The Enterprise Component Canon — Detailed Specs

Concrete build specs for the components that make up 90% of enterprise workflow UI. Written for an agent producing React/CSS/HTML. All spacing/type/color values assume the token system defined in SKILL.md.

## 1. Data tables

The most-used component in the product. Get these right and the app feels professional; get them wrong and nothing else saves it.

**Alignment**
- Text columns: left-aligned. Numbers users compare (amounts, counts, percentages): right-aligned with `tabular-nums`. Dates: left-aligned (they're read, not summed). Column headers align the same way as their data.
- Never center-align a data column. Centering breaks the vertical scan line.

**Density and rhythm**
- Row heights: 32px (compact — power-user triage), 40px (default), 48px (relaxed — occasional users, touch). Offer a density toggle on tables >50 rows if the audience is mixed; persist the choice.
- Cell padding: 8px vertical is implied by row height; 12–16px horizontal, 16–24px on the first/last cell.
- Header row: `--surface-sunken` background, 12px text, weight 600, secondary text color, optionally uppercase with letter-spacing. Sticky: `position: sticky; top: 0; z-index: 1;` — always, on any table that can scroll.
- Row separation: 1px `--border-default` bottom borders. Zebra striping only for very wide tables (>8 columns) where the eye loses the row — never both zebra *and* borders.
- Hover state on rows (`--surface-sunken` or 4–6% accent tint) whenever rows are clickable; plus `cursor: pointer` and the whole row as the click target (with real links inside for the primary cell so middle-click works).

**Content behavior**
- Truncate long text with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` + a tooltip (`title` or tooltip component) showing the full value. Never wrap IDs, emails, or names mid-token. Description-type columns may wrap to 2 lines max (`-webkit-line-clamp: 2`).
- Give columns explicit or min widths; don't let one long value reflow the whole table between pages.
- Wide tables scroll horizontally *inside their container* (`overflow-x: auto`), never the page. Sticky first column (the identifier) when horizontal scroll exists.
- Empty cell: an em dash `—` in disabled text color. Never blank (blank reads as loading or broken), never "N/A" repeated 200 times.

**Interaction**
- Sortable columns: entire header cell is the button, arrow indicator on the active sort only, aria-sort set. Default sort should be the most operationally useful (usually most recent first), not alphabetical.
- Filters live above the table: a search input (left) + filter dropdowns/chips; applied filters visible as removable chips with a "Clear all". Filter state belongs in the URL query string so views are shareable.
- Row selection: leading checkbox column (40–48px wide), header checkbox = select page with indeterminate state, and a "Select all N matching" affordance for cross-page selection. On selection, a **bulk actions bar** appears (replacing or overlaying the filter bar): "3 selected" + action buttons + deselect. Don't hide bulk actions in a dropdown if there are ≤4.
- Per-row actions: at most 1–2 inline icon buttons (with tooltips) + an overflow "⋯" menu, in the last column, right-aligned. Destructive items last in the menu, danger-colored, separated by a divider.
- Pagination over infinite scroll for anything operational: page sizes 25/50/100, showing "1–50 of 1,234". Infinite scroll is acceptable only for feeds nobody needs to cite.

## 2. Forms

**Structure**
- Labels **above** inputs. 13px, weight 500, primary text, 4–6px gap to the input. Left-of-input labels only in extremely dense settings panels with short labels — and then right-aligned to hug their input.
- Placeholder is an example ("e.g. acme-prod"), never the label, never instructions. It vanishes on type; anything the user must remember cannot live there.
- Helper text below the input, 12–13px secondary color. Error text replaces or follows it in danger color with an icon.
- One column. Two fields share a row only when semantically paired (first/last name, city/state/ZIP, min/max). Multi-column forms cause skipped fields.
- Group with section headings (h3, 24–32px top margin) after ~6+ fields. A form over ~12 fields with distinct phases is a wizard candidate (see §3).
- Mark the exceptional case, not both: if most fields are required, mark the optional ones "(optional)"; if most are optional, mark required with `*` (and `required`/`aria-required` in the markup).

**Field widths match expected content** — a full-width ZIP field tells the user you didn't think:
- ~80–120px: ZIP, 2-digit quantities, age
- ~160–220px: dates, phone, currency amounts
- ~280–400px: names, emails, titles
- Full width (within the 720px form column): URLs, descriptions, textareas
- Inputs: 32px (compact) / 36–40px (default) height, 8–12px horizontal padding, 4–6px radius, `--border-strong` border, visible focus ring.

**Validation timing**
- Validate a field on **blur**. After a field has erred once, re-validate on **change** so the error clears the moment it's fixed. Never validate on first keystroke (yelling at someone mid-word), never only on submit.
- On submit with errors: block, show a summary at top for long forms ("3 fields need attention", each a link), move focus to the first invalid field, and keep the user's data — a form that clears on error is a firing offense.
- Async checks (name availability): inline spinner in the field, result on settle, debounced ≥400ms.
- Submit area: primary button (verb-first) left-most in LTR flow at the form's bottom-left aligned to the fields, secondary "Cancel" beside it. Disable submit only during in-flight submission (with spinner + label like "Saving…"); a permanently disabled submit with no explanation is a dead end — prefer enabled + validation on click.
- Unsaved changes: warn on navigation (dialog or `beforeunload`) or autosave with a visible "Saved 2s ago" indicator. Pick one per surface.

## 3. Wizards, steppers, and workflow status

**When to use a wizard**: 3–7 steps, order matters or later steps depend on earlier answers, or the process has a formal review-then-commit shape. Otherwise use one page with sections — clicking "Next" five times to fill nine fields is ceremony, not guidance.

**Stepper spec**
- Horizontal stepper across the top for ≤5 short-named steps; vertical left rail for longer flows or steps with substeps.
- Each step: number-or-check circle (24px) + step name (always show names, not just dots — dots tell you nothing). States: completed (check, accent), current (filled, weight 600 label), upcoming (muted). Connector line between.
- Back is always allowed and never loses data. Forward jumping only to already-visited steps. Persist draft state (server-side for anything >2 steps) so abandonment isn't loss.
- Final step is a **review step**: read-only summary of all inputs grouped by step, each group with an "Edit" link jumping back. The commit button names the action ("Create environment"), not "Finish".
- Wizard footer: "Back" (secondary, left), "Next: <step name>" or the commit verb (primary, right). Keep footer sticky if steps scroll.

**Status badges and lifecycle**
- A badge = tinted background (semantic background shade), semantic text color, 12px weight-500 label, 2–4px vertical / 8px horizontal padding, 4–6px radius or full pill (one convention product-wide), optional leading 8px dot or icon.
- Map states to semantic colors *by meaning*: Draft = neutral gray, In progress/In review = blue/info, Waiting/Needs attention = amber, Active/Approved/Succeeded = green, Failed/Rejected = red, Archived/Cancelled = gray outline. Terminal states look calmer than active ones.
- The set of states shown in the UI must be exactly the state machine's states — no unlabeled in-betweens. If the backend has a state, the UI has a badge for it, and the filter dropdown lists it.
- Transitions render as the *actions available now* on the detail page header. An unavailable transition is either absent or disabled with a tooltip explaining why ("Cannot approve — missing security review"). Never a clickable button that errors after the fact.

## 4. Dashboards and cards

- A dashboard answers questions in priority order: KPIs/stat tiles first row, trends second, detail tables last. If a widget doesn't change a decision, cut it.
- Stat tile: label (12–13px secondary, on top), value (24–32px, weight 600, tabular-nums), delta ("+12% vs last week", semantic color + arrow icon — icon because color alone is insufficient). 16px internal padding, `--surface-raised`, 1px border, 8px radius.
- Grid: 12-column, 24px gutters. Tiles span 3 (four-up at 1280px); charts span 6–12. Equal heights per row. Every card: title (h3) top-left, time-range or overflow menu top-right, one shadow level max.
- Every widget handles its own loading (skeleton matching final shape), empty ("No deploys in this period"), and error ("Couldn't load — Retry") states independently; one failed widget never blanks the page.
- Global time-range picker top-right of the page when widgets share a range; per-card pickers only when ranges genuinely differ.
- Numbers: abbreviate past 4 digits (12.4k, 1.2M) with full value in a tooltip; keep units on the value ("324 ms", "$1,204").

## 5. States are first-class screens

Design all five for every data surface — the happy-path-with-data screen is one of five, not the whole job:

- **Loading:** skeleton placeholders that match the final layout (bars where table rows go, blocks where cards go), shimmering, no layout shift on arrival. Spinners only for small in-place actions (<24px, inside the button that triggered it). Anything under ~300ms shouldn't flash a loader at all — delay the skeleton's appearance 150–300ms.
- **Empty (first use):** icon or restrained illustration, one sentence of why it's empty, one sentence of value, primary action ("Create your first workflow"), optional docs link. Centered in the content area, max-width ~400px.
- **Empty (filtered/searched):** different message ("No results for 'atlas-prod'") + "Clear filters" action. Never show the first-use state here — it lies.
- **Error:** what failed + what to do: message, "Retry" button, error reference ID in small text for support. Partial failure degrades partially (per-widget, per-section), never full-page for one failed call.
- **Success/confirmation:** toast (bottom-left or top-right, consistent), 4–6s auto-dismiss, `aria-live="polite"`, includes the object ("Invite sent to maya@example.com") and an undo when applicable. Full-screen success pages only at the end of wizards, and they answer "what now" with next-step links.

## 6. Modal vs drawer vs inline vs page

Decision rules, in order:

1. **Confirmation or one-field interruption** (delete confirm, rename, quick reason) → **modal**, max-width 480px. Title states the question, body states consequences, buttons right-aligned: secondary "Cancel" then primary (danger-styled if destructive). Esc and backdrop-click close non-destructive modals; destructive confirms close only by explicit button. Focus trapped, initial focus on the least destructive control.
2. **Create/edit a small object (≤ ~8 fields)** while list context still matters → **modal at 560–640px** or drawer. If users will do it repeatedly in a row, prefer the drawer (list stays visible and scrollable).
3. **View or edit detail of a row without losing your place in the list** → **right-side drawer**, 480–640px wide (up to 50% viewport for rich content), full height, own scroll, sticky header with title + close, sticky footer with actions if editing. Put the object's canonical page one click away ("Open full page ↗") and reflect the drawer in the URL (`?selected=abc123`) so it's linkable.
4. **Anything with sections, tabs, its own sub-navigation, or that users bookmark/share** → **full page with its own URL**. Never a modal with tabs inside it — that's a page wearing a costume.
5. **Tiny scoped edits in a table** (status, assignee, a single value) → **inline edit** (click-to-edit cell or popover), commit on blur/Enter, Esc cancels, with a visible saved indicator.
6. Never stack modals. If a modal needs to open a modal, the first one should have been a drawer or page.
