import type { ReactNode, HTMLAttributes } from 'react'
import styles from './Section.module.css'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

/** Full-viewport scroll-snap panel. */
export function Section({ className = '', children, ...rest }: SectionProps) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </section>
  )
}

/** Centered max-width column. */
export function Wrap({ className = '', children, ...rest }: SectionProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

interface SectionHeadProps {
  children: ReactNode
  /** The magenta word at the end of the heading. */
  accent?: string
  sub?: string
  /** Fades the heading out as a details window takes over the panel. */
  dimmed?: boolean
  id?: string
}

export function SectionHead({ children, accent, sub, dimmed = false, id }: SectionHeadProps) {
  return (
    <>
      <h2 id={id} className={[styles.head, dimmed ? styles.dimmed : ''].join(' ')}>
        {children}
        {accent ? <span className={styles.accent}>{accent}</span> : null}
      </h2>
      {sub ? <div className={styles.sub}>{sub}</div> : null}
    </>
  )
}
