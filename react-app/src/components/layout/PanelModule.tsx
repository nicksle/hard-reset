import { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import { Section } from './Section'

/* Lazy boundary for the three interactive panels.
 *
 * The boot gate holds the screen for ~2.6s before anyone can scroll, so the
 * coverflows and the globe have no business in the initial bundle — they load
 * while the boot log is still typing. The placeholder is a bare panel of the
 * right height so nothing shifts when the real one arrives.
 */

const Placeholder = ({ id }: { id: string }) => <Section id={id} aria-busy="true" />

export function lazyPanel(
  id: string,
  load: () => Promise<{ default: ComponentType }>,
): ComponentType {
  const Loaded = lazy(load)
  return function Panel() {
    return (
      <Suspense fallback={<Placeholder id={id} />}>
        <Loaded />
      </Suspense>
    )
  }
}
