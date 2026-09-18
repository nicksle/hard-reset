import { useEffect, useRef, useState } from 'react'
import { MARQUEE_GLYPHS } from '../../content/site'
import type { MarqueeToken, MarqueeGlyph } from '../../content/types'
import styles from './Marquee.module.css'

/* Gapless scrolling strip. The unit (text + pixel glyphs) repeats enough times
 * to cover 2.4 viewports, then translates by -50% — seamless at any width.
 * The copy count is even so the halves match. */

interface MarqueeProps {
  tokens: MarqueeToken[]
  position?: 'top' | 'bottom'
}

const isGlyph = (t: MarqueeToken): t is MarqueeGlyph => t in MARQUEE_GLYPHS

export function Marquee({ tokens, position = 'top' }: MarqueeProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [copies, setCopies] = useState(4)

  useEffect(() => {
    const measure = () => {
      const unit = spanRef.current?.firstElementChild
      const uw = unit?.scrollWidth || 200
      let n = Math.ceil((window.innerWidth * 2.4) / uw)
      if (n < 2) n = 2
      if (n % 2) n++
      setCopies(n)
    }
    measure()
    let t: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(t); t = setTimeout(measure, 180) }
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize) }
  }, [tokens])

  return (
    <div className={[styles.strip, styles[position]].join(' ')} aria-hidden="true">
      <span ref={spanRef}>
        {Array.from({ length: copies }, (_, i) => (
          <span key={i} className={styles.unit}>
            {tokens.map((tk, j) =>
              isGlyph(tk)
                ? <PixelGlyph key={j} rows={MARQUEE_GLYPHS[tk]} />
                : <span key={j}>{tk}</span>,
            )}
          </span>
        ))}
      </span>
    </div>
  )
}

/** Renders an 'X' grid as crisp 1x1 SVG rects — pixel art at any font size. */
function PixelGlyph({ rows }: { rows: string[] }) {
  const c = rows[0]?.length ?? 0
  const r = rows.length
  const cells: React.ReactElement[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < c; x++) {
      if (row[x] === 'X') cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  })
  return (
    <svg className={styles.glyph} viewBox={`0 0 ${c} ${r}`} aria-hidden="true">
      {cells}
    </svg>
  )
}
