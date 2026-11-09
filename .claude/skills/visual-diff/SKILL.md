---
name: visual-diff
description: Use to measure how close a component state or screen is to its Figma capture, and to iterate until it converges without hacks.
---

# visual-diff

## Inputs
- Target: screen id (`checkout`) or `<component>--<state>` (`button--disabled`).
- Reference in `refs/figma/`: `<screen>@<breakpoint>.png` or `<component>--<state>.png`,
  exported at @2x (`proto.config.ts > exportScale`).

## Steps
1. `npm run diff -- <target> [breakpoint]`. The viewport equals the frame size
   (reference size / 2). Screens: full page. Components: the element alone.
2. Read the result: share of different pixels vs threshold (default 5 %,
   `proto.config.ts > diffThreshold`), and any size mismatch.
3. Open `reports/diff/<name>.diff.png` (red = different) next to the
   reference and `<name>.actual.png`.
4. Fix the cause in order: wrong token, wrong layout or grid, wrong font or
   weight, missing asset, height mismatch (content or spacing).
5. Re-run. Maximum 3 iterations.
6. After 3 iterations above the threshold: stop, show the diff image, explain
   each remaining gap (e.g. browser text rendering vs Figma) and ask.
7. Never force convergence with hacks: no negative margin, no arbitrary
   value, no fixed height to match a capture.
8. After validation only: `npm run diff:update -- <target> [breakpoint] --confirm`
   replaces the reference by the current render. Log it in
   `context/decisions.md` (type `reference-updated`).

## Deliverable
PASS line per reference, or a short explanation of remaining gaps with the diff image.

## Stop when
- Under threshold, or 3 iterations reached (then ask).
