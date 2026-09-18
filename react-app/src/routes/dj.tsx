import { findDJ } from '../content/djs'
import { absoluteUrl } from '../content/site'
import type { Route } from './+types/dj'

/* /talent/:djId — same pattern as the event route: metadata only, so a shared
 * DJ link unfurls as that DJ. */

export function loader({ params }: Route.LoaderArgs) {
  const dj = findDJ(params.djId)
  if (!dj) throw new Response('No such DJ', { status: 404 })
  return {
    name: dj.name,
    genre: dj.genre,
    city: dj.city,
    tag: dj.tag,
    photo: dj.photo ? absoluteUrl(dj.photo) : null,
    url: absoluteUrl(`talent/${dj.id}`),
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: 'HARD_RESET // SF' }]
  const title = `${loaderData.name} — HARD_RESET`
  const description = [loaderData.tag, loaderData.genre, loaderData.city]
    .filter(Boolean)
    .join(' · ')
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: loaderData.url },
    ...(loaderData.photo ? [{ property: 'og:image', content: loaderData.photo }] : []),
  ]
}

export default function DJRoute() {
  return null
}
