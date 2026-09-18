import rawDJs from './data/djs.json'
import { asset } from '../utils/asset'
import {
  at, obj, text, textOrNull, flag, oneOf, publicPath, uniqueIds, singleNext,
} from './load'
import type { DJ, DJSocials } from './types'

/* The roster. Order in data/djs.json is the carousel order — drag to reorder
 * in the admin UI at /admin. Adding an entry adds a prerendered /talent/<id>
 * page; see docs/CONTENT.md.
 *
 * accent  drives the card's --acc
 * photo   path under /public, or empty for a typographic (no-photo) card
 * track   SoundCloud URL the profile player loads
 */

export const DJ_DEFAULT_TRACK = 'https://soundcloud.com/forss/flickermood'

const TAGS = ['RESIDENT', 'GUEST', 'PAST'] as const
const ACCENTS = ['green', 'cyan', 'magenta', 'amber'] as const

/* Socials are optional per-network and a '#' placeholder is the same as absent
 * — DJProfile maps over whatever is here, so a kept '#' renders a button that
 * goes nowhere. Same reasoning as ticketHref. */
function parseSocials(raw: unknown, where: string): DJSocials {
  if (raw == null) return {}
  const o = obj(raw, `${where} socials`)
  const out: DJSocials = {}
  for (const key of ['soundcloud', 'instagram', 'spotify'] as const) {
    const v = o[key]
    if (typeof v === 'string' && v.trim() !== '' && v.trim() !== '#') {
      out[key] = v.trim()
    }
  }
  return out
}

function parseDJ(raw: unknown, i: number): DJ {
  const probe = obj(raw, at('djs.json', i))
  const where = at('djs.json', i, probe.id)
  const o = obj(raw, where)
  const photo = textOrNull(o, 'photo', where)
  const track = textOrNull(o, 'track', where)

  return {
    id: text(o, 'id', where),
    name: text(o, 'name', where),
    kicker: text(o, 'kicker', where),
    genre: text(o, 'genre', where),
    city: textOrNull(o, 'city', where),
    tag: oneOf(TAGS, o, 'tag', where),
    accent: oneOf(ACCENTS, o, 'accent', where),
    photo: photo ? asset(publicPath(photo)) : null,
    track: track ?? DJ_DEFAULT_TRACK,
    socials: parseSocials(o.socials, where),
    next: flag(o, 'next', where),
  }
}

export const DJS: DJ[] = singleNext(
  'djs.json',
  uniqueIds('djs.json', (rawDJs.djs as unknown[]).map(parseDJ)),
)

export const findDJ = (id: string | undefined): DJ | undefined =>
  id ? DJS.find((d) => d.id === id) : undefined

export const djIndex = (id: string | undefined): number =>
  id ? DJS.findIndex((d) => d.id === id) : -1
