# proto-kit

Turn Figma mockups into faithful, testable HTML prototypes with Claude Code.

The kit brings the method, the tooling and the guardrails. It contains no visual
choice: every color, size and font comes from the client's Figma file. A designer
drives, Claude Code builds, and the scripts check that nothing drifts.

## What you get

- **A 7-phase method** (inventory, tokens, components, screens, refinement,
  functional prototype, test prep), with a checkpoint where the agent stops and
  waits for your approval at each phase.
- **8 Claude Code skills** in `.claude/skills/` that tell the agent how to run
  each phase.
- **Guardrails**: a token linter (no hard-coded value), visual diff against Figma
  captures, accessibility audit with axe, all in `npm run check` and in CI.
- **A React + Vite + Tailwind v4 + shadcn/Radix app** with a `/design-system`
  showcase and a `/_index` list of screens.

## Quick start

Requirements: Node 22.22+, git, [Claude Code](https://claude.com/claude-code),
the Figma desktop app.

```bash
npm create proto-kit@latest my-client
```

One command: it asks for the client name and Figma URL, copies the template,
fills `context/client.md`, starts a git repo, installs everything and runs
`npm run doctor`. See [create/](create/README.md) for the options.

> Until `create-proto-kit` is published on npm, run it from a clone of this
> repo: `node create/index.js ../my-client`. The GitHub "Use this template"
> button also works, followed by `npm install`, `npx playwright install chromium`
> and `npm run doctor`.

Then enable the Figma MCP server (Figma desktop app > Dev Mode > MCP server),
start Claude Code in the project and ask:

> Run phase 0 (figma-inventory) on <Figma URL>

The Figma MCP server is declared in `.mcp.json`: Claude Code offers to enable it
the first time you open the project.

## Documentation

- [Getting started](docs/getting-started.md): your first project, step by step.
- [How it works](docs/how-it-works.md): the phases, tokens, source of truth and
  guardrails, explained.
- [CLAUDE.md](CLAUDE.md): the rules the agent follows on every task.
- [example/](example/README.md): a Button that proves the tooling works.
- [Kit brief](docs/kit-brief.md) (French): the original specification the kit
  was built from, kept for history.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the prototype |
| `npm run doctor` | Check the machine is ready (Node, Chromium, Figma MCP...) |
| `npm run selftest` | Prove the guardrails catch what they must |
| `npm run check` | Lint, token lint, typecheck, build, accessibility (same as CI) |
| `npm run diff -- <name> [breakpoint]` | Compare a screen or state to its Figma capture |
| `npm run diff:update -- <name> --confirm` | Replace the reference with the current render (after approval only) |
| `npm run assets` | Optimize images and icons |

## Contributing

Ideas, bugs and skill improvements are welcome: read
[CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
Security issues: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). Projects created with `create-proto-kit` keep this notice in
`LICENSE-proto-kit`; your client code stays yours.
