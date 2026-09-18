import rawEvents from './data/events.json'
import { asset } from '../utils/asset'
import {
  at, obj, text, textOrNull, optionalText, flag, oneOf, array,
  uniqueIds, singleNext, publicPath,
} from './load'
import type { HardResetEvent, LineupEntry, EventStatus, StatusTone } from './types'

/* Every party on the site.
 *
 * The data lives in data/events.json and is edited through the admin UI at
 * /admin — see docs/CONTENT.md. This module validates it and hands the rest of
 * the app typed objects; nothing downstream touches the JSON.
 *
 * Adding an entry also adds a prerendered /parties/<id> page, because
 * react-router.config.ts reads this list.
 *
 * `id` is the URL slug and must stay stable: it's what people share. Renaming
 * one breaks every link already in the wild.
 *
 * --- ticketUrl ---------------------------------------------------------
 * Checkout stays on Wix. This site never takes a payment; the buy button is
 * a link out to the event's own Wix page, which is where the dashboard manages
 * tickets, capacity and the guest list.
 *
 * Paste the full URL:  https://www.hardresetpresents.com/event-details/<slug>
 *
 * Copy it, don't type it. Wix appends its own suffix to the slug and the shape
 * of that suffix isn't predictable, so a hand-written guess 404s.
 * Wix dashboard -> Events -> the event -> Share -> copy the event page link.
 *
 * Leave it empty until you have the real link. ticketHref below treats null,
 * '' and '#' the same, and the buy button disappears rather than rendering a
 * dead link — see components/events/EventDetails.tsx.
 */

const STATUSES = ['TICKETS LIVE', 'EARLY BIRD', 'SOLD OUT', 'PAST'] as const

function parseLineup(raw: unknown[], where: string): LineupEntry[] {
  return raw.map((entry, i) => {
    const w = `${where} lineup[${i}]`
    const o = obj(entry, w)
    return { name: text(o, 'name', w), role: text(o, 'role', w) }
  })
}

function parseEvent(raw: unknown, i: number): HardResetEvent {
  const probe = obj(raw, at('events.json', i))
  const where = at('events.json', i, probe.id)
  const o = obj(raw, where)

  return {
    id: text(o, 'id', where),
    date: text(o, 'date', where),
    startsAt: optionalText(o, 'startsAt', where),
    venue: text(o, 'venue', where),
    status: oneOf(STATUSES, o, 'status', where),
    price: text(o, 'price', where),
    flier: asset(publicPath(text(o, 'flier', where))),
    ticketUrl: textOrNull(o, 'ticketUrl', where),
    lineup: parseLineup(array(o, 'lineup', where), where),
    next: flag(o, 'next', where),
  }
}

export const EVENTS: HardResetEvent[] = singleNext(
  'events.json',
  uniqueIds('events.json', (rawEvents.events as unknown[]).map(parseEvent)),
)

/** The event the carousel opens on. Falls back to the last one listed. */
export const nextEvent: HardResetEvent =
  EVENTS.find((e) => e.next) ?? (EVENTS[EVENTS.length - 1] as HardResetEvent)

export const findEvent = (id: string | undefined): HardResetEvent | undefined =>
  id ? EVENTS.find((e) => e.id === id) : undefined

export const eventIndex = (id: string | undefined): number =>
  id ? EVENTS.findIndex((e) => e.id === id) : -1

/** Badge color key for a status. */
export function statusTone(status: EventStatus): StatusTone {
  if (/LIVE/.test(status)) return 'live'
  if (/SOLD/.test(status)) return 'sold'
  if (/PAST/.test(status)) return 'past'
  return 'early'
}

/** Tickets are buyable unless the event is past or sold out. */
export const ticketsOpen = (status: EventStatus): boolean =>
  !/SOLD|PAST/.test(status)

/* The one place that decides whether a ticket link is real.
 *
 * '#' counts as missing. It was the placeholder while the button was a dummy,
 * and it will get pasted back in by muscle memory — treating it as a real URL
 * would put a live-looking button on an event that has nowhere to send anyone.
 * Anything that isn't http(s) is refused for the same reason.
 */
export function ticketHref(event: HardResetEvent): string | null {
  const raw = event.ticketUrl?.trim()
  if (!raw || raw === '#') return null
  return /^https?:\/\//i.test(raw) ? raw : null
}
