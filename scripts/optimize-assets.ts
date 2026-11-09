/**
 * npm run assets
 * - Raster images in src/assets/raw/ -> src/assets/images/<name>.avif + .webp
 *   (originals kept; widths above maxWidth are downscaled).
 * - Icons in src/assets/icons/*.svg -> colors replaced by currentColor so the
 *   icon takes the text color token; width/height removed (size via tokens).
 *   Multicolor illustrations belong in src/assets/images/, not icons/.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const rawDir = 'src/assets/raw'
const outDir = 'src/assets/images'
const iconDir = 'src/assets/icons'
const maxWidth = 3840 // 1920 px frame at @2x

const kb = (n: number) => `${Math.round(n / 1024)} kB`

for (const file of readdirSync(rawDir).filter((f) => /\.(png|jpe?g|webp|tiff?)$/i.test(f))) {
  const src = path.join(rawDir, file)
  const name = path.parse(file).name
  const img = sharp(src).resize({ width: maxWidth, withoutEnlargement: true })
  const avif = await img.clone().avif({ quality: 60 }).toFile(path.join(outDir, `${name}.avif`))
  const webp = await img.clone().webp({ quality: 80 }).toFile(path.join(outDir, `${name}.webp`))
  console.log(`${file}  ${kb(statSync(src).size)} -> avif ${kb(avif.size)}, webp ${kb(webp.size)}`)
}

for (const file of readdirSync(iconDir).filter((f) => f.endsWith('.svg'))) {
  const p = path.join(iconDir, file)
  const svg = readFileSync(p, 'utf8')
  const colors = new Set([...svg.matchAll(/(?:fill|stroke)="(?!none|currentColor|url)([^"]+)"/g)].map((m) => m[1]))
  if (colors.size > 1) {
    console.warn(`${file}: ${colors.size} colors, kept as is. Multicolor art goes to src/assets/images/.`)
    continue
  }
  const out = svg
    .replace(/(fill|stroke)="(?!none|currentColor|url)[^"]+"/g, '$1="currentColor"')
    .replace(/<svg([^>]*?)\s(?:width|height)="[^"]*"/g, '<svg$1')
    .replace(/<svg([^>]*?)\s(?:width|height)="[^"]*"/g, '<svg$1')
  writeFileSync(p, out)
  console.log(`${file}  icon -> currentColor`)
}
