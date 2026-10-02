import { nextEvent } from '../content/events'
import { SITE_URL } from '../content/site'

/* The index. The deck itself is the layout — this route only sharpens the
 * homepage's metadata around whatever party is next. When every listed party
 * is past, it describes the series instead of calling a past date "Next". */

const upcoming = nextEvent.status !== 'PAST'
const blurb = 'House, techno and trance in San Francisco.'

export function meta() {
  return [
    { title: 'HARD_RESET // SF' },
    {
      name: 'description',
      content: upcoming
        ? `Next: ${nextEvent.date} · ${nextEvent.venue}. ${blurb}`
        : `Sunday nights at Q-Bar in the Castro. ${blurb}`,
    },
    { property: 'og:title', content: 'HARD_RESET // SF' },
    {
      property: 'og:description',
      content: upcoming
        ? `Next: ${nextEvent.date} · ${nextEvent.venue}`
        : 'Sunday nights at Q-Bar in the Castro.',
    },
    { property: 'og:url', content: SITE_URL + '/' },
  ]
}

export default function Home() {
  return null
}
