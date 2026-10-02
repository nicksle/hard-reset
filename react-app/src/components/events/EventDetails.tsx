import { TerminalWindow, shareOrCopy } from '../ui/TerminalWindow'
import { Overlay } from '../ui/Overlay'
import { Equalizer } from '../ui/Equalizer'
import { ticketsOpen, ticketHref } from '../../content/events'
import type { HardResetEvent, LineupEntry } from '../../content/types'
import type { OverlayPhase } from '../../hooks/useOverlay'
import styles from './EventDetails.module.css'

/* The event terminal: flier + buy on the left, facts and lineup on the right. */

interface EventDetailsProps {
  event: HardResetEvent | undefined
  phase: OverlayPhase
  onClose: () => void
}

export function EventDetails({ event, phase, onClose }: EventDetailsProps) {
  if (!event) return null

  return (
    <Overlay phase={phase} onBackdropClick={onClose}>
      <TerminalWindow
        phase={phase}
        title="hard_reset:~/events$ ./open "
        slug={event.id}
        onClose={onClose}
        onShare={() =>
          shareOrCopy({
            title: `Hard Reset — ${event.venue}`,
            text: `${event.date} · ${event.venue}`,
          })
        }
      >
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.flierFrame}>
              <div className={styles.flier} style={{ backgroundImage: `url("${event.flier}")` }} />
            </div>
            <BuyButton event={event} />
          </div>

          <div className={styles.right}>
            <dl className={styles.meta}>
              <Row k="DATE" v={event.date} />
              <Row k="LOCATION" v={event.venue} />
              <Row k="TICKETS" v={event.price} accent />
            </dl>

            <div className={styles.lineupHead}>// LINEUP</div>
            <div className={styles.lineup}>
              {event.lineup.map((dj) => (
                <MiniDJ key={dj.name} {...dj} />
              ))}
            </div>
          </div>
        </div>
      </TerminalWindow>
    </Overlay>
  )
}

/* Checkout lives on Wix, not here.
 *
 * The button is a real <a> to the Wix event page — new tab, so the deck keeps
 * its scroll position and the boot sequence doesn't replay when they come back.
 *
 * Five outcomes, and the selling-without-a-link one is the point:
 *   selling + a link     -> live magenta BUY TICKETS anchor
 *   selling + NO link    -> nothing at all
 *   sold out / past + a link -> quiet outline anchor to the Wix event page
 *                           (photos, details, waitlist) — never "BUY"
 *   sold out / past, no link -> disabled button, still says why
 *
 * That last case is a content gap, not a state worth rendering. Wix slugs get
 * pasted in by hand (see content/events.ts), so an event is "TICKETS LIVE"
 * before its URL exists. A dead '#' link that looks buyable is worse than no
 * button: on a flier-driven site, a click that goes nowhere reads as broken
 * checkout, and people don't try twice.
 */
function BuyButton({ event }: { event: HardResetEvent }) {
  const href = ticketHref(event)

  if (!ticketsOpen(event.status)) {
    const past = event.status === 'PAST'
    if (href) {
      return (
        <a
          className={[styles.buy, styles.buyQuiet].join(' ')}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {past ? '▸ VIEW EVENT PAGE' : '▸ SOLD OUT · VIEW PAGE'}
        </a>
      )
    }
    return (
      <button className={styles.buy} type="button" disabled>
        {past ? '▸ EVENT ENDED' : '▸ SOLD OUT'}
      </button>
    )
  }

  if (!href) return null

  return (
    <a
      className={styles.buy}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      ▸ BUY TICKETS
    </a>
  )
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={styles.row}>
      <dt className={styles.k}>{k}</dt>
      <dd className={[styles.v, accent ? styles.vAccent : ''].join(' ')}>{v}</dd>
    </div>
  )
}

/** One name in the lineup. */
export function MiniDJ({ name, role }: LineupEntry) {
  return (
    <div className={styles.mini}>
      <div className={styles.miniName}>{name}</div>
      <div className={styles.miniRole}>{role}</div>
      <Equalizer bars={5} size="sm" />
    </div>
  )
}
