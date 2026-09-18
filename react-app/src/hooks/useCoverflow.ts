import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/* Coverflow — the shared motion for both carousels (fliers and DJ cards).
 *
 * Geometry, all derived from one card width so it scales as a unit:
 *   W  card width      = base * SCALE
 *   H  card height     = W * 1.25
 *   SP  neighbor step  = W * 0.55
 *   perspective        = W * 5
 */

const SCALE = 1.15
const VISIBLE = 2.5 // cards further out than this are hidden entirely

interface Metrics { W: number; H: number; SP: number }

export interface CoverflowApi {
  active: number
  setActive: (i: number) => void
  move: (delta: number) => void
  stageRef: React.RefObject<HTMLDivElement | null>
  stageStyle: CSSProperties
  cardStyle: (i: number) => CSSProperties
  veilOpacity: (i: number) => number
  onPointerDown: (e: React.PointerEvent) => void
  wasDragged: () => boolean
  metrics: Metrics
}

interface Options {
  initialIndex?: number
  enabled?: boolean
}

export function useCoverflow(
  count: number,
  { initialIndex = 0, enabled = true }: Options = {},
): CoverflowApi {
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initialIndex)
  const [metrics, setMetrics] = useState<Metrics>(measure)

  // --- sizing -------------------------------------------------------------
  useEffect(() => {
    const onResize = () => setMetrics(measure())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const move = useCallback(
    (d: number) => setActive((a) => Math.max(0, Math.min(count - 1, a + d))),
    [count],
  )

  // --- drag ---------------------------------------------------------------
  const drag = useRef({ down: false, x: 0, moved: false })

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return
      drag.current = { down: true, x: e.clientX, moved: false }
    },
    [enabled],
  )

  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      if (drag.current.down && Math.abs(e.clientX - drag.current.x) > 8) {
        drag.current.moved = true
      }
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.current.down) return
      const dx = e.clientX - drag.current.x
      drag.current.down = false
      if (dx > 60) move(-1)
      else if (dx < -60) move(1)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [move, enabled])

  // --- horizontal wheel: one card per gesture -----------------------------
  // NOTE: this returns early unless the gesture is predominantly horizontal,
  // so vertical scroll is never intercepted. Don't "simplify" that check away.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !enabled) return

    let acc = 0
    let lock = false
    let quiet: ReturnType<typeof setTimeout> | undefined

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return // let the page scroll
      e.preventDefault()
      clearTimeout(quiet)
      quiet = setTimeout(() => { lock = false; acc = 0 }, 140)
      if (lock) return
      acc += e.deltaX
      if (Math.abs(acc) > 18) { move(acc > 0 ? 1 : -1); lock = true }
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(quiet)
      stage.removeEventListener('wheel', onWheel)
    }
  }, [move, enabled])

  // --- keyboard -----------------------------------------------------------
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move, enabled])

  // --- per-card transform -------------------------------------------------
  const { W, H, SP } = metrics

  const cardStyle = useCallback(
    (i: number): CSSProperties => {
      const rel = i - active
      const ar = Math.abs(rel)
      const z = rel === 0 ? W * 0.3 : -ar * W * 0.467
      const rotY = rel === 0 ? 0 : rel > 0 ? -48 : 48
      const scale = rel === 0 ? 1 : 0.86
      return {
        width: W + 'px',
        marginLeft: -W / 2 + 'px',
        marginTop: -H / 2 + 'px',
        transform: `translateX(${rel * SP}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
        opacity: ar > VISIBLE ? 0 : 1,
        zIndex: 100 - ar,
        pointerEvents: ar > VISIBLE ? 'none' : 'auto',
      }
    },
    [active, W, H, SP],
  )

  const veilOpacity = useCallback(
    (i: number) => {
      const ar = Math.abs(i - active)
      return ar === 0 ? 0 : Math.min(0.62, 0.32 + ar * 0.15)
    },
    [active],
  )

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      perspective: W * 5 + 'px',
      height: Math.min(Math.round(H + 28), Math.round(viewportHeight() * 0.9)) + 'px',
    }),
    [W, H],
  )

  const wasDragged = useCallback(() => drag.current.moved, [])

  return {
    active, setActive, move,
    stageRef, stageStyle,
    cardStyle, veilOpacity,
    onPointerDown, wasDragged,
    metrics,
  }
}

// Prerendering runs this module in Node, where there is no window. The values
// here are the desktop defaults; the resize effect corrects them on mount.
const viewportWidth = () => (typeof window === 'undefined' ? 1280 : window.innerWidth)
const viewportHeight = () => (typeof window === 'undefined' ? 800 : window.innerHeight)

function measure(): Metrics {
  const W = (viewportWidth() < 640 ? 210 : 300) * SCALE
  return { W, H: W * 1.25, SP: W * 0.55 }
}
