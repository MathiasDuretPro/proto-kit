/**
 * npm run selftest
 * Proves the tooling catches what it must catch, using example/.
 * Each check runs a real script and compares its exit code to the expected one.
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'

const tmp = 'reports/selftest'
rmSync(tmp, { recursive: true, force: true })
mkdirSync(`${tmp}/refs-wrong`, { recursive: true })

const cfg = ['--config', 'example/vite.config.ts']
const run = (args: string[]) => spawnSync('node', args, { encoding: 'utf8' })

type Check = { label: string; args: string[]; expect: 'pass' | 'fail'; before?: () => void; output?: RegExp }
const checks: Check[] = [
  { label: 'lint:tokens accepts the token-only Button', args: ['scripts/lint-tokens.ts', 'example/button.tsx', 'example/button.states.tsx'], expect: 'pass' },
  { label: 'lint:tokens rejects hard-coded values', args: ['scripts/lint-tokens.ts', 'example/fixtures'], expect: 'fail', output: /found 7 problem/ },
  {
    label: 'visual-diff creates references from the Button',
    args: ['scripts/visual-diff.ts', 'button--default', '--update', '--confirm', ...cfg, '--refs', `${tmp}/refs`, '--out', `${tmp}/out`],
    expect: 'pass',
  },
  {
    label: 'visual-diff passes on a matching reference',
    args: ['scripts/visual-diff.ts', 'button--default', ...cfg, '--refs', `${tmp}/refs`, '--out', `${tmp}/out`],
    expect: 'pass',
  },
  {
    label: 'visual-diff prepares a wrong reference (secondary state)',
    args: ['scripts/visual-diff.ts', 'button--secondary', '--update', '--confirm', ...cfg, '--refs', `${tmp}/refs-wrong`, '--out', `${tmp}/out`],
    expect: 'pass',
  },
  {
    label: 'visual-diff fails on a wrong reference',
    before: () => copyFileSync(`${tmp}/refs-wrong/button--secondary.png`, `${tmp}/refs-wrong/button--default.png`),
    args: ['scripts/visual-diff.ts', 'button--default', ...cfg, '--refs', `${tmp}/refs-wrong`, '--out', `${tmp}/out-wrong`],
    expect: 'fail',
    output: /FAIL\s+button--default/,
  },
  {
    label: 'a11y passes on the Button states',
    args: ['scripts/a11y.ts', '--dev', ...cfg, '--out', `${tmp}/a11y`, '--paths', '/render/button/default,/render/button/secondary,/render/button/disabled'],
    expect: 'pass',
  },
]

let ok = true
for (const c of checks) {
  c.before?.()
  const r = run(c.args)
  const got = r.status === 0 ? 'pass' : 'fail'
  // The output check makes sure a failure is the expected one, not a crash.
  const good = got === c.expect && r.status !== 2 && (!c.output || c.output.test(r.stdout + r.stderr))
  ok &&= good
  console.log(`${good ? 'ok  ' : 'FAIL'}  ${c.label}  (expected ${c.expect}, got ${got})`)
  if (!good) console.log((r.stdout + r.stderr).split('\n').map((l) => `      ${l}`).join('\n'))
}
console.log(ok ? '\nselftest OK: the tooling works.' : '\nselftest FAILED.')
process.exit(ok ? 0 : 1)
