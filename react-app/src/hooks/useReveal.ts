import { useEffect, useRef, useState } from 'react'

/** Scroll reveal. Returns [ref, shown] — attach ref, use shown for the class.
 *  Un-reveals on the way back out, matching the original behavior. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.25,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => setShown(entries[0]?.isIntersecting ?? false),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [ref, shown]
}
