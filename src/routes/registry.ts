import type { ComponentType, ReactNode } from 'react'

/**
 * Components and blocks register their states in a sibling file:
 *   src/components/button.states.tsx   or   src/blocks/hero.states.tsx
 *
 *   export const meta = { name: 'button', figma: 'https://www.figma.com/design/...?node-id=1-2' }
 *   export const states = { default: () => <Button>Label</Button>, disabled: ... }
 *
 * The design system lists them and /render/<name>/<state> shows one alone
 * (used by npm run diff). Reference captures: refs/figma/<name>--<state>.png
 */
export type StatesModule = {
  meta: { name: string; figma?: string; description?: string }
  states: Record<string, () => ReactNode>
}

type Entry = StatesModule & { kind: 'component' | 'block' }

const componentModules = import.meta.glob<StatesModule>('../components/**/*.states.tsx', { eager: true })
const blockModules = import.meta.glob<StatesModule>('../blocks/**/*.states.tsx', { eager: true })

export const registry: Entry[] = [
  ...Object.values(componentModules).map((m) => ({ ...m, kind: 'component' as const })),
  ...Object.values(blockModules).map((m) => ({ ...m, kind: 'block' as const })),
]

export function findEntry(name: string): Entry | undefined {
  return registry.find((e) => e.meta.name === name)
}

/** Figma reference captures, keyed by file name without extension. */
const refFiles = import.meta.glob<string>('/refs/figma/*.png', { eager: true, query: '?url', import: 'default' })
export const figmaRefs: Record<string, string> = Object.fromEntries(
  Object.entries(refFiles).map(([path, url]) => [path.split('/').pop()!.replace(/\.png$/, ''), url]),
)

/** Screen modules, keyed by id (file name). */
export const screenModules = import.meta.glob<{ default: ComponentType }>('../screens/*.tsx')
