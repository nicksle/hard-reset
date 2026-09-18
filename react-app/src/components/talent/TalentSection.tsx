import { useEffect, useState } from 'react'
import { Section, Wrap, SectionHead } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { Coverflow } from '../carousel/Coverflow'
import { DJCard } from './DJCard'
import { DJProfile } from './DJProfile'
import { useOverlay } from '../../hooks/useOverlay'
import { useDetailRoute } from '../../hooks/useDetailRoute'
import { DJS, djIndex } from '../../content/djs'

/* 03 — DJs on Deck. Same coverflow as the parties, different card, and a
 * profile window at /talent/<id>. */

const INITIAL = Math.max(0, DJS.findIndex((d) => d.next))

export function TalentSection() {
  const [active, setActive] = useState(INITIAL)
  const overlay = useOverlay()
  const { routeId, openTo, closeTo } = useDetailRoute('/talent')

  const dj = DJS[active]

  useEffect(() => {
    if (routeId) {
      const i = djIndex(routeId)
      if (i >= 0) { setActive(i); overlay.open() }
    } else {
      overlay.close()
    }
  }, [routeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    if (!dj) return
    overlay.open()
    openTo(dj.id)
  }

  const handleClose = () => {
    overlay.close()
    closeTo()
  }

  return (
    <Section id="talent">
      <Wrap>
        <Reveal>
          <SectionHead accent="Deck" dimmed={overlay.isOpen}>DJs on </SectionHead>
        </Reveal>
      </Wrap>

      <Coverflow
        items={DJS}
        activeIndex={active}
        onActiveChange={setActive}
        ariaLabel="Residents and guests"
        onOpenActive={handleOpen}
        overlayPhase={overlay.phase}
        renderCard={(item, { index }) => <DJCard dj={item} index={index} />}
      />

      {dj && overlay.phase !== 'closed' && (
        <DJProfile dj={dj} phase={overlay.phase} onClose={handleClose} />
      )}
    </Section>
  )
}


// default export so lazyPanel() can code-split this panel
export default TalentSection
