import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Token names declared in src/tokens/theme.css, per Tailwind namespace.
 * Keep in sync with theme.css: without them, cn() cannot tell that
 * `text-body` (size) and `text-muted` (color) do not conflict.
 */
const tokenScales = {
  color: [] as string[],
  text: [] as string[],
  spacing: [] as string[],
  radius: [] as string[],
  shadow: [] as string[],
  font: [] as string[],
  leading: [] as string[],
  tracking: [] as string[],
  ease: [] as string[],
  breakpoint: [] as string[],
}

const twMerge = extendTailwindMerge({ extend: { theme: tokenScales } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
