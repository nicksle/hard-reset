import { Section, Wrap, SectionHead } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { PhotoGlobe } from './PhotoGlobe'
import { WORLD_PHOTOS } from '../../content/site'
import styles from './WorldSection.module.css'

/* 04 — Explore the World. Real party photos, spinning. */

export function WorldSection() {
  return (
    <Section id="world">
      <Wrap>
        <Reveal>
          <SectionHead accent="World">Explore the </SectionHead>
        </Reveal>
      </Wrap>

      <PhotoGlobe photos={WORLD_PHOTOS} />

      <Wrap>
        <div className={styles.hint}>// the hard reset world — drag to spin</div>
      </Wrap>
    </Section>
  )
}


// default export so lazyPanel() can code-split this panel
export default WorldSection
