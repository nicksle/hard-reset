import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import { BASE, SITE_URL } from './site.config.mjs'

// `base` and React Router's `basename` must agree. Both read site.config.mjs
// so the site can move between nicksle.github.io/hard-reset/ and a custom
// domain at root without editing anything here.
//
// __SITE_URL__ is the absolute origin+base, baked in for og:url and og:image.
// content/site.ts reads it behind a typeof guard, because that module is also
// imported by react-router.config.ts in plain Node, where no define applies.
export default defineConfig({
  base: BASE,
  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },
  plugins: [reactRouter()],
})
