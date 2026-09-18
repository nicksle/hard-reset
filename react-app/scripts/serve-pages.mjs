import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { BASE } from '../site.config.mjs'

/* Serves build/pages the way GitHub Pages does, which `vite preview` does not:
 * directory URLs resolve to index.html, there is no SPA fallback rewrite, and
 * an unknown path gets 404.html. Use this to check that deep links really are
 * served by their prerendered document rather than by the client router.
 *
 *   node scripts/serve-pages.mjs [port]
 */

const ROOT = 'build/pages'
// '' at a custom domain, '/hard-reset' on github.io. Match how it was built:
// SITE_DOMAIN=... node scripts/serve-pages.mjs
const PREFIX = BASE.replace(/\/+$/, '')
const port = Number(process.argv[2] ?? 4300)

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.data': 'text/x-script', '.woff2': 'font/woff2',
}

const readIfFile = async (p) => {
  try {
    if (!(await stat(p)).isFile()) return null
    return await readFile(p)
  } catch { return null }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let path = decodeURIComponent(url.pathname)

  if (PREFIX) {
    if (path === PREFIX) { res.writeHead(301, { Location: PREFIX + '/' }); return res.end() }
    if (!path.startsWith(PREFIX + '/')) { res.writeHead(404); return res.end('outside site root') }
    path = path.slice(PREFIX.length)
  }

  const base = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''))
  const body =
    (await readIfFile(base)) ??
    (await readIfFile(join(base, 'index.html')))

  if (body) {
    res.writeHead(200, { 'content-type': TYPES[extname(base) || '.html'] ?? 'application/octet-stream' })
    return res.end(body)
  }

  const notFound = await readIfFile(join(ROOT, '404.html'))
  res.writeHead(404, { 'content-type': 'text/html' })
  res.end(notFound ?? 'not found')
}).listen(port, () => console.log(`serving ${ROOT} at http://localhost:${port}${PREFIX}/`))
