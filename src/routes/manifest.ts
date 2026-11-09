/**
 * Single list of the prototype's screens. Read by the router (src/main.tsx),
 * by npm run a11y and by npm run diff. Plain data only: Node imports it.
 *
 * Each `id` must match a file in src/screens/<id>.tsx (default export).
 * Add a screen here when you create it (skill: build-screen).
 */
export type ScreenRoute = {
  /** File name in src/screens/, also the visual-diff target name. */
  id: string
  /** URL path, e.g. '/' or '/checkout/payment'. */
  path: string
  title: string
}

export const screens: ScreenRoute[] = []

/** Tooling routes, always present. */
export const toolingPaths = ['/_index', '/design-system'] as const

/** Every URL checked by npm run a11y. */
export const auditPaths: string[] = [...toolingPaths, ...screens.map((s) => s.path)]
