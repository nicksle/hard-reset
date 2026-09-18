import type { MouseEvent } from 'react'
import { formatTime } from '../../hooks/useSoundCloudPlayer'
import type { Player } from '../../hooks/useSoundCloudPlayer'
import styles from './TrackPlayer.module.css'

/* Transport for the DJ profile. Presentational only — all state comes from
 * useSoundCloudPlayer, so the same bar drives a live SoundCloud track or the
 * offline simulation without knowing which it is. */

export function TrackPlayer({ player }: { player: Player }) {
  const { playing, ratio, position, duration, title, toggle, seek, frameRef } = player

  const onSeek = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    seek((e.clientX - box.left) / box.width)
  }

  return (
    <div>
      <div className={styles.head}>// NOW PLAYING</div>

      <div className={styles.track}>
        {title ? (
          <>
            {title.title}
            {title.artist && <span className={styles.artist}> · {title.artist}</span>}
            {title.demo && <span className={styles.demo}> [demo]</span>}
          </>
        ) : (
          '— loading track —'
        )}
      </div>

      <div className={styles.row}>
        <button className={styles.play} type="button" onClick={toggle}>
          {playing ? '❚❚ PAUSE' : '▶ PLAY'}
        </button>
        <span className={styles.time}>
          <b>{formatTime(position)}</b> / {formatTime(duration)}
        </span>
      </div>

      <div
        className={styles.prog}
        onClick={onSeek}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.fill} style={{ width: `${ratio * 100}%` }} />
      </div>

      {/* the actual SoundCloud widget, parked off-screen */}
      <iframe ref={frameRef} className={styles.hidden} allow="autoplay" title="SoundCloud audio" />
    </div>
  )
}
