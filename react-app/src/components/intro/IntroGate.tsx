import { useEffect, useState } from 'react'
import { useBootSequence } from '../../hooks/useBootSequence'
import styles from './IntroGate.module.css'

/* 00 — the boot gate. Types out the boot log, waits for the operator, then
 * glitches itself off the screen and hands control to the site.
 *
 * It's an overlay, not a panel: the sections render underneath it, so the
 * prerendered HTML still contains the whole page for crawlers and unfurlers. */

export function IntroGate({ onLaunch }: { onLaunch?: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  const { lines, stage, initialize } = useBootSequence(() => {
    setLeaving(true)
    onLaunch?.()
  })

  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(() => setGone(true), 600)
    return () => clearTimeout(id)
  }, [leaving])

  if (gone) return null

  return (
    <div className={[styles.intro, leaving ? styles.out : ''].join(' ')}>
      <div className={styles.term}>
        <div className={styles.bar}>
          <span className={`${styles.dot} ${styles.r}`} />
          <span className={`${styles.dot} ${styles.y}`} />
          <span className={`${styles.dot} ${styles.g}`} />
          <span className={styles.title}>hard_reset — bash — 80×24</span>
        </div>

        <div className={styles.body}>
          <div>
            {lines.map((l, i) => (
              <div key={i} className={[styles.line, l.c ? styles[l.c] : ''].join(' ')}>
                {l.t}
              </div>
            ))}
          </div>

          <div className={styles.gate}>
            {stage === 'gate' && (
              <>
                <button className={styles.initBtn} type="button" onClick={initialize}>
                  ▶ INITIALIZE HARD_RESET
                </button>
                <span className={styles.hint}>
                  // or press [ ENTER ] · awaiting operator input
                  <span className={styles.cursor} />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
