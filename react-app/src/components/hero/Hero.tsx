import { useEffect, useRef } from 'react'
import { Wordmark } from './Wordmark'
import styles from './Hero.module.css'

/* 01 — the hero. The wordmark over the live binary backdrop. Fades as you
 * scroll past so the body takes over cleanly.
 *
 * The two marquee strips are switched off for now (they were rendering
 * inconsistently). To bring them back, import Marquee and MARQUEE_TOP /
 * MARQUEE_BOTTOM from content/site and put these back above <Wordmark>:
 *   <Marquee tokens={MARQUEE_TOP} position="top" />
 *   <Marquee tokens={MARQUEE_BOTTOM} position="bottom" />
 */

export function Hero({ live }: { live: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        el.style.opacity = String(Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.8)))
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={styles.hero} ref={ref}>
      <Wordmark animate={live} />
      <div className={styles.hint}>▼ scroll</div>
    </header>
  )
}
