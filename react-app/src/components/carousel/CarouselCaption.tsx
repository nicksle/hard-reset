import { useEffect, useState } from 'react'
import { useGlitchText } from '../../hooks/useGlitchText'
import { StatusBadge } from '../ui/StatusBadge'
import type { HardResetEvent } from '../../content/types'
import styles from './CarouselCaption.module.css'

/* Date / venue / status under the flier carousel.
 * When the details window opens, the text scrambles into binary and the whole
 * caption fades 820ms later — the handoff between deck and window. */

interface CarouselCaptionProps {
  event: HardResetEvent | undefined
  exiting: boolean
}

export function CarouselCaption({ event, exiting }: CarouselCaptionProps) {
  const [faded, setFaded] = useState(false)
  const date = useGlitchText(event?.date ?? '', exiting)
  const venue = useGlitchText(event?.venue ?? '', exiting)

  useEffect(() => {
    if (!exiting) { setFaded(false); return }
    const id = setTimeout(() => setFaded(true), 820)
    return () => clearTimeout(id)
  }, [exiting])

  if (!event) return null

  return (
    <div className={[styles.caption, faded ? styles.faded : ''].join(' ')} aria-live="polite">
      <div className={styles.date}>{date}</div>
      <div className={styles.venue}>{venue}</div>
      <StatusBadge status={event.status} />
    </div>
  )
}
