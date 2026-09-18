import { useEffect, useState } from 'react'

export interface Countdown {
  days: string
  hrs: string
  min: string
  sec: string
  done: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')
const ZERO: Countdown = { days: '00', hrs: '00', min: '00', sec: '00', done: true }

/* Time until `iso`, zero-padded, ticking every second.
 * Starts at zeros so the prerendered HTML and the first client render agree. */
export function useCountdown(iso: string | undefined): Countdown {
  const [parts, setParts] = useState<Countdown>(ZERO)

  useEffect(() => {
    if (!iso) return
    const tick = () => setParts(split(iso))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [iso])

  return parts
}

function split(iso: string): Countdown {
  let d = Math.max(0, new Date(iso).getTime() - Date.now())
  const days = Math.floor(d / 864e5); d -= days * 864e5
  const hrs = Math.floor(d / 36e5); d -= hrs * 36e5
  const min = Math.floor(d / 6e4); d -= min * 6e4
  const sec = Math.floor(d / 1e3)
  return { days: pad(days), hrs: pad(hrs), min: pad(min), sec: pad(sec), done: days + hrs + min + sec === 0 }
}
