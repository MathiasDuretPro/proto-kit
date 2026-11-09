---
name: build-component
description: Phase 2. Use to build one component from its Figma variants, starting from the matching shadcn (Radix) primitive, restyled with semantic tokens only, with all states and a doc sheet.
---

# build-component

## Inputs
- Component name and Figma node (from `context/inventory.md`).
- Approved tokens (phase 1).

## Steps
1. Check `docs/components/`: does it already exist, or can an existing one
   take a new variant? Reuse before creating.
2. Branch `comp/<name>`.
3. Read the Figma component and every variant: `get_design_context`,
   `get_variable_defs`, `get_screenshot`.
4. Add the matching primitive: `npx shadcn@latest add <primitive>`. It lands in
   `src/components/<name>.tsx`. If shadcn added `lucide-react` or
   `tw-animate-css` to package.json, remove them: icons come from Figma (SVG in
   `src/assets/icons/`), motion from tokens.
5. Replace every shadcn class with semantic token utilities. Keep the Radix
   behavior, `data-slot` attributes and accessibility props.
6. Cover the states: default, hover, focus, pressed, disabled, loading, error,
   plus every Figma variant. Undrawn state: propose it, log it as
   "added-by-agent" in `context/decisions.md`.
7. Write `src/components/<name>.states.tsx` (`meta` + `states`, see
   `src/routes/registry.ts`). One state per Figma variant to compare.
8. Export each state's Figma capture at @2x to
   `refs/figma/<name>--<state>.png` (use an MCP tool that saves the PNG, or ask
   the designer to export it: Figma > Export > PNG 2x).
9. Run `npm run diff -- <name>--<state>` per state; follow skill visual-diff.
10. Write `docs/components/<name>.md`: when to use, when to use something else,
    default variant, one good and one bad example taken from the code,
    states covered.
11. `npm run check`, commit.

## Deliverable
Component, states file, references, doc sheet, visible in `/design-system`.

## Stop when
- All states under the visual-diff threshold and `npm run check` passes.
- After the whole component set: CHECKPOINT, showcase review.
