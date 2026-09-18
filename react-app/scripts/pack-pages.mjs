import { cp, mkdir, rm, readdir, access, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { BASE, NESTED_DIR, SITE_DOMAIN } from '../site.config.mjs'

/* Flatten the build into something GitHub Pages can serve.
 *
 * The build has two layers: Vite writes assets and public files to
 * build/client/, while React Router writes the prerendered documents under
 * build/client/<basename>/. Publishing either one alone gives 404s.
 *
 * This merges them into build/pages/, which IS the Pages root:
 *   build/pages/index.html          -> the homepage
 *   build/pages/parties/<id>/       -> one document per party
 *   build/pages/assets/, media/     -> static files
 *   build/pages/404.html            -> typo'd URLs still boot the app
 *
 * At a custom domain the basename is '/', so there is no nested layer to
 * merge and build/client is already the right shape — see NESTED_DIR.
 */

const CLIENT = 'build/client'
const OUT = 'build/pages'
const NESTED = NESTED_DIR ? join(CLIENT, NESTED_DIR) : null

const exists = async (p) => access(p).then(() => true, () => false)

if (!(await exists(CLIENT))) {
  console.error('No build/client — run `npm run build` first.')
  process.exit(1)
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

/* Where React Router leaves the SPA fallback depends on the basename, and
 * the two cases are easy to get backwards:
 *
 *   basename '/hard-reset/'  documents nest under build/client/hard-reset/,
 *                            so build/client/index.html is free and the
 *                            fallback goes there.
 *   basename '/'             documents are already at build/client/, so
 *                            index.html is the real homepage and the fallback
 *                            is written to __spa-fallback.html instead.
 *
 * Either way it becomes 404.html, which is what Pages serves for an unknown
 * path — a mistyped URL still boots the app and the client router recovers.
 * Publish the homepage as 404.html by mistake and every 404 unfurls as the
 * homepage with the homepage's <title>, which is worse than it sounds when
 * the thing being shared is a party link with a typo in it.
 */
const SPA_FALLBACK = '__spa-fallback.html'
const fallbackSrc = (await exists(join(CLIENT, SPA_FALLBACK)))
  ? SPA_FALLBACK
  : 'index.html'

// 1. everything Vite emitted, minus the nested document tree
for (const entry of await readdir(CLIENT, { withFileTypes: true })) {
  if (NESTED_DIR && entry.name === NESTED_DIR) continue
  if (entry.name === SPA_FALLBACK) continue // copied below, under its real name
  await cp(join(CLIENT, entry.name), join(OUT, entry.name), { recursive: true })
}

await cp(join(CLIENT, fallbackSrc), join(OUT, '404.html'))
// In nested mode that same file was also copied as index.html above — the
// homepage overlaid in step 2 replaces it.
if (fallbackSrc === 'index.html' && NESTED_DIR) {
  await rm(join(OUT, 'index.html'), { force: true })
}

// 2. the prerendered documents, overlaid on top
if (NESTED && (await exists(NESTED))) {
  await cp(NESTED, OUT, { recursive: true })
}

/* 3. the custom domain.
 *
 * GitHub Pages reads CNAME from the published root and will silently drop the
 * custom domain on the next deploy if the file isn't there — so it gets
 * rewritten every build rather than committed once and hoped about.
 */
if (SITE_DOMAIN) {
  await writeFile(join(OUT, 'CNAME'), `${SITE_DOMAIN}\n`)
}

/* 4. .nojekyll — Pages runs Jekyll by default, which drops files and folders
 * starting with an underscore. Vite doesn't emit any today; a dependency that
 * does would fail in production only. */
await writeFile(join(OUT, '.nojekyll'), '')

const pages = []
const walk = async (dir, base = '') => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    // /admin is the CMS, copied verbatim from public/ — not a prerendered route
    if (e.isDirectory() && base === '' && e.name === 'admin') continue
    if (e.isDirectory()) await walk(join(dir, e.name), `${base}/${e.name}`)
    else if (e.name === 'index.html') pages.push(base || '/')
  }
}
await walk(OUT)

console.log(`Packed ${pages.length} prerendered pages into ${OUT}/`)
console.log(`  base:   ${BASE}`)
console.log(`  domain: ${SITE_DOMAIN || '(none — github.io)'}`)
pages.sort().forEach((p) => console.log(`  ${p}`))
