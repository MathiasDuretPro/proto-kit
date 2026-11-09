# proto-kit

Turn Figma mockups into faithful, testable HTML prototypes. The kit brings method, tooling and guardrails; every visual value comes from the client's Figma.

1. Create a repo from this template (GitHub "Use this template"), clone it, `npm install`, `npx playwright install chromium`.
2. Check the tooling: `npm run selftest` then `npm run check`.
3. Fill `context/client.md` (Figma URL, breakpoints, fonts, accessibility level).
4. Open the Figma desktop app, enable Dev Mode > MCP server, connect it to Claude Code: `claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp`.
5. Start Claude Code in the repo and ask: "Run phase 0 (figma-inventory) on <Figma URL>".
6. Follow the 7 phases in `CLAUDE.md`; the agent stops for your approval at each checkpoint.
7. Watch the work in `npm run dev`: `/design-system` (components next to Figma) and `/_index` (screens).
8. Read `BOOTSTRAP.md` for the reasons behind the kit.
