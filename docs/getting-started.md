# Getting started

Your first client project, from an empty template to a first validated screen.
Count half a day for setup and phases 0 to 1 on a small Figma file.

## 1. Set up the machine (once)

- Node 22.22 or later (`nvm install` reads `.nvmrc`).
- [Claude Code](https://claude.com/claude-code): CLI or desktop app.
- The Figma desktop app, with a seat that gives access to Dev Mode.

## 2. Create the client repo

On GitHub, click **Use this template** on the proto-kit repo and create a
private repo for the client. Then:

```bash
git clone <your-new-repo>
cd <your-new-repo>
npm install
npx playwright install chromium
```

## 3. Check everything

```bash
npm run doctor
```

`doctor` lists what is ready and how to fix the rest. Errors block the tooling;
warnings only matter for some phases (the Figma MCP from phase 0, the fonts from
phase 1).

```bash
npm run selftest
```

`selftest` proves the guardrails work on a demo Button in `example/`: the token
linter rejects hard-coded values, visual diff catches a wrong render, axe passes.

## 4. Connect Figma

1. Open the Figma desktop app and the client file.
2. Switch to **Dev Mode** and enable **MCP server** in the inspect panel.
3. Start Claude Code in the repo. It reads `.mcp.json` and offers to enable the
   `figma-desktop` server: accept.

Run `npm run doctor` again: the Figma line should be `ok`.

## 5. Describe the client

Fill `context/client.md`: Figma URL, pages in scope, breakpoints, fonts and
licences, accessibility level. Leave `TODO` where you do not know: the agent
asks instead of guessing.

## 6. Run the phases

Talk to Claude Code in plain language. At the end of each phase it stops,
summarizes, lists its questions and waits for your approval.

| You say | What happens | You check |
|---|---|---|
| "Run phase 0 on <Figma URL>" | `context/inventory.md`: screens, breakpoints, journeys, components, grey areas, build order | Scope and order |
| "Phase 1: extract the tokens" | `src/tokens/`, grid, fonts in `src/assets/fonts/` | `/design-system` tokens table |
| "Build the Button component" | Component, all states, doc sheet, visual diff | `/design-system` next to the Figma capture |
| "Build the home screen" | Screen built block by block, diff at each breakpoint | `/_index`, then the screen |
| "On home, align the title on column 3" | Refinement in tokens and grid, gap logged | The screen |

Keep `npm run dev` open to watch the work live.

## 7. Before each merge

```bash
npm run check
```

The same check runs in CI on every pull request. Work on one branch per
component or screen (`comp/button`, `screen/home`).

## When something goes wrong

- **The agent invents a value**: tell it, it should ask instead. If it happens
  twice, it becomes a rule in `CLAUDE.md` (see `context/rules-log.md`).
- **Visual diff never converges**: after 3 tries the agent stops and shows the
  diff image. Browser text rendering never matches Figma pixel for pixel; the
  threshold is in `proto.config.ts`.
- **A state is not drawn in Figma** (loading, empty, error): the agent proposes
  one and logs it as "added by the agent" in `context/decisions.md`.

Next: [How it works](how-it-works.md).
