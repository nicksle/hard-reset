import { useEffect } from 'react'

/* Wordmark glitch-in. Rasterizes the inline SVG to an image, then plays an
 * RGB-split + slice-jitter + dropout pass over an overlay canvas for DUR ms
 * and removes itself. Ported from the visualizer's fx.js applyGlitch. */

const DUR = 1050

interface Scratch {
  out?: HTMLCanvasElement
  ch?: HTMLCanvasElement
}

export function useGlitchIn(
  hostRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  delay = 1500,
) {
  useEffect(() => {
    if (!active) return
    const host = hostRef.current
    if (!host) return

    let cv: HTMLCanvasElement | null = null
    let raf: number | undefined
    const timer = setTimeout(run, delay)

    function run() {
      const svg = host!.querySelector('svg')
      const rect = host!.getBoundingClientRect()
      const W = Math.round(rect.width)
      const H = Math.round(rect.height)
      if (!svg || W < 4 || H < 4) {
        host!.classList.add('in')
        return
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const Wb = Math.round(W * dpr)
      const Hb = Math.round(H * dpr)

      cv = document.createElement('canvas')
      cv.width = Wb
      cv.height = Hb
      Object.assign(cv.style, {
        position: 'absolute', left: '0', top: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '2',
      })
      host!.appendChild(cv)
      const fx = cv.getContext('2d')
      if (!fx) { cleanup(svg); return }
      svg.style.visibility = 'hidden'

      const clone = svg.cloneNode(true) as SVGElement
      clone.setAttribute('width', String(Wb))
      clone.setAttribute('height', String(Hb))
      clone.removeAttribute('style')
      const xml = new XMLSerializer().serializeToString(clone)

      const img = new Image()
      img.onload = () => {
        const s: Scratch = {}
        const t0 = performance.now()
        const split0 = 16 * dpr
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / DUR)
          const e = (1 - p) * (1 - p)
          glitchFrame(fx, img, Wb, Hb, split0 * e + 0.001, 1.0 * e, 0.55 * e, s)
          if (p < 1) raf = requestAnimationFrame(step)
          else cleanup(svg)
        }
        raf = requestAnimationFrame(step)
      }
      img.onerror = () => { cleanup(svg); host!.classList.add('in') }
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    }

    function cleanup(svg: SVGElement | null) {
      try { cv?.remove() } catch { /* already gone */ }
      cv = null
      if (svg) svg.style.visibility = ''
    }

    return () => {
      clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
      cleanup(host.querySelector('svg'))
    }
  }, [hostRef, active, delay])
}

function glitchFrame(
  fx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  W: number,
  H: number,
  split: number,
  jitter: number,
  drop: number,
  s: Scratch,
) {
  const out = s.out ?? (s.out = document.createElement('canvas'))
  if (out.width !== W || out.height !== H) { out.width = W; out.height = H }
  const o = out.getContext('2d')
  const ch = s.ch ?? (s.ch = document.createElement('canvas'))
  if (ch.width !== W || ch.height !== H) { ch.width = W; ch.height = H }
  const cc = ch.getContext('2d')
  if (!o || !cc) return

  o.setTransform(1, 0, 0, 1, 0, 0)
  o.globalCompositeOperation = 'source-over'
  o.globalAlpha = 1
  o.clearRect(0, 0, W, H)

  // one color channel, offset horizontally
  const channel = (color: string, ox: number) => {
    cc.setTransform(1, 0, 0, 1, 0, 0)
    cc.globalAlpha = 1
    cc.globalCompositeOperation = 'source-over'
    cc.clearRect(0, 0, W, H)
    cc.drawImage(src, 0, 0, W, H)
    cc.globalCompositeOperation = 'multiply'
    cc.fillStyle = color
    cc.fillRect(0, 0, W, H)
    cc.globalCompositeOperation = 'destination-in'
    cc.drawImage(src, 0, 0, W, H)
    cc.globalCompositeOperation = 'source-over'
    o.globalCompositeOperation = 'lighter'
    o.drawImage(ch, ox, 0)
  }

  channel('#ff0000', -split)
  channel('#00ff00', 0)
  channel('#0000ff', split)
  o.globalCompositeOperation = 'source-over'

  if (jitter > 0.001) {
    cc.setTransform(1, 0, 0, 1, 0, 0)
    cc.globalAlpha = 1
    cc.globalCompositeOperation = 'source-over'
    cc.clearRect(0, 0, W, H)
    cc.drawImage(out, 0, 0)
    const slices = 16
    const sh = H / slices
    for (let i = 0; i < slices; i++) {
      if (Math.random() < 0.5 * jitter) {
        const sy = i * sh
        const off = (Math.random() - 0.5) * 80 * jitter
        o.clearRect(0, sy, W, sh)
        o.drawImage(ch, 0, sy, W, sh, off, sy, W, sh)
      }
    }
  }

  if (drop > 0.001 && Math.random() < drop * 0.7) {
    const by = Math.random() * H
    const bh = 4 + Math.random() * 30 * drop
    o.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.25)'
    o.fillRect(0, by, W, bh)
  }

  fx.clearRect(0, 0, W, H)
  fx.drawImage(out, 0, 0, W, H)
}
