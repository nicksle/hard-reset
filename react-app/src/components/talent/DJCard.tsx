import { Equalizer } from '../ui/Equalizer'
import { accentStyle } from '../../utils/accent'
import type { DJ } from '../../content/types'
import styles from './DJCard.module.css'

interface DJCardProps {
  dj: DJ
  index: number
}

/* A DJ on the carousel. With a photo the type sits over a gradient scrim;
 * without one the card is purely typographic. */
export function DJCard({ dj, index }: DJCardProps) {
  return (
    <article
      className={[styles.card, dj.photo ? styles.hasPhoto : ''].join(' ')}
      style={accentStyle(dj.accent)}
    >
      {dj.photo && (
        <div className={styles.photo} style={{ backgroundImage: `url("${dj.photo}")` }} />
      )}
      <div className={styles.kicker}>{dj.kicker}</div>
      {/* Not a heading: ten card titles inside one panel would wreck the outline. */}
      <div className={styles.name}>{dj.name}</div>
      <div className={styles.role}>{[dj.genre, dj.city].filter(Boolean).join(' · ')}</div>
      <Equalizer bars={5} size="md" />
      <div className={styles.foot}>
        <span className={[styles.tag, dj.tag === 'PAST' ? styles.past : ''].join(' ')}>
          {dj.tag}
        </span>
        <span className={styles.no}>{String(index + 1).padStart(3, '0')}</span>
      </div>
    </article>
  )
}
