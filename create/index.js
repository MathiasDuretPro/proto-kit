#!/usr/bin/env node
/**
 * npm create proto-kit@latest [folder] [-- options]
 *
 * Creates a new client project from the proto-kit template:
 * copies the template, asks for the client name and Figma URL, fills
 * context/client.md, starts a git repo, installs dependencies and Chromium,
 * then runs `npm run doctor`.
 *
 * Options:
 *   --template <git url or path>  template repo (default: the proto-kit repo)
 *   --ref <branch or tag>         template version (default: main)
 *   --no-install                  skip npm install and Chromium
 *   --no-git                      skip git init and the first commit
 *   --yes, -y                     no questions, keep TODO where unknown
 *
 * No dependency: Node built-ins only, so `npm create` stays fast.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const DEFAULT_TEMPLATE = 'https://github.com/MathiasDuretPro/proto-kit.git'
/** Files about maintaining the kit itself, not needed in a client project. */
const KIT_ONLY = [
  '.git',
  'create',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  '.github/ISSUE_TEMPLATE',
  '.github/pull_request_template.md',
  '.github/dependabot.yml',
]

const argv = process.argv.slice(2)
const flags = { template: DEFAULT_TEMPLATE, ref: 'main', install: true, git: true, yes: false }
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--template') flags.template = argv[++i]
  else if (a === '--ref') flags.ref = argv[++i]
  else if (a === '--no-install') flags.install = false
  else if (a === '--no-git') flags.git = false
  else if (a === '--yes' || a === '-y') flags.yes = true
  else if (a === '--help' || a === '-h') {
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*\n?/, '').replace(/^ \* ?/gm, ''))
    process.exit(0)
  } else if (a.startsWith('-')) fail(`Unknown option: ${a}`)
  else positional.push(a)
}

function fail(message) {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  return r.status === 0
}

const step = (n, label) => console.log(`\n[${n}] ${label}`)
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 22)) fail(`Node ${process.versions.node} is too old: proto-kit needs Node 22.22 or later.`)

console.log('\nproto-kit: new client project\n')

// Questions (skipped with --yes or without a terminal).
const interactive = !flags.yes && stdin.isTTY
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null
const ask = async (question, fallback) => {
  if (!rl) return fallback
  const answer = (await rl.question(`${question}${fallback ? ` (${fallback})` : ''}: `)).trim()
  return answer || fallback
}

let folder = positional[0] ?? (await ask('Project folder', 'my-prototype'))
if (!folder) fail('Give a folder name: npm create proto-kit@latest my-client')
const target = path.resolve(folder)
if (existsSync(target) && readdirSync(target).length) fail(`${folder} already exists and is not empty.`)

const clientName = await ask('Client name', '')
const figmaUrl = await ask('Figma file URL', '')
rl?.close()

// 1. Copy the template. git clone uses your own git credentials (private repo OK).
step(1, `Copying the template (${flags.ref})`)
if (!run('git', ['clone', '--quiet', '--depth', '1', '--branch', flags.ref, flags.template, target])) {
  fail(`Could not clone ${flags.template}. Check your access to the repo and that git is installed.`)
}
for (const f of KIT_ONLY) rmSync(path.join(target, f), { recursive: true, force: true })
// The MIT notice must stay with the copied code, but the client project is not
// MIT itself: keep the kit's licence under an explicit name.
const licence = path.join(target, 'LICENSE')
if (existsSync(licence)) renameSync(licence, path.join(target, 'LICENSE-proto-kit'))

// 2. Personalize.
step(2, 'Filling in the project details')
const pkgPath = path.join(target, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.name = slugify(clientName || path.basename(target)) || 'prototype'
pkg.version = '0.1.0'
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

const clientPath = path.join(target, 'context/client.md')
if (existsSync(clientPath)) {
  let client = readFileSync(clientPath, 'utf8')
  if (clientName) client = client.replace('- Client: TODO', `- Client: ${clientName}`)
  if (figmaUrl) client = client.replace('- Figma file URL: TODO', `- Figma file URL: ${figmaUrl}`)
  writeFileSync(clientPath, client)
}
console.log(`    package name: ${pkg.name}`)
console.log(`    context/client.md: ${clientName || figmaUrl ? 'client and Figma URL filled' : 'left as TODO'}`)

// 3. Git: the method works by branch per component or screen.
if (flags.git) {
  step(3, 'Starting a git repository')
  const ok =
    run('git', ['init', '--quiet', '--initial-branch=main'], { cwd: target }) &&
    run('git', ['add', '-A'], { cwd: target }) &&
    run('git', ['commit', '--quiet', '-m', 'chore: start from proto-kit'], { cwd: target })
  if (!ok) console.log('    git init or the first commit failed (is git user.name set?); do it by hand later.')
}

// 4. Dependencies and Chromium.
if (flags.install) {
  step(4, 'Installing dependencies (a few minutes the first time)')
  if (!run('npm', ['install', '--no-audit', '--no-fund'], { cwd: target })) fail('npm install failed. Fix the error above, then run it again in the folder.')
  step(5, 'Installing Chromium for visual diff and accessibility checks')
  if (!run('npx', ['playwright', 'install', 'chromium'], { cwd: target })) console.log('    Chromium install failed; run later: npx playwright install chromium')
  step(6, 'Checking the machine')
  run('npm', ['run', '--silent', 'doctor'], { cwd: target })
}

const rel = path.relative(process.cwd(), target) || '.'
console.log(`
✔ Project ready in ${rel}

Next:
  cd ${rel}${flags.install ? '' : '\n  npm install && npx playwright install chromium'}
  npm run dev            watch the prototype
  claude                 start Claude Code, then ask:
                         "Run phase 0 (figma-inventory) on <Figma URL>"

Guide: docs/getting-started.md
`)
