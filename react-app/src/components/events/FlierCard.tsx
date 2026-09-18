import type { HardResetEvent } from '../../content/types'
import styles from './FlierCard.module.css'

interface FlierCardProps {
  event: HardResetEvent
  focused: boolean
}

/** The poster face on the flier carousel. */
export function FlierCard({ event, focused }: FlierCardProps) {
  return (
    <div
      className={[styles.flier, focused ? styles.focus : ''].join(' ')}
      style={{ backgroundImage: `url("${event.flier}")` }}
      role="img"
      aria-label={`${event.date} — ${event.venue}`}
    />
  )
}
