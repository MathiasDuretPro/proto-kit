# Contributing to proto-kit

Thanks for helping. This file is about improving **the kit itself**. To use the
kit on a client project, read [docs/getting-started.md](docs/getting-started.md).

## Principles

These keep the kit useful for every client. A change that breaks one will be
asked to change.

1. **The kit makes no visual choice.** No color, font, spacing or "rounded
   buttons" rule: appearance always comes from the client's Figma.
2. **No client data, ever.** No client name, Figma URL, capture, font file or
   mock data from a real project. Generic examples only (see `example/`).
3. **Every rule has its reason.** A rule in `CLAUDE.md` or a skill is one
   sentence, then why. Rules without reasons get ignored, by people and agents.
4. **Document only what exists.** The agent tries to use whatever is described.
5. **No new dependency without an issue first.** Each one adds install time and
   maintenance for every project.

## Set up

```bash
git clone https://github.com/MathiasDuretPro/proto-kit.git
cd proto-kit
npm install
npx playwright install chromium
npm run doctor
npm run selftest
```

## Make a change

1. Open an issue first for anything bigger than a typo, so we agree on the
   approach before you spend time on it.
2. Create a branch from `main`: `kit/<topic>` (for example `kit/doctor-fonts`).
3. Keep commits small, with a [conventional](https://www.conventionalcommits.org/)
   prefix: `feat:`, `fix:`, `docs:`, `chore:`.
4. Before pushing, run:

   ```bash
   npm run check
   npm run selftest
   ```

   CI runs the same commands on every pull request; it must pass to merge.
5. Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md).
6. Open a pull request and fill in the template.

## What lives where

| You want to change | Edit |
|---|---|
| A rule the agent follows on every task | `CLAUDE.md` (keep it short) |
| How a phase is run | `.claude/skills/<skill>/SKILL.md` |
| A guardrail (token lint, diff, a11y, doctor) | `scripts/` + a case in `scripts/selftest.ts` |
| The one-command installer | `create/index.js` |
| Explanations for people | `docs/` and `README.md` |

A new guardrail needs a selftest case that proves it catches what it must,
using `example/` or `example/fixtures/`.

## Changing a skill

Skills are instructions for the agent, so test them like code: run the skill on
a small Figma file before and after your change, and describe in the pull
request what the agent did differently.

## Releases (maintainers)

1. Move the **Unreleased** entries of `CHANGELOG.md` under a new version.
2. Bump `version` in `package.json` and `create/package.json`.
3. Tag and publish: `git tag vX.Y.Z && git push --tags`, then create the GitHub
   release from the tag. Publish the installer if it changed:
   `cd create && npm publish`.

## Code of conduct

By taking part you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).
