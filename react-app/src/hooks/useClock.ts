import { useEffect, useState } from 'react'

const read = () => new Date().toTimeString().slice(0, 8) + ' LOCAL'

/* Live local clock for the footer.
 *
 * Starts empty rather than at the current time: this page is prerendered, so a
 * timestamp baked into the HTML would hydrate to a different value and mismatch.
 */
export function useClock(): string {
  const [t, setT] = useState('')

  useEffect(() => {
    setT(read())
    const id = setInterval(() => setT(read()), 1000)
    return () => clearInterval(id)
  }, [])

  return t
}
