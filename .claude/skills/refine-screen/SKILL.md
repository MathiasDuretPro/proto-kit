---
name: refine-screen
description: Phase 4. Use when the designer gives feedback on a validated screen; translate each instruction into tokens and grid, add motion, run the perceived-quality checklist, log gaps with Figma.
---

# refine-screen

## Inputs
- A validated screen (the code is the source of truth).
- The designer's instructions.
- `context/decisions.md`.

## Steps
1. Restate each instruction in token and grid vocabulary ("gap from
   space-md to space-lg", "align title on column 3"). Confirm if ambiguous.
2. An instruction needs a value that has no token: propose a new token
   (name, value, role), wait for approval. Never inline it.
3. Implement. Animations and micro-interactions (entries, transitions,
   hover) use motion tokens only, and are disabled or reduced under
   `prefers-reduced-motion`.
4. Perceived-quality checklist:
   1. regular vertical rhythm, spacing from the scale;
   2. alignment on the grid, optical alignment of icons and text;
   3. clear typographic hierarchy, no widow or orphan visible in titles;
   4. sharp images, well framed, not distorted;
   5. consistent, polished hover and focus states;
   6. smooth transitions, no layout shift on load, fonts load without jump.
5. Log each deliberate gap with Figma in `context/decisions.md`
   (`gap-with-figma`).
6. Once approved: `npm run diff:update -- <id> <breakpoint> --confirm` so the
   validated render becomes the reference.
7. Run skill review-screen.

## Deliverable
Refined screen, decisions logged, references updated, review report.

## Stop when
- CHECKPOINT: final rendering of the screen approved by the designer.
