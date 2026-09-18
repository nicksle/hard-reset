import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import type { OverlayPhase } from '../../hooks/useOverlay'
import styles from './TerminalWindow.module.css'

/* The brand's signature device: a fake terminal window.
 * Used as the intro shell, the event details modal and the DJ profile modal.
 * `phase` drives the scaleY collapse/expand. */

interface TerminalWindowProps {
  title: string
  slug?: string
  onClose?: () => void
  /** Return false to suppress the COPIED flash (the OS share sheet is its own feedback). */
  onShare?: () => Promise<boolean> | boolean
  phase?: OverlayPhase
  accent?: string
  className?: string
  children: ReactNode
}

export function TerminalWindow({
  title,
  slug,
  onClose,
  onShare,
  phase,
  accent,
  className = '',
  children,
}: TerminalWindowProps) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const ok = await onShare?.()
    if (ok !== false) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    }
  }

  return (
    <div
      className={[styles.win, phase ? styles[phase] : '', className].filter(Boolean).join(' ')}
      style={accent ? ({ '--acc': accent } as CSSProperties) : undefined}
      role={onClose ? 'dialog' : undefined}
      aria-modal={onClose ? true : undefined}
    >
      <div className={styles.topbar}>
        {onClose ? (
          <button className={styles.close} type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        ) : (
          <span className={styles.dots}>
            <i className={styles.r} />
            <i className={styles.y} />
            <i className={styles.g} />
          </span>
        )}

        <span className={styles.title}>
          {title}
          {slug ? <span className={styles.slug}>{slug}</span> : null}
        </span>

        {onShare && (
          <button
            className={[styles.share, copied ? styles.copied : ''].join(' ')}
            type="button"
            aria-label="Share"
            onClick={share}
          >
            <ShareIcon />
            <span>{copied ? 'COPIED' : 'SHARE'}</span>
          </button>
        )}
      </div>

      <div className={styles.body}>{children}</div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      className={styles.shareIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <line x1="8.1" y1="10.9" x2="15.9" y2="6.2" />
      <line x1="8.1" y1="13.1" x2="15.9" y2="17.8" />
    </svg>
  )
}

/* Web Share with a clipboard fallback.
 * The URL is now the item's own prerendered route, so what lands in someone's
 * chat unfurls as that party or that DJ rather than as the homepage. */
export async function shareOrCopy({
  title,
  text,
  url = window.location.href,
}: {
  title: string
  text: string
  url?: string
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
    } catch { /* dismissed */ }
    return false
  }
  try {
    await navigator.clipboard.writeText(`${text} — ${url}`)
  } catch { /* clipboard blocked — still flash so the button feels alive */ }
  return true
}
