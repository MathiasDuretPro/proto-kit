---
name: figma-inventory
description: Phase 0. Use at the start of a project to map a Figma file (screens, breakpoints, journeys, components, assets, fonts, grey areas) into context/inventory.md and propose a build order.
---

# figma-inventory

## Inputs
- Figma file URL (from `context/client.md` or the designer).
- Figma MCP connected (desktop app: Dev Mode > MCP server; or the remote server).

## Figma MCP basics (all skills)
- Target a node with its URL: `node-id=12-34` in the URL is node `12:34`.
  With the desktop server you can also work on the current selection in the app.
- `get_metadata`: tree of pages / frames / layers with ids and sizes. Cheap: start here.
- `get_design_context`: code-like description of a node (layout, styles, variables, assets).
- `get_variable_defs`: variables and styles used by a node.
- `get_screenshot`: image of a node, to look at it.
- Large file: call `get_metadata` page by page, never the whole file at once.

## Steps
1. Read `context/client.md`. Missing Figma URL or scope: stop and ask.
2. `get_metadata` on each page in scope. List top-level frames.
3. Group frames into screens. A screen drawn at several widths = one screen,
   several breakpoints. Name screens in kebab-case (`checkout-payment`).
4. Record each breakpoint width actually drawn. Compare with
   `context/client.md`; note any difference.
5. Journeys: list prototype links between frames (from `get_design_context`
   or the designer). Without prototype links, ask for the main journeys.
6. Components: list Figma components and their variants, with how many
   screens use each (count instances in the metadata).
7. Assets: images, illustrations, icons to export, with the node id.
8. Fonts: families and weights used (`get_variable_defs` / design context).
9. Grey areas: screen without a mobile version, undrawn state (loading,
   empty, error), inconsistency between screens (same element, different
   values), values not bound to a variable.
10. Write `context/inventory.md` with the sections listed in that file.
11. Propose a build order: most reused components first, then the most
    representative screen.

## Deliverable
`context/inventory.md` filled: screens x breakpoints table (with node links),
journeys, components and variants with usage count, assets, fonts, open
questions, build order.

## Stop when
- The inventory is written. CHECKPOINT: present scope, build order and open
  questions; wait for approval before phase 1.
- Stop earlier and ask if the Figma file is inaccessible or the scope is unclear.
