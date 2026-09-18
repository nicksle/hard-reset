import { useEffect } from 'react'

/* Binary video decode — the fixed full-bleed hero background.
 *
 * The video is sampled down to a character grid, each cell drawn as a 1 or 0,
 * and over BRAMP ms the grid fades from pure phosphor green toward the video's
 * own color. Everything inside the loop is imperative on purpose: it runs at
 * 60fps and must never re-render the tree.
 */

const GREEN = [0, 255, 102] as const
const BRAMP = 4200 // ms of ramp from binary -> video color
const BHOLD = 1100 // ms of pure binary before the ramp starts

export function useBinaryDecode(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    const bg = canvasRef.current
    const vid = videoRef.current
    if (!bg || !vid) return

    const bx = bg.getContext('2d')
    const samp = document.createElement('canvas')
    const sc = samp.getContext('2d', { willReadFrequently: true })
    if (!bx || !sc) return

    let BW = 0, BH = 0, bcell = 9, bcols = 0, brows = 0
    let bbits = new Uint8Array(0)
    let bthr = new Float32Array(0)
    let bcrop = { sx: 0, sy: 0, sw: 1024, sh: 576 }
    let raf: number | undefined
    let start = 0

    // object-fit: cover, in source-pixel space
    const cover = (vw: number, vh: number) => {
      const ta = BW / BH
      const sa = vw / vh
      if (sa > ta) {
        const sh = vh, sw = vh * ta
        return { sx: (vw - sw) / 2, sy: 0, sw, sh }
      }
      const sw = vw, sh = vw / ta
      return { sx: 0, sy: (vh - sh) / 2, sw, sh }
    }

    function size() {
      BW = bg!.width = window.innerWidth
      BH = bg!.height = window.innerHeight
      bcell = Math.max(9, Math.floor(BW / (BW < 640 ? 34 : 88)))
      bcols = Math.ceil(BW / bcell)
      brows = Math.ceil(BH / bcell)
      samp.width = bcols
      samp.height = brows
      bbits = new Uint8Array(bcols * brows).map(() => (Math.random() < 0.5 ? 0 : 1))
      bthr = new Float32Array(bcols * brows).map(() => Math.random())
      bcrop = cover(vid!.videoWidth || 1024, vid!.videoHeight || 576)
    }

    const ease = (t: number) => 1 - Math.pow(1 - t, 2.2)

    function render(now: number) {
      raf = requestAnimationFrame(render)
      const el = now - start
      const p = ease(Math.min(1, Math.max(0, el - BHOLD) / BRAMP))
      const mix = p * 0.3
      const tintP = p
      const gA = 1 - p * 0.15
      const boost = 1 - p
      const tsec = now * 0.001
      const globalDens = 0.6 + 0.4 * Math.sin(tsec * 0.8) + 0.1 * Math.sin(tsec * 2.3)

      bx!.fillStyle = '#000'
      bx!.fillRect(0, 0, BW, BH)

      if (vid!.readyState >= 2) {
        try {
          sc!.drawImage(vid!, bcrop.sx, bcrop.sy, bcrop.sw, bcrop.sh, 0, 0, bcols, brows)
        } catch { /* frame not ready */ }
      }
      if (mix > 0 && vid!.readyState >= 2) {
        bx!.globalAlpha = mix
        try {
          bx!.drawImage(vid!, bcrop.sx, bcrop.sy, bcrop.sw, bcrop.sh, 0, 0, BW, BH)
        } catch { /* frame not ready */ }
        bx!.globalAlpha = 1
      }

      const data = sc!.getImageData(0, 0, bcols, brows).data
      bx!.textAlign = 'center'
      bx!.textBaseline = 'middle'
      bx!.font = '700 ' + Math.round(bcell * 1.02) + "px 'Courier New', monospace"

      for (let r = 0; r < brows; r++) {
        for (let col = 0; col < bcols; col++) {
          const i = r * bcols + col
          const q = i * 4
          const rC = data[q] ?? 0
          const gC = data[q + 1] ?? 0
          const bC = data[q + 2] ?? 0

          let base = (0.299 * rC + 0.587 * gC + 0.114 * bC) / 255
          base = Math.pow(base, 1.3)
          const L = Math.min(1, base * (1.15 + boost * 0.6) + boost * 0.1)
          if (L < 0.05) continue

          const wave = 0.5 + 0.5 * Math.sin(r * 0.22 + col * 0.1 - tsec * 2.0)
          const localDens = globalDens * (0.5 + 0.5 * wave)
          if (Math.min(1, localDens * 1.35 + (1 - p)) < (bthr[i] ?? 1)) continue
          if (Math.random() < 0.025) bbits[i] = (bbits[i] ?? 0) ^ 1

          const sr = Math.min(255, rC * 1.2)
          const sg = Math.min(255, gC * 1.2)
          const sb = Math.min(255, bC * 1.2)
          const rr = (GREEN[0] + (sr - GREEN[0]) * tintP) | 0
          const gg = (GREEN[1] + (sg - GREEN[1]) * tintP) | 0
          const bb = (GREEN[2] + (sb - GREEN[2]) * tintP) | 0

          bx!.fillStyle = `rgba(${rr},${gg},${bb},${L * gA})`
          bx!.fillText(bbits[i] ? '1' : '0', col * bcell + bcell / 2, r * bcell + bcell / 2)
        }
      }
    }

    size()
    start = performance.now()
    const pr = vid.play()
    if (pr?.catch) pr.catch(() => {})
    raf = requestAnimationFrame(render)

    const onResize = () => size()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [canvasRef, videoRef, active])
}
