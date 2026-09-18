import { nextEvent } from '../content/events'
import { SITE_URL } from '../content/site'

/* The index. The deck itself is the layout — this route only sharpens the
 * homepage's metadata around whatever party is next. */

export function meta() {
  return [
    { title: 'HARD_RESET // SF' },
    {
      name: 'description',
      content: `Next: ${nextEvent.date} · ${nextEvent.venue}. Techno, electro and indie dance in San Francisco.`,
    },
    { property: 'og:title', content: 'HARD_RESET // SF' },
    {
      property: 'og:description',
      content: `Next: ${nextEvent.date} · ${nextEvent.venue}`,
    },
    { property: 'og:url', content: SITE_URL + '/' },
  ]
}

export default function Home() {
  return null
}
