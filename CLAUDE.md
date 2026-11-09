# CLAUDE.md — steering layer

Read this file before every task. Details live in `.claude/skills/`; this file
holds what must never be forgotten.

## 1. Role
Build a prototype that is faithful to the Figma file, beautiful, clean and ready
for user testing. Never invent a visual value: read it in Figma, in
`src/tokens/`, or ask.

## 2. Source of truth
Until a screen is validated (end of phase 3), Figma is the reference and
visual-diff measures convergence. After validation, the code becomes the source
of truth: refinements happen in the code and every deliberate gap with Figma is
logged in `context/decisions.md`. visual-diff then becomes a non-regression
check against the new reference.

## 3. Phases and checkpoints
At every checkpoint: stop, summarize what was done, list open questions, wait
for the designer's approval.

| Phase | Skill | Checkpoint |
|---|---|---|
| 0. Inventory | figma-inventory | Scope and build order |
| 1. Foundations | extract-tokens | Tokens, grid, fonts |
| 2. Components | build-component (one at a time) | Component showcase in /design-system |
| 3. Screens | build-screen, review-screen | Each screen; after approval the code is the source of truth |
| 4. Refinement | refine-screen, review-screen | Final rendering of each screen |
| 5. Functional prototype | build-screen (states, mocks, navigation) | End-to-end clickable journeys |
| 6. Review and test prep | review-screen, prepare-test | Ready to test |

## 4. Rules
- **Every visual value comes from a token.**
  Why: fidelity and consistency depend on a single source.
- **Components use semantic tokens only, never primitives (`--primitive-*`).**
  Why: a value is chosen by its role, not by its look.
- **No Tailwind arbitrary value (`text-[13px]`, `bg-[#...]`), no inline style.**
  Why: they are invented tokens that make the product drift.
- **Layout follows the project grid (columns, gutters, margins).**
  Why: the grid is the designer's expertise, encoded; it allows precise
  instructions such as "align on column 3".
- **A value missing from Figma or marked TODO: ask, do not guess.**
  Why: reasonable guesses end up in the product.
- **Reuse an existing component or block before creating one.**
  Why: a duplicated component diverges and breaks consistency.
- **Document and use only what exists in the code.**
  Why: the agent tries to use whatever is described, even if it does not exist.
- **Any state or behavior not drawn in Figma (loading, empty, error, responsive
  between two breakpoints) is proposed and logged as "added by the agent" in
  `context/decisions.md`.**
  Why: the designer must tell Figma apart from interpretation.
- **Status colors (success, warning, error) only signal a state.**
  Why: used as decoration, they lose their meaning.
- **Accessibility: visible focus, full keyboard navigation, labels, AA
  contrast, `prefers-reduced-motion` respected.**
  Why: non-negotiable, and invisible on a screenshot.
- **Fonts: use the brand's exact files; never a substitute without saying so.**
  Why: typography is half of perceived fidelity.

`npm run lint:tokens` and `npm run lint` enforce what can be automated.
An exception goes in `proto.config.ts > lintAllow` with its reason, never silently.

## 5. Anti-patterns
Clickable `div` · re-implemented primitive (use shadcn/Radix) · duplicated
component · unoptimized image · PNG icon · arbitrary z-index · negative margin
to fix an alignment · `!important` · icon library not coming from Figma ·
mixing Radix and Base UI.

## 6. Context routing
| Task | Read first | Skill |
|---|---|---|
| Start a project | `context/client.md` | figma-inventory |
| Tokens, grid, fonts | `context/inventory.md`, `src/tokens/` | extract-tokens |
| Build a component | `src/tokens/`, `docs/components/` | build-component |
| Build a screen | `context/inventory.md`, `docs/blocks/`, `docs/components/` | build-screen |
| Compare with Figma | `refs/figma/`, `proto.config.ts` | visual-diff |
| Designer feedback on a validated screen | `context/decisions.md` | refine-screen |
| Check a screen | `context/decisions.md` | review-screen |
| Prepare user testing | `context/inventory.md` (journeys) | prepare-test |
| Any correction from the designer | `context/rules-log.md` | — (see §8) |

## 7. Project map
- `src/tokens/` primitives, semantic tokens, Tailwind mapping (`theme.css`).
- `src/components/` restyled shadcn primitives, each with `<name>.states.tsx`.
- `src/blocks/` reusable sections, same pattern. `src/screens/` one file per screen.
- `src/routes/manifest.ts` the list of screens (router, a11y, visual-diff).
- `src/mocks/` JSON data. `refs/figma/` reference captures, exported at @2x:
  `<screen>@<breakpoint>.png`, `<component>--<state>.png`.
- `/design-system` showcase, `/render/<name>/<state>` one state alone,
  `/_index` list of screens.
- Scripts: `npm run dev | diff | diff:update | lint:tokens | a11y | check | selftest | assets`.

## 8. Git
- One branch per component or screen: `comp/<name>`, `screen/<name>`.
- Several screens in parallel: one git worktree per screen.
- Small, frequent commits. One PR per coherent batch (3 to 5 commits).
- CI (`npm run check`) must pass before any merge.

## 9. Learning loop
Every correction the designer makes twice becomes a rule in this file, traced
in `context/rules-log.md`: what the agent did, what was wanted, why.

## Project rules (added during the project)
<!-- Rules from context/rules-log.md land here. -->
