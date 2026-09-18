/* The boundary between the CMS and the app.
 *
 * types.ts always said that moving to a CMS meant "rewriting the loaders in
 * this folder and validating at that boundary — no component changes." This is
 * that boundary. Everything downstream may assume the data is well-formed
 * because nothing gets past here without being checked.
 *
 * Failing loudly is the whole point. This runs at BUILD time — react-router
 * .config.ts imports the content modules in plain Node to enumerate prerender
 * routes — so a typo Summers makes in the admin UI takes the deploy down with
 * a message naming the file, the entry and the field. The alternative is a
 * green deploy and a party page that renders `undefined` on the night of.
 */

export class ContentError extends Error {
  override name = 'ContentError'
}

function fail(where: string, msg: string): never {
  throw new ContentError(`${where} — ${msg}`)
}

type Raw = Record<string, unknown>

/** `where` reads like `events.json[2] "overclock-oct-17"`. */
export const at = (file: string, i: number, id?: unknown): string =>
  `${file}[${i}]${typeof id === 'string' ? ` "${id}"` : ''}`

export function obj(v: unknown, where: string): Raw {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    fail(where, 'expected an object')
  }
  return v as Raw
}

export function text(o: Raw, key: string, where: string): string {
  const v = o[key]
  if (typeof v !== 'string' || v.trim() === '') {
    fail(where, `"${key}" is required and must be a non-empty string`)
  }
  return v
}

/** Empty string is normalised to null — the CMS writes '' for a cleared field. */
export function textOrNull(o: Raw, key: string, where: string): string | null {
  const v = o[key]
  if (v == null || v === '') return null
  if (typeof v !== 'string') fail(where, `"${key}" must be a string or empty`)
  return v as string
}

export function optionalText(o: Raw, key: string, where: string): string | undefined {
  const v = o[key]
  if (v == null || v === '') return undefined
  if (typeof v !== 'string') fail(where, `"${key}" must be a string`)
  return v as string
}

export function flag(o: Raw, key: string, where: string): boolean | undefined {
  const v = o[key]
  if (v == null) return undefined
  if (typeof v !== 'boolean') fail(where, `"${key}" must be true or false`)
  return v as boolean
}

export function oneOf<const T extends readonly string[]>(
  allowed: T,
  o: Raw,
  key: string,
  where: string,
): T[number] {
  const v = o[key]
  if (typeof v !== 'string' || !allowed.includes(v)) {
    fail(where, `"${key}" must be one of ${allowed.map((a) => `"${a}"`).join(', ')} — got ${JSON.stringify(v)}`)
  }
  return v as T[number]
}

export function array(o: Raw, key: string, where: string): unknown[] {
  const v = o[key]
  if (!Array.isArray(v)) fail(where, `"${key}" must be a list`)
  return v as unknown[]
}

/* Ids are the URL slugs people share and the prerender manifest's keys. A
 * duplicate silently drops a page — two entries claim /parties/<id> and only
 * one document gets written — so it's worth its own check. */
export function uniqueIds<T extends { id: string }>(file: string, items: T[]): T[] {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      fail(file, `duplicate id "${item.id}" — ids are URLs and must be unique`)
    }
    seen.add(item.id)
  }
  return items
}

/* Exactly one entry may carry `next: true` — it's where the carousel opens.
 * Two is ambiguous rather than fatal, so the first wins and the build warns. */
export function singleNext<T extends { id: string; next?: boolean }>(
  file: string,
  items: T[],
): T[] {
  const flagged = items.filter((i) => i.next)
  if (flagged.length > 1) {
    console.warn(
      `[content] ${file}: ${flagged.length} entries set "next" (${flagged
        .map((i) => i.id)
        .join(', ')}). Using the first; clear the others.`,
    )
    for (const extra of flagged.slice(1)) extra.next = false
  }
  return items
}

/* The CMS stores paths relative to /public ("media/flier.jpg") because the
 * site is served from two different base paths — see site.config.mjs. asset()
 * re-applies whichever one this build uses. A leading slash from a
 * hand-edited entry would bypass that and 404 on github.io, so strip it. */
export const publicPath = (p: string): string => p.replace(/^\/+/, '')
