import { useCallback, useEffect, useRef, useState } from 'react'

/* Open/close state for the terminal detail windows.
 *
 * The choreography (carousel cards fade -> active card collapses -> caption
 * scrambles out -> window expands) is CSS, keyed off this phase. Closing is
 * held for CLOSE_MS so the collapse can finish before the overlay unmounts.
 *
 * This state is deliberately LOCAL, not derived from the route. A route that
 * unmounts the instant the URL changes cannot play an exit animation, so the
 * URL mirrors this state rather than owning it — see routes/site.tsx.
 */

const CLOSE_MS = 360

export type OverlayPhase = 'closed' | 'open' | 'closing'

export interface Overlay {
  phase: OverlayPhase
  isOpen: boolean
  isClosed: boolean
  open: () => void
  close: () => void
}

export function useOverlay({ onClose }: { onClose?: () => void } = {}): Overlay {
  const [phase, setPhase] = useState<OverlayPhase>('closed')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const open = useCallback(() => {
    clearTimeout(timer.current)
    setPhase('open')
  }, [])

  const close = useCallback(() => {
    // Guarded so calling close() twice — once from the button, once from a
    // back-navigation — doesn't restart the timer or re-fire onClose.
    setPhase((p) => {
      if (p !== 'open') return p
      onClose?.()
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setPhase('closed'), CLOSE_MS)
      return 'closing'
    })
  }, [onClose])

  // lock the page behind the overlay
  useEffect(() => {
    if (phase === 'closed') return
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [phase])

  // esc to close
  useEffect(() => {
    if (phase !== 'open') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase, close])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { phase, isOpen: phase === 'open', isClosed: phase === 'closed', open, close }
}
