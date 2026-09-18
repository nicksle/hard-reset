import { statusTone } from '../../content/events'
import type { EventStatus } from '../../content/types'
import styles from './StatusBadge.module.css'

interface StatusBadgeProps {
  status: EventStatus
  className?: string
}

/** Outline pill for an event's ticket state. Color comes from the status. */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={[styles.badge, styles[statusTone(status)], className].join(' ')}>
      {status}
    </span>
  )
}
