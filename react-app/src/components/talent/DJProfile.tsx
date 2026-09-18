import { TerminalWindow, shareOrCopy } from '../ui/TerminalWindow'
import { Overlay } from '../ui/Overlay'
import { Equalizer } from '../ui/Equalizer'
import { TrackPlayer } from './TrackPlayer'
import { useSoundCloudPlayer } from '../../hooks/useSoundCloudPlayer'
import { accentVar } from '../../utils/accent'
import type { DJ } from '../../content/types'
import type { OverlayPhase } from '../../hooks/useOverlay'
import styles from './DJProfile.module.css'

/* The DJ terminal: the card blown up on the left, the player and facts on the
 * right. The window takes the DJ's accent.
 *
 * Mounted only while the overlay is open — the player binds to the widget on
 * mount and dies with the iframe on close, so no audio outlives the window. */

interface DJProfileProps {
  dj: DJ
  phase: OverlayPhase
  onClose: () => void
}

export function DJProfile({ dj, phase, onClose }: DJProfileProps) {
  const player = useSoundCloudPlayer(dj.track)

  return (
    <Overlay phase={phase} onBackdropClick={onClose}>
      <TerminalWindow
        phase={phase}
        accent={accentVar(dj.accent)}
        title="hard_reset:~/talent$ ./profile "
        slug={dj.id}
        onClose={onClose}
        onShare={() => shareOrCopy({ title: `Hard Reset — ${dj.name}`, text: dj.name })}
      >
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={[styles.hero, dj.photo ? styles.hasPhoto : ''].join(' ')}>
              {dj.photo && (
                <div className={styles.photo} style={{ backgroundImage: `url("${dj.photo}")` }} />
              )}
              <div className={styles.kicker}>{dj.kicker}</div>
              <div className={styles.name}>{dj.name}</div>
              <div className={styles.role}>{[dj.genre, dj.city].filter(Boolean).join(' · ')}</div>
              <Equalizer bars={12} size="lg" playing={player.playing} />
            </div>

            <div className={styles.socials}>
              {Object.entries(dj.socials).map(([k, href]) => (
                <a key={k} className={styles.soc} href={href} target="_blank" rel="noreferrer">
                  {k.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.right}>
            <TrackPlayer player={player} />
            <dl className={styles.meta}>
              <div className={styles.row}>
                <dt className={styles.k}>GENRE</dt>
                <dd className={styles.v}>{dj.genre}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.k}>CITY</dt>
                <dd className={styles.v}>{dj.city ?? 'SF'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </TerminalWindow>
    </Overlay>
  )
}
