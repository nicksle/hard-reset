import { asset } from '../utils/asset'
import type { HardResetEvent, EventStatus, StatusTone } from './types'

/* Every party on the site. Adding an object here also adds a prerendered
 * /parties/<id> page — react-router.config.ts reads this list.
 *
 * `id` is the URL slug and must stay stable: it's what people share.
 *
 * --- ticketUrl ---------------------------------------------------------
 * Checkout stays on Wix. This site never takes a payment; the buy button is
 * a link out to the event's own Wix page, which is where Summers manages
 * tickets, capacity and the guest list.
 *
 * Paste the full URL from the Wix dashboard:
 *
 *     https://www.hardresetpresents.com/event-details/<slug>
 *
 * Copy it, don't type it. Wix appends its own suffix to the slug and the
 * shape of that suffix isn't predictable, so a hand-written guess 404s.
 * Wix dashboard -> Events -> the event -> Share -> copy the event page link.
 *
 * Until you have the real link, leave this null. `ticketHref` below treats
 * null, '' and '#' the same, and the buy button disappears rather than
 * rendering a dead link — see components/events/EventDetails.tsx.
 */

export const EVENTS: HardResetEvent[] = [
  {
    id: 'the-cafe-may-30',
    date: 'FRI · MAY 30 · 2026',
    venue: 'THE CAFÉ · SF',
    status: 'PAST',
    price: 'PAST EVENT',
    flier: asset('media/flier-placeholder.svg'),
    ticketUrl: null,
    lineup: [
      { name: 'SUMMERS', role: 'TECH HOUSE' },
      { name: 'SEAJAY', role: 'ELECTRO' },
      { name: 'V0RTEX', role: 'TECHNO' },
    ],
  },
  {
    id: 'decodance-jul-19',
    date: 'SAT · JUL 19 · 2026',
    venue: 'DECODANCE · SF',
    status: 'PAST',
    price: 'PAST EVENT',
    flier: asset('media/flier-placeholder.svg'),
    ticketUrl: null,
    lineup: [
      { name: 'GIOVANNI SAINZ', role: 'HOUSE' },
      { name: 'KT-909', role: 'ACID' },
      { name: 'NULLBYTE', role: 'INDIE DANCE' },
    ],
  },
  {
    id: 'the-bunker-sep-12',
    date: 'SAT · SEP 12 · 2026',
    venue: 'THE BUNKER · OAKLAND',
    status: 'SOLD OUT',
    price: 'SOLD OUT',
    flier: asset('media/flier-placeholder.svg'),
    ticketUrl: null,
    lineup: [
      { name: 'MODULAR_MOTH', role: 'MODULAR' },
      { name: '303_QUEEN', role: 'ACID TECHNO' },
      { name: 'SYSADMIN', role: 'TECHNO' },
      { name: 'SEAJAY', role: 'ELECTRO' },
    ],
  },
  {
    id: 'overclock-oct-17',
    next: true,
    date: 'SAT · OCT 17 · 2026',
    startsAt: '2026-10-17T22:00:00-07:00',
    venue: '[UNDISCLOSED WAREHOUSE] · SF',
    status: 'TICKETS LIVE',
    price: '$15 PRESALE · $20 DOOR',
    flier: asset('media/flier-placeholder.svg'),
    ticketUrl: null, // TODO: paste the Wix event-details URL
    lineup: [
      { name: 'V0ID.SYS', role: 'HARD TECHNO' },
      { name: 'ANALOG_DECAY', role: 'ELECTRO' },
      { name: 'KT-909', role: 'ACID' },
      { name: 'RESET RESIDENTS', role: 'B2B' },
    ],
  },
  {
    id: 'nov-21',
    date: 'FRI · NOV 21 · 2026',
    venue: 'LOCATION 24H PRIOR · SF',
    status: 'EARLY BIRD',
    price: 'EARLY BIRD $12',
    flier: asset('media/flier-placeholder.svg'),
    ticketUrl: null, // TODO: paste the Wix event-details URL
    lineup: [
      { name: 'TBA', role: 'HEADLINER' },
      { name: 'RESET RESIDENTS', role: 'OPENING' },
      { name: '+ SPECIAL GUESTS', role: 'LIVE' },
    ],
  },
]

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
