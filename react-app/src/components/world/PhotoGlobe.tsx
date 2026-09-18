import { useMemo } from 'react'
import { useDragRotate } from '../../hooks/useDragRotate'
import styles from './PhotoGlobe.module.css'

/* Party photos mapped onto a sphere in pure CSS 3D. Tiles sit on five latitude
 * bands, each band's count scaled by cos(lat) so spacing stays even, offset per
 * row so the columns don't line up into visible seams. */

const LATS = [-64, -32, 0, 32, 64]

export function PhotoGlobe({ photos }: { photos: string[] }) {
  const { stageRef, objectRef, dragging } = useDragRotate()

  const tiles = useMemo(() => {
    // Prerender has no window; the desktop radius is a fine static default
    // since the globe only becomes visible after hydration anyway.
    const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 190 : 265
    const out: { key: string; src: string; transform: string }[] = []
    let n = 0
    LATS.forEach((lat, ri) => {
      const count = Math.max(4, Math.round(12 * Math.cos((lat * Math.PI) / 180)))
      for (let i = 0; i < count; i++) {
        const lon = (360 / count) * i + ri * 13
        out.push({
          key: `${ri}-${i}`,
          src: photos[n % photos.length] ?? '',
          transform: `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${radius}px)`,
        })
        n++
      }
    })
    return out
  }, [photos])

  return (
    <div className={[styles.stage, dragging ? styles.dragging : ''].join(' ')} ref={stageRef}>
      <div className={styles.globe} ref={objectRef}>
        {tiles.map((t) => (
          <div key={t.key} className={styles.tile} style={{ transform: t.transform }}>
            <div className={styles.inner}>
              <img src={t.src} alt="" draggable="false" loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
