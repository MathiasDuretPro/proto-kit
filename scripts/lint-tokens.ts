/**
 * npm run lint:tokens [-- <dir> ...]
 * Fails when a visual value is written outside src/tokens/. Every color, size,
 * spacing or layer must come from a token. See CLAUDE.md, rules section.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { config } from '../proto.config.ts'
import { parseArgs } from './lib/server.ts'

type Rule = { id: string; message: string; test: RegExp; where: 'class' | 'css' | 'code' | 'any' }

// `class`: inside string literals of .ts/.tsx (class names, values). `css`: .css files.
// `code`: raw .tsx source. `any`: both string literals and CSS.
const rules: Rule[] = [
  { id: 'hex', message: 'hex color: use a color token', test: /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/, where: 'any' },
  { id: 'color-fn', message: 'color function: use a color token', test: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/, where: 'any' },
  { id: 'unit', message: 'raw length: use a spacing/size token', test: /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|vh|vw|dvh|svh|ch)\b/, where: 'any' },
  { id: 'arbitrary', message: 'Tailwind arbitrary value: add a token instead', test: /(?<![\w-])[a-z][\w-]*-\[[^\]\s]+\](?![:/\]])/, where: 'class' },
  { id: 'arbitrary-prop', message: 'Tailwind arbitrary property: add a token or a utility', test: /(?:^|\s)\[[a-z-]+:[^\]]+\](?![:/])/, where: 'class' },
  { id: 'important', message: '!important is forbidden', test: /!important|(?:^|\s)![a-z][\w-]*|(?:^|\s)[a-z][\w:-]*!(?=\s|$)/, where: 'any' },
  { id: 'z-index', message: 'raw z-index: use a z-index token', test: /(?:^|\s|:)-?z-\d+(?![\w-])|z-index:\s*-?\d/, where: 'any' },
  { id: 'negative-margin', message: 'negative margin used to fix alignment: fix the layout instead', test: /(?:^|\s|:)-m[trblxyse]?-|margin[\w-]*:\s*-/, where: 'any' },
  { id: 'primitive', message: 'primitive token used outside src/tokens/: use a semantic token', test: /--primitive-/, where: 'any' },
  { id: 'inline-style', message: 'inline style: use token utilities', test: /\bstyle=\{/, where: 'code' },
]

const exts = new Set(['.ts', '.tsx', '.css'])
const skipDirs = new Set(['node_modules', 'tokens', 'assets', 'mocks'])

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    if (statSync(p).isDirectory()) return skipDirs.has(name) ? [] : files(p)
    return exts.has(path.extname(p)) ? [p] : []
  })
}

/** Removes comments while keeping line numbers. */
function stripComments(src: string) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

/** String literal contents with their line number. */
function literals(src: string) {
  const out: { text: string; line: number }[] = []
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g
  for (const m of src.matchAll(re)) {
    if (m[1] !== '`' && m[2].includes('\n')) continue
    const line = src.slice(0, m.index).split('\n').length
    m[2].split('\n').forEach((text, i) => out.push({ text, line: line + i }))
  }
  return out
}

function isAllowed(file: string, rule: string) {
  return config.lintAllow.some((a) => path.normalize(a.file) === path.normalize(file) && (a.rule === 'all' || a.rule === rule))
}

const { positional } = parseArgs(process.argv.slice(2))
const roots = positional.length ? positional : ['src']
const problems: string[] = []

for (const file of roots.flatMap(files)) {
  const src = stripComments(readFileSync(file, 'utf8'))
  const isCss = file.endsWith('.css')
  const report = (rule: Rule, line: number, text: string) => {
    if (!isAllowed(file, rule.id)) problems.push(`${path.relative(process.cwd(), file)}:${line}  ${rule.id}  ${rule.message}\n    ${text.trim().slice(0, 120)}`)
  }
  for (const rule of rules) {
    if (isCss) {
      if (rule.where === 'css' || rule.where === 'any')
        src.split('\n').forEach((text, i) => rule.test.test(text) && report(rule, i + 1, text))
      continue
    }
    if (rule.where === 'code') src.split('\n').forEach((text, i) => rule.test.test(text) && report(rule, i + 1, text))
    if (rule.where === 'class' || rule.where === 'any')
      for (const lit of literals(src)) if (rule.test.test(lit.text)) report(rule, lit.line, lit.text)
  }
}

if (problems.length) {
  console.error(`lint:tokens found ${problems.length} problem(s):\n`)
  console.error(problems.join('\n'))
  console.error('\nEvery visual value must come from src/tokens/. Missing token? Ask, do not invent (CLAUDE.md).')
  process.exit(1)
}
console.log(`lint:tokens OK (${roots.join(', ')})`)
