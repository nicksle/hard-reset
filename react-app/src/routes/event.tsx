import { findEvent } from '../content/events'
import { absoluteUrl } from '../content/site'
import type { Route } from './+types/event'

/* /parties/:eventId
 *
 * Renders nothing — EventsSection reads the URL and opens the terminal. This
 * module exists so the route prerenders to a real document whose title and
 * og:image are that party's, which is what makes a shared link unfurl as the
 * party instead of as the homepage.
 */

export function loader({ params }: Route.LoaderArgs) {
  const event = findEvent(params.eventId)
  if (!event) throw new Response('No such party', { status: 404 })
  return {
    date: event.date,
    venue: event.venue,
    status: event.status,
    price: event.price,
    flier: absoluteUrl(event.flier),
    url: absoluteUrl(`parties/${event.id}`),
    lineup: event.lineup.map((l) => l.name).join(' · '),
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: 'HARD_RESET // SF' }]
  const title = `HARD_RESET — ${loaderData.date} · ${loaderData.venue}`
  const description = `${loaderData.lineup}. ${loaderData.price}.`
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: loaderData.flier },
    { property: 'og:url', content: loaderData.url },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}

export default function EventRoute() {
  return null
}
