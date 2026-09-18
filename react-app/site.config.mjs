/* Where this build gets served from. One switch, three consumers.
 *
 * The site has two homes and they have different shapes:
 *
 *   nicksle.github.io/hard-reset/   the repo's Pages URL — lives under a path
 *   live.hardresetpresents.com/     a custom domain — owns its root
 *
 * The path prefix has to agree in three places (Vite's `base`, React Router's
 * `basename`, and where pack-pages.mjs goes looking for the prerendered
 * documents). They used to be three hardcoded '/hard-reset/' strings, which is
 * fine right up until the domain lands and one of them gets missed — and the
 * failure is quiet: the build succeeds and every asset 404s.
 *
 * Usage:
 *   npm run build                    -> /hard-reset/  (github.io)
 *   npm run build:domain             -> /  + a CNAME  (live.hardresetpresents.com)
 *   SITE_BASE=/preview/ npm run build
 */

/** Pages URL for the repo. Used when nothing else is set. */
const DEFAULT_BASE = '/hard-reset/'

const domain = (process.env.SITE_DOMAIN ?? '').trim()

const normalize = (p) => {
  const lead = p.startsWith('/') ? p : `/${p}`
  return lead.endsWith('/') ? lead : `${lead}/`
}

/** The custom domain to write into CNAME, or '' for the github.io URL. */
export const SITE_DOMAIN = domain

/** Path prefix, always leading- and trailing-slashed. */
export const BASE = (() => {
  const explicit = (process.env.SITE_BASE ?? '').trim()
  if (explicit) return normalize(explicit)
  // A custom domain owns its root — nothing sits above the site in the path.
  return domain ? '/' : DEFAULT_BASE
})()

/** '' at root, else the folder React Router nests prerendered docs in. */
export const NESTED_DIR = BASE.replace(/^\/+|\/+$/g, '')

/* The absolute URL of this build, no trailing slash.
 *
 * og:url and og:image have to be absolute — unfurlers drop relative ones — so
 * this is baked in at build time via Vite's `define` and read by
 * content/site.ts. It was a hardcoded github.io string, which meant a party
 * link shared from the custom domain would unfurl pointing back at
 * nicksle.github.io. Since unfurling correctly is the entire reason the detail
 * routes are prerendered, it belongs on the same switch as everything else.
 */
export const SITE_ORIGIN = SITE_DOMAIN
  ? `https://${SITE_DOMAIN}`
  : 'https://nicksle.github.io'

/** Origin + base path, no trailing slash. */
export const SITE_URL = (SITE_ORIGIN + BASE).replace(/\/+$/, '')
