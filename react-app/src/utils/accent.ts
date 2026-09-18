import type { Accent } from '../content/types'
import type { CSSProperties } from 'react'

/** Maps a content-level accent name to the token it sets --acc to.
 *  One place to change if the palette grows. */
const MAP: Record<Accent, string> = {
  green: 'var(--green)',
  cyan: 'var(--cyan)',
  magenta: 'var(--magenta)',
  amber: 'var(--amber)',
}

export const accentVar = (name: Accent): string => MAP[name]

/** Ready to spread: <div style={accentStyle(dj.accent)}> */
export const accentStyle = (name: Accent): CSSProperties =>
  ({ '--acc': accentVar(name) }) as CSSProperties
