---
name: build-screen
description: Phase 3 (and 5). Use to build a screen from Figma, block by block, reusing components and blocks, with assets optimized and visual-diff at each drawn breakpoint.
---

# build-screen

## Inputs
- Screen id and its Figma frames per breakpoint (`context/inventory.md`).
- Components from phase 2.

## Steps
1. Branch `screen/<id>` (parallel screens: one git worktree each).
2. Read the screen in the inventory and in Figma (`get_metadata`, then
   `get_design_context` on each section).
3. Split the screen into named blocks (`hero`, `price-summary`...). For each,
   check `docs/blocks/` and `docs/components/` first.
4. Export assets: raster images to `src/assets/raw/`, icons as SVG to
   `src/assets/icons/`, then `npm run assets` (WebP + AVIF, icons in
   `currentColor`). Never a PNG icon.
5. Build block by block on the grid tokens. Data comes from `src/mocks/*.json`.
6. Assemble `src/screens/<id>.tsx`, add the screen to `src/routes/manifest.ts`.
7. Export Figma captures at @2x: `refs/figma/<id>@<breakpoint>.png`.
8. `npm run diff -- <id>` at each drawn breakpoint; follow skill visual-diff.
9. Check intermediate widths (`proto.config.ts > checkWidths`: 320, 390, 1024,
   1280, 1920): nothing breaks, nothing overflows horizontally. Behavior
   between breakpoints not drawn: propose, log as "added-by-agent".
10. A block used twice or more moves to `src/blocks/<name>.tsx` with
    `<name>.states.tsx` and `docs/blocks/<name>.md`.
11. Phase 5 additions: navigation following Figma prototype links; varied
    mocks (long, short, missing values); loading, empty, error states; real
    interactions (forms, filters, selections, open/close).
12. Run skill review-screen, then commit.

## Deliverable
Screen reachable from `/_index`, blocks documented, diff under threshold at
each breakpoint, review report.

## Stop when
- CHECKPOINT per screen: show diffs and review report. After approval, the
  code is the source of truth for this screen.
