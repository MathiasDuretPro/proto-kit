/**
 * Light journey tracking for user tests. DISABLED by default.
 *
 * Enable only when the designer asks (skill: prepare-test): call
 * enableTracking({ participant: 'P01' }) in src/main.tsx.
 * - Records navigations, clicks on elements marked data-track="<name>",
 *   and abandons (tab hidden or closed before a journey ends).
 * - Data stays in the browser (localStorage). Nothing is sent anywhere.
 * - Export: exportTracking() downloads a JSON file; also available in the
 *   console as window.protoTracking.export().
 */
type TrackEvent = { t: string; type: 'navigation' | 'click' | 'abandon' | 'custom'; name: string; path: string; participant?: string }

const KEY = 'proto-tracking'
let enabled = false
let participant: string | undefined

function read(): TrackEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as TrackEvent[]
  } catch {
    return []
  }
}

function write(events: TrackEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {
    // Storage unavailable (private mode): tracking silently stops.
  }
}

export function track(type: TrackEvent['type'], name: string) {
  if (!enabled) return
  write([...read(), { t: new Date().toISOString(), type, name, path: location.pathname, participant }])
}

export function exportTracking() {
  const blob = new Blob([JSON.stringify(read(), null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `tracking-${participant ?? 'session'}-${new Date().toISOString().slice(0, 19)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function clearTracking() {
  write([])
}

export function enableTracking(options: { participant?: string } = {}) {
  if (enabled) return
  enabled = true
  participant = options.participant

  track('navigation', location.pathname)
  const onNavigate = () => track('navigation', location.pathname)
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method].bind(history)
    history[method] = (...args: Parameters<History['pushState']>) => {
      original(...args)
      onNavigate()
    }
  }
  addEventListener('popstate', onNavigate)

  addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest('[data-track]')
      if (el) track('click', el.getAttribute('data-track') ?? '')
    },
    { capture: true },
  )

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') track('abandon', location.pathname)
  })

  Object.assign(window, { protoTracking: { export: exportTracking, clear: clearTracking, events: read } })
}
