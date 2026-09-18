import type { Config } from '@react-router/dev/config'
import { EVENTS } from './src/content/events'
import { DJS } from './src/content/djs'
import { BASE } from './site.config.mjs'

/* Static site, fully prerendered.
 *
 * `ssr: false` because there is no server — GitHub Pages serves the built
 * files. `prerender` then writes one real HTML document per route, which is
 * the whole point: every event and every DJ gets its own <title> and og:image
 * so a shared link unfurls as that party rather than as the homepage.
 *
 * Adding an event to content/events.ts adds a prerendered page automatically.
 */
export default {
  appDirectory: 'src',
  ssr: false,
  basename: BASE,
  prerender: [
    '/',
    ...EVENTS.map((e) => `/parties/${e.id}`),
    ...DJS.map((d) => `/talent/${d.id}`),
  ],
} satisfies Config
