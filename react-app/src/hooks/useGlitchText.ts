import { useEffect, useState } from 'react'

/* Binary scramble-out. Each character gets a random flip time; as the frame
 * counter advances, more characters become 1s and 0s. Pass `active` false to
 * get the source text back. */

const FRAMES = 13
const FRAME_MS = 30

export function useGlitchText(text: string, active: boolean): string {
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!active) { setOut(text); return }

    const seeds = Array.from(text, (c) => ({ c, t: Math.random() }))
    let f = 0
    const id = setInterval(() => {
      f++
      const p = f / FRAMES
      setOut(
        seeds
          .map((o) => (o.c === ' ' ? ' ' : p > o.t ? (Math.random() < 0.5 ? '0' : '1') : o.c))
          .join(''),
      )
      if (f >= FRAMES) clearInterval(id)
    }, FRAME_MS)

    return () => clearInterval(id)
  }, [text, active])

  return out
}
