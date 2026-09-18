import styles from './Equalizer.module.css'

interface EqualizerProps {
  bars?: number
  /** sm = lineup chips, md = carousel card, lg = DJ profile. */
  size?: 'sm' | 'md' | 'lg'
  playing?: boolean
}

/** Animated EQ bars. One component for all three sizes on the site. */
export function Equalizer({ bars = 5, size = 'md', playing = true }: EqualizerProps) {
  return (
    <div className={[styles.eq, styles[size], playing ? styles.on : ''].join(' ')} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} style={{ animationDelay: `${((i * 7) % 30) / 100}s` }} />
      ))}
    </div>
  )
}
