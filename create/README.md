# create-proto-kit

Starts a new client project from the [proto-kit](../README.md) template.

```bash
npm create proto-kit@latest my-client
```

It asks for the client name and the Figma URL, then:

1. copies the template with `git clone` (your git credentials are used, so a
   private template works if you have access);
2. fills `package.json` and `context/client.md`;
3. starts a git repo with a first commit;
4. runs `npm install` and `npx playwright install chromium`;
5. runs `npm run doctor`.

## Options

| Option | Effect |
|---|---|
| `--template <git url or path>` | Use another template repo (a fork, a local copy) |
| `--ref <branch or tag>` | Template version (default `main`) |
| `--no-install` | Skip `npm install` and Chromium |
| `--no-git` | Skip `git init` and the first commit |
| `--yes`, `-y` | No questions, keep `TODO` where unknown |

With `npm create`, put options after `--`:
`npm create proto-kit@latest my-client -- --ref v0.2.0`.

## Without publishing

From a clone of proto-kit: `node create/index.js ../my-client`.

## Publishing (maintainers)

```bash
cd create
npm publish
```

Bump `version` in `create/package.json` first. The package contains only
`index.js` and this README; the template itself is always cloned from git.
