/* Fail fast on bad content.
 *
 * The parsers in content/load.ts throw at import time, so a malformed entry
 * would take the build down anyway — but 40 seconds into a prerender, with the
 * error buried under Vite output. This is the same failure in two seconds with
 * the file, entry and field named, run in CI before the build starts.
 *
 *   npm run check:content
 */

import { EVENTS, nextEvent, ticketHref } from '../src/content/events'
import { DJS } from '../src/content/djs'

const problems: string[] = []

if (EVENTS.length === 0) problems.push('events.json has no parties')
if (DJS.length === 0) problems.push('djs.json has no DJs')
if (!EVENTS.some((e) => e.next)) {
  problems.push('no party is marked "open the carousel here" — the deck will land on the last one')
}
if (!DJS.some((d) => d.next)) {
  problems.push('no DJ is marked "open the carousel here" — the deck will land on the last one')
}

/* Not fatal — an event can legitimately be announced before tickets are up —
 * but it is the single most likely reason someone says "the buy button is
 * missing", so it gets said out loud on every build. */
const selling = EVENTS.filter((e) => /LIVE|EARLY/.test(e.status))
const noLink = selling.filter((e) => !ticketHref(e))

console.log(`parties: ${EVENTS.length}   DJs: ${DJS.length}`)
console.log(`carousel opens on: "${nextEvent.id}"`)
console.log(`selling now: ${selling.length}, of which ${noLink.length} have no ticket link`)
for (const e of noLink) {
  console.log(`  · ${e.id} (${e.status}) — no BUY TICKETS button will render`)
}

if (problems.length) {
  console.error('\ncontent problems:')
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}
console.log('\ncontent ok')
