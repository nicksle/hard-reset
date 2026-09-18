import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useCoverflow } from '../../hooks/useCoverflow'
import type { OverlayPhase } from '../../hooks/useOverlay'
import styles from './Coverflow.module.css'

/* Generic 3D coverflow. Both the flier carousel and the DJ carousel are this
 * component with a different renderCard — the motion lives in one place.
 *
 * Clicking a neighbor focuses it; clicking the focused card calls onOpenActive.
 * While `overlayPhase` is 'open', the deck plays its exit: neighbors fade, then
 * the focused card collapses vertically into the terminal window.
 */

interface CoverflowProps<T> {
  items: readonly T[]
  activeIndex: number
  onActiveChange: (i: number) => void
  renderCard: (item: T, ctx: { active: boolean; index: number }) => ReactNode
  onOpenActive?: () => void
  overlayPhase?: OverlayPhase
  ariaLabel: string
}

export function Coverflow<T extends { id: string }>({
  items,
  activeIndex,
  onActiveChange,
  renderCard,
  onOpenActive,
  overlayPhase = 'closed',
  ariaLabel,
}: CoverflowProps<T>) {
  const exiting = overlayPhase === 'open'
  const cf = useCoverflow(items.length, { initialIndex: activeIndex, enabled: !exiting })

  // The parent owns the selection (a deep link can set it), so keep the two in
  // sync in both directions.
  useEffect(() => { cf.setActive(activeIndex) }, [activeIndex]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onActiveChange(cf.active) }, [cf.active]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (i: number) => {
    if (cf.wasDragged()) return
    if (i !== cf.active) cf.setActive(i)
    else onOpenActive?.()
  }

  return (
    <div className={styles.carousel}>
      <div
        className={styles.stage}
        style={{ ...cf.stageStyle, pointerEvents: exiting ? 'none' : undefined }}
        ref={cf.stageRef}
        onPointerDown={cf.onPointerDown}
      >
        <div className={styles.scene} role="listbox" aria-label={ariaLabel}>
          {items.map((item, i) => {
            const isActive = i === cf.active
            const base = cf.cardStyle(i)
            return (
              <div
                key={item.id}
                role="option"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={[styles.card, isActive ? styles.focus : ''].join(' ')}
                style={exitStyle(base, exiting, isActive)}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(i) }
                }}
              >
                {renderCard(item, { active: isActive, index: i })}
                <div className={styles.veil} style={{ opacity: exiting ? 0 : cf.veilOpacity(i) }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Merges the resting transform with the open-details exit. */
function exitStyle(base: CSSProperties, exiting: boolean, isActive: boolean): CSSProperties {
  if (!exiting) return base
  if (isActive) {
    return {
      ...base,
      transform: `${base.transform} scaleY(0)`,
      transition: 'transform 0.44s cubic-bezier(0.55, 0.06, 0.68, 0.19) 0.34s',
    }
  }
  return { ...base, opacity: 0, transition: 'opacity 0.3s ease' }
}
