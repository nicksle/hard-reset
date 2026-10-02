import { Section, Wrap, SectionHead } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { ABOUT } from '../../content/site'
import styles from './AboutSection.module.css'

/* 04 — man hard_reset. Copy lives in content/site.ts so the voice can change
 * without touching a component. */

export function AboutSection() {
  return (
    <Section id="about">
      <Wrap>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <SectionHead accent={ABOUT.headAccent} sub={ABOUT.sub}>{ABOUT.head}</SectionHead>
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
