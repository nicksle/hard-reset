import { useRef } from 'react'
import { useGlitchIn } from '../../hooks/useGlitchIn'
import wordmark from '../../assets/wordmark.svg?raw'
import styles from './Wordmark.module.css'

/* The logo. The SVG is inlined (?raw) rather than an <img> so the glitch pass
 * can rasterize it at device resolution.
 *
 * This carries the page's <h1>: the visible mark is an image, so the heading
 * sits behind it, visually hidden but first in the outline. */

export function Wordmark({ animate }: { animate: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGlitchIn(hostRef, animate)

  return (
    <>
      <h1 className={styles.srOnly}>HARD RESET — techno and electro in San Francisco</h1>
      <div
        ref={hostRef}
        className={styles.logo}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: wordmark }}
      />
    </>
  )
}
