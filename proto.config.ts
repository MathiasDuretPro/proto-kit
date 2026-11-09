/**
 * Project settings for the tooling scripts. Client-specific values
 * (breakpoints, threshold) are set here during phase 1, never hard-coded in scripts.
 */
export const config = {
  /** visual-diff: max share of differing pixels to call a screen converged (0.05 = 5 %). */
  diffThreshold: 0.05,
  /** pixelmatch per-pixel color tolerance (0 strict, 1 lax). Absorbs anti-aliasing. */
  pixelTolerance: 0.1,
  /** Figma exports are made at this scale; Playwright renders at the same device scale factor. */
  exportScale: 2,
  /**
   * Breakpoints drawn in Figma: name -> frame width in px. Used to name references
   * (refs/figma/<screen>@<name>.png) and to pick the viewport. Filled in phase 0/1.
   */
  breakpoints: {} as Record<string, number>,
  /** Intermediate widths checked by review-screen: nothing may break or overflow. */
  checkWidths: [320, 390, 1024, 1280, 1920],
  /** lint:tokens: files allowed to break one rule, with the reason. Keep this list short. */
  lintAllow: [
    {
      file: 'src/routes/token-table.tsx',
      rule: 'all',
      reason: 'Tooling page that lists token values; it reads them, never defines them.',
    },
  ] as { file: string; rule: string; reason: string }[],
}
