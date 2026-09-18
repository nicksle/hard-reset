import type { ReactNode } from 'react'
import type { OverlayPhase } from '../../hooks/useOverlay'
import styles from './Overlay.module.css'

interface OverlayProps {
  phase: OverlayPhase
  onBackdropClick?: () => void
  children: ReactNode
}

/** Fixed centering layer + click-away backdrop for the detail windows.
 *  Renders nothing once the close animation has finished. */
export function Overlay({ phase, onBackdropClick, children }: OverlayProps) {
  if (phase === 'closed') return null
  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onBackdropClick} />
      {children}
    </div>
  )
}
