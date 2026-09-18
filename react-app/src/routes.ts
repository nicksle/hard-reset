import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

/* One page, three URLs.
 *
 * The layout renders the whole deck; the children exist so each event and each
 * DJ has a real prerendered document with its own title and og:image. They
 * render nothing themselves — the sections read the URL and open the matching
 * terminal — which is what lets the close animation finish before the URL
 * changes back.
 */
export default [
  layout('./routes/site.tsx', [
    index('./routes/home.tsx'),
    route('parties/:eventId', './routes/event.tsx'),
    route('talent/:djId', './routes/dj.tsx'),
  ]),
] satisfies RouteConfig
