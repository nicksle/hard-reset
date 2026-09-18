import { useEffect, useState } from 'react'
import { Section, Wrap, SectionHead } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { Coverflow } from '../carousel/Coverflow'
import { CarouselCaption } from '../carousel/CarouselCaption'
import { FlierCard } from './FlierCard'
import { EventDetails } from './EventDetails'
import { useOverlay } from '../../hooks/useOverlay'
import { useDetailRoute } from '../../hooks/useDetailRoute'
import { EVENTS, eventIndex } from '../../content/events'

/* 02 — Join the Party. Flier coverflow; the focused flier opens the event
 * terminal at /parties/<id>. */

const INITIAL = Math.max(0, EVENTS.findIndex((e) => e.next))

export function EventsSection() {
  const [active, setActive] = useState(INITIAL)
  const overlay = useOverlay()
  const { routeId, openTo, closeTo } = useDetailRoute('/parties')

  const event = EVENTS[active]

  // URL -> state. Covers deep links, pasted links, and the back button.
  // close() is a no-op unless the overlay is actually open, so this can't
  // interrupt an exit animation the close button already started.
  useEffect(() => {
    if (routeId) {
      const i = eventIndex(routeId)
      if (i >= 0) { setActive(i); overlay.open() }
    } else {
      overlay.close()
    }
  }, [routeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    if (!event) return
    overlay.open()
    openTo(event.id)
  }

  const handleClose = () => {
    overlay.close()
    closeTo()
  }

  return (
    <Section id="parties">
      <Wrap>
        <Reveal>
          <SectionHead accent="Party" dimmed={overlay.isOpen}>Join the </SectionHead>
        </Reveal>
      </Wrap>

      <Coverflow
        items={EVENTS}
        activeIndex={active}
        onActiveChange={setActive}
        ariaLabel="Upcoming parties"
        onOpenActive={handleOpen}
        overlayPhase={overlay.phase}
        renderCard={(item, { active: isActive }) => (
          <FlierCard event={item} focused={isActive} />
        )}
      />

      <Wrap>
        <CarouselCaption event={event} exiting={overlay.isOpen} />
      </Wrap>

      <EventDetails event={event} phase={overlay.phase} onClose={handleClose} />
    </Section>
  )
}


// default export so lazyPanel() can code-split this panel
export default EventsSection
