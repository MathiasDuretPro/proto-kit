/**
 * npm run a11y
 * Runs axe (WCAG 2.2 A/AA rules) on every route of src/routes/manifest.ts
 * against the production build. Fails on serious or critical violations.
 * Report: reports/a11y/report.json
 *
 * Options: --dev (serve without build)  --config <vite config>  --paths /a,/b
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { AxeBuilder } from '@axe-core/playwright'
import { auditPaths } from '../src/routes/manifest.ts'
import { launch, openStable } from './lib/browser.ts'
import { parseArgs, startServer } from './lib/server.ts'

const { flags } = parseArgs(process.argv.slice(2))
const paths = typeof flags.paths === 'string' ? flags.paths.split(',') : auditPaths
const configFile = typeof flags.config === 'string' ? flags.config : undefined
const outDir = typeof flags.out === 'string' ? flags.out : 'reports/a11y'

const server = await startServer(flags.dev ? 'dev' : 'preview', configFile)
const browser = await launch()
const report: unknown[] = []
let blocking = 0

try {
  for (const p of paths) {
    const page = await openStable(browser, server.url + p, { width: 1280, height: 800 })
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
    await page.context().close()
    report.push({ path: p, violations: result.violations })
    for (const v of result.violations) {
      const serious = v.impact === 'serious' || v.impact === 'critical'
      if (serious) blocking++
      console.log(`${serious ? 'FAIL' : 'warn'}  ${p}  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element(s))`)
      for (const n of v.nodes.slice(0, 3)) console.log(`        ${n.target.join(' ')}`)
    }
    if (result.violations.length === 0) console.log(`ok    ${p}`)
  }
} finally {
  await browser.close()
  await server.close()
}

mkdirSync(outDir, { recursive: true })
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2))
if (blocking) {
  console.error(`\na11y: ${blocking} serious/critical violation(s). Report: ${outDir}/report.json`)
  process.exit(1)
}
console.log(`\na11y OK on ${paths.length} route(s). Report: ${outDir}/report.json`)
