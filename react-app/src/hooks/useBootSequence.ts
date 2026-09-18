import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOT_LINES, INIT_STEPS } from '../content/site'
import type { BootLine } from '../content/types'

/* The intro terminal's state machine.
 *   'booting'      lines type out, 300ms apart
 *   'gate'         INITIALIZE button (or Enter)
 *   'initializing' the decrypt steps play, then onLaunch fires
 */

export type BootStage = 'booting' | 'gate' | 'initializing'

interface Options {
  startDelay?: number
  lineDelay?: number
}

export function useBootSequence(
  onLaunch: (() => void) | undefined,
  { startDelay = 500, lineDelay = 300 }: Options = {},
) {
  const [lines, setLines] = useState<BootLine[]>([])
  const [stage, setStage] = useState<BootStage>('booting')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const launched = useRef(false)

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    let i = 0
    const next = () => {
      // Read the line BEFORE the updater runs — React processes the queued
      // updater after i++, so reading it inside would be off by one.
      const line = BOOT_LINES[i]
      if (!line) { setStage('gate'); return }
      setLines((ls) => [...ls, line])
      i++
      later(next, lineDelay)
    }
    later(next, startDelay)

    const pending = timers.current
    return () => { pending.forEach(clearTimeout); timers.current = [] }
  }, [later, startDelay, lineDelay])

  const initialize = useCallback(() => {
    if (launched.current) return
    launched.current = true
    setStage('initializing')

    let s = 0
    const step = () => {
      const l = INIT_STEPS[s]
      if (!l) { later(() => onLaunch?.(), 360); return }
      setLines((ls) => [...ls, l])
      s++
      later(step, l.d)
    }
    step()
  }, [later, onLaunch])

  // Enter is the keyboard equivalent of the button
  useEffect(() => {
    if (stage !== 'gate') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') initialize() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [stage, initialize])

  return { lines, stage, initialize }
}
