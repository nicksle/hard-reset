import { Wrap } from '../layout/Section'
import { useClock } from '../../hooks/useClock'
import { FOOTER } from '../../content/site'
import styles from './SiteFooter.module.css'

/* 07 — footer. The clock is the one live thing down here. */

export function SiteFooter() {
  const clock = useClock()

  return (
    <footer className={styles.footer}>
      <Wrap>
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>{FOOTER.brand}</div>
            <div>{FOOTER.tagline}</div>
            <div>{FOOTER.since}</div>
          </div>
          {FOOTER.columns.map((col, i) => (
            <div key={i}>
              {col.map((l) => (
                <a key={l.label} href={l.href}>{l.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          {FOOTER.bottom} <span>{clock}</span>
        </div>
      </Wrap>
    </footer>
  )
}
