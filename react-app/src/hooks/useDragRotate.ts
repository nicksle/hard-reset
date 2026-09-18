import { useEffect, useRef, useState } from 'react'

/* Drag-to-spin for the photo globe. Idles at a slow auto-spin; dragging takes
 * over and the rotation stays where you leave it. Vertical drag tilts, clamped
 * so it can't roll past the poles. */

interface Options {
  autoSpin?: number
  tilt?: number
}

export function useDragRotate({ autoSpin = 0.12, tilt = -8 }: Options = {}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const objectRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    const obj = objectRef.current
    if (!stage || !obj) return

    let gy = 0
    let gx = tilt
    let isDown = false
    let px = 0
    let py = 0
    let raf: number | undefined

    const apply = () => {
      obj.style.transform = `translateZ(-40px) rotateX(${gx}deg) rotateY(${gy}deg)`
    }
    const frame = () => {
      if (!isDown) gy += autoSpin
      apply()
      raf = requestAnimationFrame(frame)
    }

    const point = (e: MouseEvent | TouchEvent) =>
      'touches' in e ? e.touches[0] : e

    const down = (e: MouseEvent | TouchEvent) => {
      const p = point(e)
      if (!p) return
      isDown = true
      setDragging(true)
      px = p.clientX
      py = p.clientY
    }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return
      const p = point(e)
      if (!p) return
      const dx = p.clientX - px
      const dy = p.clientY - py
      gy += dx * 0.3
      if (Math.abs(dx) >= Math.abs(dy)) gx = Math.max(-85, Math.min(85, gx - dy * 0.3))
      px = p.clientX
      py = p.clientY
    }
    const up = () => { isDown = false; setDragging(false) }

    apply()
    raf = requestAnimationFrame(frame)

    stage.addEventListener('mousedown', down)
    stage.addEventListener('touchstart', down, { passive: true })
    stage.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      stage.removeEventListener('mousedown', down)
      stage.removeEventListener('touchstart', down)
      stage.removeEventListener('touchmove', move)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [autoSpin, tilt])

  return { stageRef, objectRef, dragging }
}
