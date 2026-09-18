/* Resolve a path under /public against Vite's configured base.
 *
 * An absolute '/media/x.jpg' ignores `base` and 404s on GitHub Pages, so every
 * public asset reference goes through here.
 *
 * The optional chain matters: react-router.config.ts imports the content
 * files at build time in a plain Node context where import.meta.env does not
 * exist. Falling back to '/' there is fine — those paths are only used to
 * enumerate prerender routes, never to load a file.
 */
const BASE = import.meta.env?.BASE_URL ?? '/'

export const asset = (path = ''): string => BASE + path.replace(/^\/+/, '')
