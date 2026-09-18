import { useCallback, useEffect, useRef, useState } from 'react'

/* SoundCloud widget wrapper with a simulated fallback.
 *
 * If the SC Widget API loaded, we drive a hidden iframe and mirror its state.
 * If it didn't (blocked, offline, ad blocker), a 32s fake transport keeps the
 * UI honest-looking rather than dead. Call sites can't tell the difference.
 */

const SIM_MS = 32000

export interface TrackTitle {
  title: string
  artist?: string
  demo?: boolean
}

export interface Player {
  frameRef: React.RefObject<HTMLIFrameElement | null>
  playing: boolean
  ratio: number
  position: number
  duration: number
  title: TrackTitle | null
  toggle: () => void
  seek: (r: number) => void
  stop: () => void
}

export function useSoundCloudPlayer(track: string): Player {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const widget = useRef<ReturnType<NonNullable<Window['SC']>['Widget']> | null>(null)
  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const simPos = useRef(0)

  const [mode, setMode] = useState<'live' | 'sim'>('sim')
  const [playing, setPlaying] = useState(false)
  const [ratio, setRatio] = useState(0)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(SIM_MS)
  const [title, setTitle] = useState<TrackTitle | null>(null)

  const stopSim = () => {
    if (simTimer.current) clearInterval(simTimer.current)
    simTimer.current = null
  }

  useEffect(() => {
    stopSim()
    setPlaying(false)
    setRatio(0)
    setPosition(0)
    simPos.current = 0

    const frame = frameRef.current
    if (!frame) return
    frame.src = widgetUrl(track)

    const SC = window.SC
    if (!SC?.Widget) {
      setMode('sim')
      setDuration(SIM_MS)
      setTitle({ title: 'Flickermood', artist: 'Forss', demo: true })
      return
    }

    let w: ReturnType<typeof SC.Widget>
    try {
      w = SC.Widget(frame)
    } catch {
      setMode('sim')
      return
    }
    widget.current = w
    setMode('live')

    w.bind(SC.Widget.Events.READY, () => {
      w.getDuration((d) => { setDuration(d); setPosition(0) })
      w.getCurrentSound((s) => {
        if (s?.title) setTitle({ title: s.title, artist: s.user?.username })
      })
    })
    w.bind(SC.Widget.Events.PLAY, () => setPlaying(true))
    w.bind(SC.Widget.Events.PAUSE, () => setPlaying(false))
    w.bind(SC.Widget.Events.FINISH, () => { setPlaying(false); setRatio(0) })
    w.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => {
      setRatio(e.relativePosition)
      setPosition(e.currentPosition)
    })

    return () => {
      try { w.unbind(SC.Widget.Events.PLAY_PROGRESS) } catch { /* gone */ }
      widget.current = null
    }
  }, [track])

  useEffect(() => stopSim, [])

  const runSim = useCallback(() => {
    if (simTimer.current) { stopSim(); setPlaying(false); return }
    setPlaying(true)
    simTimer.current = setInterval(() => {
      simPos.current += 200
      if (simPos.current >= SIM_MS) {
        simPos.current = 0
        stopSim()
        setPlaying(false)
        setRatio(0)
        setPosition(0)
        return
      }
      setRatio(simPos.current / SIM_MS)
      setPosition(simPos.current)
    }, 200)
  }, [])

  const toggle = useCallback(() => {
    if (mode === 'live' && widget.current) widget.current.toggle()
    else runSim()
  }, [mode, runSim])

  const seek = useCallback(
    (r: number) => {
      const clamped = Math.max(0, Math.min(1, r))
      if (mode === 'live' && widget.current) widget.current.seekTo(clamped * duration)
      else {
        simPos.current = clamped * SIM_MS
        setRatio(clamped)
        setPosition(simPos.current)
      }
    },
    [mode, duration],
  )

  const stop = useCallback(() => {
    if (mode === 'live' && widget.current) {
      try { widget.current.pause() } catch { /* iframe gone */ }
    }
    stopSim()
    setPlaying(false)
  }, [mode])

  return { frameRef, playing, ratio, position, duration, title, toggle, seek, stop }
}

export function formatTime(ms: number): string {
  const s = Math.floor(Math.max(0, ms || 0) / 1000)
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

function widgetUrl(track: string): string {
  return (
    'https://w.soundcloud.com/player/?url=' +
    encodeURIComponent(track) +
    '&color=%2300ff66&auto_play=false&hide_related=true&show_comments=false' +
    '&show_user=false&show_reposts=false&show_teaser=false&visual=false'
  )
}
