---
name: review-screen
description: Use after every build or change of a screen to check tokens, states, status texts, accessibility, visual-diff and intermediate widths, and report what conforms, what to fix, what to arbitrate.
---

# review-screen

## Inputs
- Screen id.

## Steps
1. `npm run lint:tokens`: no value outside tokens.
2. Every block of the screen has loading, empty and error states
   (in its `.states.tsx` or in the screen).
3. Status texts match the state actually shown (no "Saved" while loading).
4. `npm run a11y`: no serious or critical violation. Also tab through the
   screen: focus visible, logical order, everything reachable.
5. `npm run diff -- <id>` under threshold on the current reference.
6. Intermediate widths (`checkWidths`): load each with Playwright or the
   browser, check no horizontal scroll, no overlap, no cut text.
7. Status colors used only for states.

## Deliverable
Short report in three lists: **Conforms** · **To fix** (with file and line) ·
**To arbitrate** (needs the designer).

## Stop when
- Report delivered. Fix "To fix" items only if asked or obvious and in scope.
