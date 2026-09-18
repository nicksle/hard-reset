import { useEffect, useRef } from 'react'
import { useBinaryDecode } from '../../hooks/useBinaryDecode'
import { HERO_VIDEO } from '../../content/site'
import styles from './BinaryBackdrop.module.css'

/* Fixed full-bleed canvas behind the whole site. The <video> is never shown
 * directly — it's the sample source for the binary grid, and it stays playing
 * the entire way down the page.
 *
 * preload="none" until the gate clears: nothing should compete with the boot
 * terminal for bandwidth on first load. */

export function BinaryBackdrop({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useBinaryDecode(canvasRef, videoRef, active)

  useEffect(() => {
    if (!active) return
    const keepAlive = () => {
      const v = videoRef.current
      if (v?.paused) { try { void v.play() } catch { /* autoplay refused */ } }
    }
    window.addEventListener('scroll', keepAlive, { passive: true })
    return () => window.removeEventListener('scroll', keepAlive)
  }, [active])

  return (
    <>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        muted
        loop
        preload={active ? 'auto' : 'none'}
        crossOrigin="anonymous"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO.webm} type="video/webm" />
        <source src={HERO_VIDEO.mp4} type="video/mp4" />
      </video>
    </>
  )
}
