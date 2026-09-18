/* The content contract.
 *
 * Everything the site displays is described here. Components read these types
 * and nothing else, so moving to a CMS later means rewriting the loaders in
 * this folder and validating at that boundary — no component changes.
 */

export type Accent = 'green' | 'cyan' | 'magenta' | 'amber'

export type EventStatus = 'TICKETS LIVE' | 'EARLY BIRD' | 'SOLD OUT' | 'PAST'

/** Badge color key. Derived from status, never authored. */
export type StatusTone = 'live' | 'early' | 'sold' | 'past'

export interface LineupEntry {
  /** Match to a DJ `id` in djs.ts to cross-link later. */
  name: string
  role: string
}

export interface HardResetEvent {
  id: string
  date: string
  /** ISO start time. Only the next event needs it — it drives the countdown. */
  startsAt?: string
  venue: string
  status: EventStatus
  price: string
  flier: string
  ticketUrl: string | null
  lineup: LineupEntry[]
  /** Exactly one event should set this — the carousel opens on it. */
  next?: boolean
}

export interface DJSocials {
  soundcloud?: string
  instagram?: string
  spotify?: string
}

export interface DJ {
  id: string
  name: string
  /** The "// RESIDENT" line above the name. */
  kicker: string
  genre: string
  city: string | null
  tag: 'RESIDENT' | 'GUEST' | 'PAST'
  accent: Accent
  /** null renders the typographic card instead of the photo card. */
  photo: string | null
  track: string
  socials: DJSocials
  next?: boolean
}

/* --- panels ------------------------------------------------------------
 * Hard Reset's page is a fixed sequence, not a CMS-driven list, so this is a
 * narrower contract than a general pager needs. `content` panels are pure
 * data; `module` panels own a rAF loop, a media element, or their own state
 * and are components in disguise — see the note in the skeleton README.
 */

export type PanelId =
  | 'parties'
  | 'talent'
  | 'world'
  | 'about'
  | 'signup'

export interface Panel {
  id: PanelId
  /** Used by the panel rail and the URL hash. */
  label: string
  kind: 'content' | 'module'
}

export interface BootLine {
  t: string
  /** Maps to a color class in the intro stylesheet. */
  c: 'prompt' | 'ok' | 'warn' | 'err' | ''
}

export interface InitStep extends BootLine {
  /** Delay before the next step, in ms. */
  d: number
}

export type MarqueeGlyph = 'bolt' | 'diamond' | 'square' | 'plus'

/** A marquee is a run of literal strings and pixel-glyph keys. */
export type MarqueeToken = string | MarqueeGlyph

export interface FooterLink {
  label: string
  href: string
}
