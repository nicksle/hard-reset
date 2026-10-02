/* The ticket button's contract, rendered rather than asserted about.
 *
 * Checkout lives on Wix and the URLs are pasted in by hand, which means the
 * interesting state is the one where an event is selling and its link isn't
 * in content/events.ts yet. The right answer there is no button at all — a
 * magenta BUY TICKETS that goes to '#' reads as broken checkout to someone
 * who found the party through a flier, and they don't try twice.
 *
 *   npm run check:tickets
 *
 * Runs in CI before every deploy. No test runner: esbuild bundles this and
 * react-dom/server renders it, because one file does not need Vitest.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { EventDetails } from '../src/components/events/EventDetails'
import type { HardResetEvent, EventStatus } from '../src/content/types'

const base = (status: EventStatus, ticketUrl: string | null): HardResetEvent => ({
  id: 'x', date: 'D', venue: 'V', status, price: 'P',
  flier: 'f.svg', ticketUrl, lineup: [{ name: 'N', role: 'R' }],
})

const cases: [string, HardResetEvent, RegExp | null][] = [
  ['LIVE + real url', base('TICKETS LIVE', 'https://www.hardresetpresents.com/event-details/overclock-abc'), /<a[^>]+href="https:\/\/www\.hardresetpresents\.com\/event-details\/overclock-abc"[^>]*>▸ BUY TICKETS/],
  ['EARLY BIRD + real url', base('EARLY BIRD', 'https://www.hardresetpresents.com/event-details/nov-21-xyz'), /▸ BUY TICKETS/],
  ['LIVE + null', base('TICKETS LIVE', null), null],
  ['LIVE + "#"', base('TICKETS LIVE', '#'), null],
  ['LIVE + empty', base('TICKETS LIVE', '   '), null],
  ['LIVE + javascript:', base('TICKETS LIVE', 'javascript:alert(1)'), null],
  ['SOLD OUT + real url', base('SOLD OUT', 'https://www.hardresetpresents.com/event-details/q'), /disabled[^>]*>▸ SOLD OUT|▸ SOLD OUT/],
  ['PAST', base('PAST', null), /▸ EVENT ENDED/],
  ['PAST + "#"', base('PAST', '#'), /disabled[^>]*>▸ EVENT ENDED/],
  ['PAST + real url', base('PAST', 'https://www.hardresetpresents.com/event-details/q'), /<a[^>]+href="https:\/\/www\.hardresetpresents\.com\/event-details\/q"[^>]*>▸ VIEW EVENT PAGE/],
  ['SOLD OUT + null', base('SOLD OUT', null), /disabled[^>]*>▸ SOLD OUT/],
]

let fail = 0
for (const st of ['PAST', 'SOLD OUT'] as const) {
  const html = renderToStaticMarkup(
    <EventDetails event={base(st, 'https://www.hardresetpresents.com/event-details/q')} phase="open" onClose={() => {}} />,
  )
  if (/BUY TICKETS/.test(html)) { fail++; console.log(`  FAIL  ${st} + url says BUY TICKETS`) }
  else console.log(`  ok    ${st} + url never says BUY TICKETS`)
}
for (const [name, ev, expect] of cases) {
  const html = renderToStaticMarkup(
    <EventDetails event={ev} phase="open" onClose={() => {}} />,
  )
  const hasBuy = /BUY TICKETS/.test(html)
  const ok = expect ? expect.test(html) : !hasBuy && !/class="[^"]*buy/.test(html)
  if (!ok) { fail++; console.log(`  FAIL  ${name}`) }
  else console.log(`  ok    ${name}${expect ? '' : '  (no button rendered)'}`)
}
// target/rel on every outbound ticket link
const live = renderToStaticMarkup(
  <EventDetails event={base('TICKETS LIVE', 'https://www.hardresetpresents.com/event-details/a')} phase="open" onClose={() => {}} />,
)
for (const attr of ['target="_blank"', 'rel="noopener noreferrer"']) {
  if (live.includes(attr)) console.log(`  ok    ${attr}`)
  else { fail++; console.log(`  FAIL  missing ${attr}`) }
}
console.log(fail ? `\n${fail} FAILED` : '\nall passed')
process.exit(fail ? 1 : 0)
