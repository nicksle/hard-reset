import { Section, Wrap } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { ABOUT } from '../../content/site'
import styles from './AboutSection.module.css'

/* 04 — about. No visible heading: the copy is set large enough to carry the
 * panel on its own. The h2 stays for screen readers so the section still has
 * a name. Copy lives in content/site.ts so the voice can change without
 * touching a component. */

export function AboutSection() {
  return (
    <Section id="about">
      <Wrap>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <h2 className={styles.srOnly}>About HARD_RESET</h2>
            {ABOUT.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          <Reveal>
            <pre className={styles.ascii}>{ABOUT.ascii}</pre>
          </Reveal>
        </div>
      </Wrap>
    </Section>
  )
}
