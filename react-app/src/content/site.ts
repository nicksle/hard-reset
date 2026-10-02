import { asset } from '../utils/asset'
import type { BootLine, InitStep, MarqueeGlyph, MarqueeToken, FooterLink } from './types'

/* Copy and config that isn't an event or a DJ. */

export const BOOT_LINES: BootLine[] = [
  { t: '> hard_reset --connect', c: 'prompt' },
  { t: '  establishing uplink............ [OK]', c: 'ok' },
  { t: '  loading kernel modules......... [OK]', c: 'ok' },
  { t: '  mounting /dev/dancefloor....... [OK]', c: 'ok' },
  { t: '  sound_system: ARMED', c: '' },
  { t: '  location: SAN FRANCISCO, CA', c: '' },
  { t: '> system ready.', c: 'prompt' },
]

export const INIT_STEPS: InitStep[] = [
  { t: '> initialize --signal', c: 'prompt', d: 140 },
  { t: '  patching into the feed........ [OK]', c: 'ok', d: 240 },
  { t: '  decrypting signal.............', c: 'ok', d: 320 },
]

/** 5x7-ish pixel glyphs for the hero marquee. 'X' = filled cell. */
export const MARQUEE_GLYPHS: Record<MarqueeGlyph, string[]> = {
  bolt: ['...XX', '..XX.', '.XXXX', 'XXX..', '..XX.', '.XX..', 'XX...'],
  diamond: ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'],
  square: ['XXXXX', 'X...X', 'X...X', 'X...X', 'XXXXX'],
  plus: ['..X..', '..X..', 'XXXXX', '..X..', '..X..'],
}

/** Marquee content as a token list — strings render as text, keys as glyphs. */
export const MARQUEE_TOP: MarqueeToken[] = [
  ' TECHNO ', 'bolt', ' ELECTRONIC ', 'diamond', ' INDIE DANCE ', 'square',
  ' TECHNO ', 'plus', ' ELECTRONIC ', 'bolt', ' INDIE DANCE ', 'diamond', ' ',
]

export const MARQUEE_BOTTOM: MarqueeToken[] = [' EVERY DAMN SUNDAY ', 'diamond', ' ']

export const ABOUT = {
  head: '$ man ',
  headAccent: 'hard_reset',
  sub: '// NAME · DESCRIPTION · SYNOPSIS',
  paragraphs: [
    'HARD_RESET is a San Francisco techno + electro collective throwing warehouse parties for people who want to disappear into the sound.',
    'No VIP. No bottle service. Just heavy low-end, strobe, fog, and a room full of strangers who become the same organism by 3am.',
    'We reboot the week. Wipe the cache. Start clean.',
  ],
  ascii: `     ┌─────────────────────────┐
     │  ██   ██  ██████        │
     │  ██   ██  ██   ██       │
     │  ███████  ██████        │
     │  ██   ██  ██   ██       │
     │  ██   ██  ██   ██       │
     │                         │
     │   > SYSTEM REBOOTING    │
     │   > DROPPING THE BASS   │
     │   > ████████████ 100%   │
     │                         │
     │   [ SEE YOU THERE ]     │
     └─────────────────────────┘`,
}

export const SIGNUP = {
  head: './subscribe --to=the_drop',
  blurb: "Locations drop 24h before. Presale codes go to the list first. Don't miss it.",
  placeholder: 'you@domain.sf',
  cta: '> JOIN',
}

export const FOOTER: {
  brand: string
  tagline: string
  since: string
  columns: FooterLink[][]
  bottom: string
} = {
  brand: 'HARD_RESET',
  tagline: 'Techno · Electro · San Francisco',
  since: 'est. 2025',
  columns: [
    [
      { label: '▸ instagram', href: 'https://instagram.com/hardresetsf' },
      { label: '▸ soundcloud', href: '#' },
      { label: '▸ resident advisor', href: '#' },
    ],
    [
      { label: '▸ book us', href: '#' },
      { label: '▸ get on the list', href: '#signup' },
      { label: '▸ info@hardreset.party', href: 'mailto:info@hardreset.party' },
    ],
  ],
  bottom: '// © 2026 HARD_RESET // BE EXCELLENT TO EACH OTHER //',
}

/* Where the site lives. Unfurlers reject relative og:image paths, so the
 * detail routes build absolute URLs from this.
 *
 * Injected by Vite's `define` from site.config.mjs — do not hardcode it here.
 * The typeof guard is not defensive noise: react-router.config.ts imports this
 * module in plain Node to enumerate prerender routes, and no define applies
 * there. The fallback value is never the one that ships. */
declare const __SITE_URL__: string
export const SITE_URL: string =
  typeof __SITE_URL__ === 'string' ? __SITE_URL__ : 'https://nicksle.github.io/hard-reset'

/** Absolute URL for a path that may already carry the base prefix. */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) return path
  const origin = SITE_URL.replace(/\/+$/, '')
  // `asset()` output already carries the base, and SITE_URL carries it too —
  // strip it once so the two don't stack into /hard-reset/hard-reset/.
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/^\/+|\/+$/g, '')
  let clean = path.replace(/^\/+/, '')
  if (base && (clean === base || clean.startsWith(`${base}/`))) {
    clean = clean.slice(base.length).replace(/^\/+/, '')
  }
  return `${origin}/${clean}`
}

export const HERO_VIDEO = {
  mp4: asset('media/hero.mp4'),
  webm: asset('media/hero.webm'),
}
