/**
 * npm run diff -- <target> [breakpoint]
 * npm run diff:update -- <target> [breakpoint] --confirm
 *
 * <target> is a screen id from src/routes/manifest.ts (full page capture)
 * or <component>--<state> (captures /render/<component>/<state>, element only).
 * References: refs/figma/<target>@<breakpoint>.png, or <target>.png for components.
 *
 * The viewport is the reference size divided by config.exportScale, so the
 * capture matches the Figma frame exactly. Output in reports/diff/:
 * <name>.actual.png, <name>.diff.png (red = different), summary.json.
 *
 * Options: --config <vite config> --refs <dir> --out <dir>
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { config } from '../proto.config.ts'
import { screens } from '../src/routes/manifest.ts'
import { launch, openStable } from './lib/browser.ts'
import { parseArgs, startServer } from './lib/server.ts'

const { flags, positional } = parseArgs(process.argv.slice(2))
const [target, breakpoint] = positional
const refsDir = typeof flags.refs === 'string' ? flags.refs : 'refs/figma'
const outDir = typeof flags.out === 'string' ? flags.out : 'reports/diff'
const configFile = typeof flags.config === 'string' ? flags.config : undefined
const update = Boolean(flags.update)
const scale = config.exportScale

if (!target) {
  console.error('Usage: npm run diff -- <screen-id | component--state> [breakpoint]')
  process.exit(2)
}
if (update && !flags.confirm) {
  console.error('diff:update replaces a reference. Only after the screen is validated (CLAUDE.md, source of truth).')
  console.error('Re-run with --confirm, then log the change in context/decisions.md.')
  process.exit(2)
}

// Resolve what to capture.
const isComponent = target.includes('--')
let urlPath: string
if (isComponent) {
  const [name, state] = target.split('--')
  urlPath = `/render/${name}/${state}`
} else {
  const screen = screens.find((s) => s.id === target)
  if (!screen) {
    console.error(`Unknown screen "${target}". Add it to src/routes/manifest.ts.`)
    process.exit(2)
  }
  urlPath = screen.path
}

// Find references.
type Job = { name: string; refPath: string; width: number; height: number }
const jobs: Job[] = []
const files = existsSync(refsDir) ? readdirSync(refsDir) : []
for (const f of files) {
  const m = f.match(/^(.+?)(?:@(.+))?\.png$/)
  if (!m || m[1] !== target || (breakpoint && m[2] !== breakpoint)) continue
  const png = PNG.sync.read(readFileSync(path.join(refsDir, f)))
  jobs.push({ name: f.replace(/\.png$/, ''), refPath: path.join(refsDir, f), width: png.width / scale, height: png.height / scale })
}
if (jobs.length === 0 && update && breakpoint && config.breakpoints[breakpoint]) {
  // New reference from the current render (validated screens only).
  jobs.push({ name: `${target}@${breakpoint}`, refPath: path.join(refsDir, `${target}@${breakpoint}.png`), width: config.breakpoints[breakpoint], height: 800 })
}
if (jobs.length === 0 && update && isComponent) {
  // Components are captured at their own size: the viewport only needs to contain them.
  jobs.push({ name: target, refPath: path.join(refsDir, `${target}.png`), width: 800, height: 600 })
}
if (jobs.length === 0) {
  console.error(`No reference for "${target}"${breakpoint ? ` @${breakpoint}` : ''} in ${refsDir}/. Export it from Figma at @${scale}x first.`)
  process.exit(2)
}

/** Copies an image onto a canvas of the given size; the uncovered area gets a fill color. */
function pad(img: PNG, width: number, height: number, fill: [number, number, number]) {
  const out = new PNG({ width, height })
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      if (x < img.width && y < img.height) {
        const i = (y * img.width + x) * 4
        img.data.copy(out.data, o, i, i + 4)
      } else out.data.set([...fill, 255], o)
    }
  return out
}

mkdirSync(outDir, { recursive: true })
const server = await startServer('dev', configFile)
const browser = await launch()
const summary: unknown[] = []
let failed = 0

try {
  for (const job of jobs) {
    const page = await openStable(browser, server.url + urlPath, { width: Math.round(job.width), height: Math.round(job.height) }, scale)
    const actualPath = path.join(outDir, `${job.name}.actual.png`)
    const shot = isComponent
      ? await page.locator('[data-capture]').screenshot({ animations: 'disabled', caret: 'hide' })
      : await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' })
    await page.context().close()
    writeFileSync(actualPath, shot)

    if (update) {
      mkdirSync(path.dirname(job.refPath), { recursive: true })
      copyFileSync(actualPath, job.refPath)
      console.log(`updated  ${job.refPath}`)
      continue
    }

    const ref = PNG.sync.read(readFileSync(job.refPath))
    const act = PNG.sync.read(shot)
    const width = Math.max(ref.width, act.width)
    const height = Math.max(ref.height, act.height)
    const diff = new PNG({ width, height })
    // Different fills guarantee that any size mismatch counts as difference.
    const changed = pixelmatch(pad(ref, width, height, [255, 0, 255]).data, pad(act, width, height, [0, 255, 255]).data, diff.data, width, height, {
      threshold: config.pixelTolerance,
    })
    const ratio = changed / (width * height)
    const pass = ratio <= config.diffThreshold
    if (!pass) failed++
    const diffPath = path.join(outDir, `${job.name}.diff.png`)
    writeFileSync(diffPath, PNG.sync.write(diff))
    const sizeNote =
      ref.width !== act.width || ref.height !== act.height
        ? `  size mismatch: Figma ${ref.width / scale}x${ref.height / scale}, code ${act.width / scale}x${act.height / scale}`
        : ''
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${job.name}  ${(ratio * 100).toFixed(2)} % (threshold ${config.diffThreshold * 100} %)${sizeNote}`)
    console.log(`      diff: ${diffPath}`)
    summary.push({ name: job.name, ratio, pass, reference: job.refPath, actual: actualPath, diff: diffPath, sizeMismatch: Boolean(sizeNote) })
  }
} finally {
  await browser.close()
  await server.close()
}

if (!update) {
  writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
  if (failed) process.exit(1)
}
