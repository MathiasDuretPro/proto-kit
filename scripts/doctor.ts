/**
 * npm run doctor
 * Checks that this machine is ready to use the kit, and says how to fix
 * whatever is missing. Errors block the tooling; warnings only block some phases.
 * Exit code: 1 if at least one error, 0 otherwise.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

type Result = { level: 'ok' | 'warn' | 'error'; label: string; fix?: string }
const results: Result[] = []
const add = (level: Result['level'], label: string, fix?: string) => results.push({ level, label, fix })

// 1. Node version, compared to the minimum in package.json > engines.
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { engines?: { node?: string } }
const min = (pkg.engines?.node ?? '').replace(/[^\d.]/g, '')
const toNum = (v: string) => v.split('.').map(Number)
const current = toNum(process.versions.node)
const required = toNum(min || '0')
const nodeOk = current.reduce<number>((acc, n, i) => (acc !== 0 ? acc : Math.sign(n - (required[i] ?? 0))), 0) >= 0
if (nodeOk) add('ok', `Node ${process.versions.node} (needs ${min})`)
else add('error', `Node ${process.versions.node} is too old (needs ${min})`, 'Install the version in .nvmrc: nvm install && nvm use')

// 2. Dependencies.
if (existsSync('node_modules/vite') && existsSync('node_modules/playwright')) add('ok', 'Dependencies installed')
else add('error', 'Dependencies missing', 'Run: npm install')

// 3. Chromium for Playwright (visual-diff, a11y, selftest).
try {
  const { chromium } = await import('playwright')
  if (existsSync(chromium.executablePath())) add('ok', 'Chromium installed for Playwright')
  else add('error', 'Chromium missing for Playwright', 'Run: npx playwright install chromium')
} catch {
  add('error', 'Playwright cannot be loaded', 'Run: npm install')
}

// 4. Git: the method works by branch and commit.
const git = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' })
if (git.status === 0) add('ok', 'Git repository')
else add('warn', 'Not a git repository', 'Run: git init (the kit works by branch per component or screen)')

// 5. Claude Code CLI.
const claude = spawnSync('claude', ['--version'], { encoding: 'utf8' })
if (claude.status === 0) add('ok', `Claude Code ${claude.stdout.trim()}`)
else add('warn', 'Claude Code CLI not found in PATH', 'Install it: https://claude.com/claude-code (or use the desktop app)')

// 6. Figma MCP from the Figma desktop app, declared in .mcp.json. Local request only.
try {
  await fetch('http://127.0.0.1:3845/mcp', { method: 'GET', signal: AbortSignal.timeout(1500) })
  add('ok', 'Figma MCP server reachable (Figma desktop app)')
} catch {
  add(
    'warn',
    'Figma MCP server not reachable on 127.0.0.1:3845',
    'Open the Figma desktop app, open a file, switch to Dev Mode and enable "MCP server". Needed from phase 0 on.',
  )
}

// 7. Client context filled.
const client = existsSync('context/client.md') ? readFileSync('context/client.md', 'utf8') : ''
if (/Figma file URL:\s*TODO/.test(client)) add('warn', 'context/client.md not filled (Figma URL is TODO)', 'Fill it before phase 0.')
else add('ok', 'context/client.md filled')

// 8. Fonts: only expected once tokens exist (phase 1).
const tokensFilled = /^\s*--primitive-[\w-]+\s*:/m.test(readFileSync('src/tokens/primitives.css', 'utf8'))
const fonts = readdirSync('src/assets/fonts').filter((f) => !f.startsWith('.'))
if (!tokensFilled) add('ok', 'Fonts: not needed yet (tokens not extracted)')
else if (fonts.length) add('ok', `Fonts: ${fonts.length} file(s) in src/assets/fonts`)
else add('warn', 'Tokens exist but src/assets/fonts is empty', "Add the brand's font files (never a substitute without saying so).")

const icon = { ok: 'ok  ', warn: 'warn', error: 'FAIL' }
for (const r of results) {
  console.log(`${icon[r.level]}  ${r.label}`)
  if (r.fix && r.level !== 'ok') console.log(`      -> ${r.fix}`)
}
const errors = results.filter((r) => r.level === 'error').length
const warns = results.filter((r) => r.level === 'warn').length
console.log(errors ? `\ndoctor: ${errors} error(s), fix them first.` : `\ndoctor: ready${warns ? ` (${warns} warning(s))` : ''}.`)
process.exit(errors ? 1 : 0)
