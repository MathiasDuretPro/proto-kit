import { chromium, type Browser, type Page } from 'playwright'

export async function launch(): Promise<Browser> {
  try {
    return await chromium.launch()
  } catch (e) {
    console.error('Chromium is missing. Run: npx playwright install chromium')
    throw e
  }
}

/** Opens a page in a stable state for captures: fonts loaded, motion reduced. */
export async function openStable(browser: Browser, url: string, viewport: { width: number; height: number }, scale = 1): Promise<Page> {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  return page
}
