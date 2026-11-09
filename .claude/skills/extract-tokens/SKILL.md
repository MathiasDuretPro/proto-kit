---
name: extract-tokens
description: Phase 1. Use to turn Figma variables and styles into src/tokens (primitives, semantic tokens, Tailwind mapping), the grid, motion values and local fonts.
---

# extract-tokens

## Inputs
- Approved `context/inventory.md`.
- Figma nodes representative of the system (a styles page, key screens).

## Steps
1. `get_variable_defs` on the representative nodes. Collect colors,
   typography, spacing, radii, shadows, and modes if any.
2. Primitives in `src/tokens/primitives.css`, prefix `--primitive-`, named after
   Figma (`--primitive-color-blue-500`). Keep Figma's values exactly.
3. No Figma variables? Read the values actually used (`get_design_context` on
   several screens), group them by frequency, propose a scale, and list
   isolated values (used once or twice) separately. Undecided = `TODO`.
4. Semantic tokens in `src/tokens/semantic.css`, by role: surface, text,
   border, action, status, layout, radius, elevation, typography, motion,
   z-index. Each points to a primitive. Prefer Figma's semantic variables
   when they exist.
5. Grid: columns, gutter, margin, max width per breakpoint, as semantic
   tokens (`--grid-columns`, `--grid-gutter`, ...). Source: Figma layout grids.
6. Motion: durations and easings from Figma prototype settings (smart animate,
   transitions). None found: `TODO`, ask.
7. Map semantic tokens in `src/tokens/theme.css` under `@theme` (keep the
   `--*: initial` reset). Breakpoints use the widths from `context/client.md`.
8. Add every new utility name to `tokenScales` in `src/lib/utils.ts`.
9. Copy breakpoints to `proto.config.ts > breakpoints`.
10. Fonts: get the exact files (woff2 preferred) from the designer or brand
    kit into `src/assets/fonts/`, declare `@font-face` in `semantic.css` with
    `font-display: swap`, preload the main weight in `index.html`.
    Files unavailable or licence unclear: STOP and ask. Never substitute
    silently.
11. Log TODOs and isolated values in `context/decisions.md`.
12. Run `npm run check`.

## Deliverable
Filled token files, grid and motion tokens, local fonts, updated
`proto.config.ts`, decisions logged. `/design-system` lists the tokens.

## Stop when
- `npm run check` passes. CHECKPOINT: present tokens, grid, fonts, TODO list.
- Stop and ask if fonts are missing or a value cannot be read.
