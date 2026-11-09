import { createServer, preview, type ViteDevServer, type PreviewServer } from 'vite'

export type Running = { url: string; close: () => Promise<void> }

/**
 * Starts the app for the scripts. 'dev' needs no build (visual-diff);
 * 'preview' serves the production build in dist/ (a11y, after npm run build).
 */
export async function startServer(mode: 'dev' | 'preview', configFile?: string): Promise<Running> {
  const server: ViteDevServer | PreviewServer =
    mode === 'dev'
      ? await createServer({ configFile, server: { port: 0, strictPort: false }, logLevel: 'error' }).then((s) => s.listen())
      : await preview({ configFile, preview: { port: 0 }, logLevel: 'error' })
  const url = server.resolvedUrls?.local[0]
  if (!url) throw new Error('Could not start the Vite server.')
  return { url: url.replace(/\/$/, ''), close: () => server.close() }
}

/** Reads --flag value pairs and positional arguments. */
export function parseArgs(argv: string[]) {
  const flags: Record<string, string | true> = {}
  const positional: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags[a.slice(2)] = next
        i++
      } else flags[a.slice(2)] = true
    } else positional.push(a)
  }
  return { flags, positional }
}
