# How it works

The ideas behind the kit, for designers and developers who join a project.
The binding rules for the agent live in [CLAUDE.md](../CLAUDE.md); this page
explains them.

## The problem it solves

An AI agent can turn a mockup into code fast, but left alone it drifts: it
rounds a spacing, picks a "close enough" grey, invents a hover state. Each
guess is small; together they make a prototype that no longer looks like the
design. The kit removes room for guessing and checks the result automatically.

## Three layers

1. **Steering**: `CLAUDE.md` holds the rules the agent reads before every task.
   The skills in `.claude/skills/` describe each phase step by step, so two
   people get the same result.
2. **Context**: `context/` holds what is specific to the client. `client.md`
   is filled by you, `inventory.md` by phase 0, `decisions.md` logs every gap
   with Figma, `rules-log.md` traces corrections that became rules.
3. **Guardrails**: scripts that fail when a rule is broken. They run locally
   and in CI.

## Tokens: a single source for every visual value

Every color, size, spacing, radius, shadow and duration is a CSS variable in
`src/tokens/`, in two levels:

- **Primitives** (`primitives.css`): the raw palette read from Figma,
  `--primitive-color-blue-500`. Never used by components.
- **Semantic tokens** (`semantic.css`): a role that points to a primitive,
  `--surface-default: var(--primitive-color-white)`. Components use only these.

`theme.css` maps semantic tokens to Tailwind utilities. When the designer
changes a role ("primary actions are darker"), one line changes and the whole
prototype follows.

`npm run lint:tokens` rejects any hard-coded value (`#3366ff`, `13px`,
`text-[13px]`) outside `src/tokens/`. A justified exception goes in
`proto.config.ts > lintAllow` with its reason.

## Figma first, then the code

Until a screen is validated, Figma is the reference: `npm run diff` captures
the screen with Playwright at the exact frame size and compares it pixel by
pixel to the export in `refs/figma/`. Under the threshold (5 % by default),
the screen has converged.

Once you approve a screen, the code becomes the reference. Refinements happen
in the code (motion, optical alignment, in-between breakpoints), each
deliberate gap with Figma is logged in `context/decisions.md`, and the
validated render replaces the Figma capture. Visual diff then guards against
regressions.

## The phases

| Phase | Output | Checkpoint |
|---|---|---|
| 0. Inventory | `context/inventory.md` | Scope and build order |
| 1. Foundations | Tokens, grid, fonts | Tokens table in `/design-system` |
| 2. Components | One component at a time, all states | Component showcase |
| 3. Screens | Screens built from blocks | Each screen |
| 4. Refinement | Motion, details, logged gaps | Final render |
| 5. Functional prototype | Navigation, mock data, loading/empty/error states | Clickable journeys |
| 6. Review and test prep | Review report, test plan | Ready to test |

Components start from a shadcn primitive (Radix underneath) for behavior and
accessibility, restyled with semantic tokens only. Blocks are sections reused
on several screens.

## Where to look in the app

- `/design-system`: tokens, components and blocks, each next to its Figma
  capture.
- `/render/<component>/<state>`: one state alone (used by visual diff).
- `/_index`: every screen of `src/routes/manifest.ts`.

## The learning loop

When you correct the agent twice on the same thing, the correction becomes a
rule at the bottom of `CLAUDE.md`, traced in `context/rules-log.md`: what the
agent did, what you wanted, why. The kit gets better with every project.
