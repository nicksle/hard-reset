import type { ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'
import styles from './Reveal.module.css'

interface RevealProps {
  className?: string
  children: ReactNode
}

/** Fades + lifts its children in when they scroll into view. */
export function Reveal({ className = '', children }: RevealProps) {
  const [ref, shown] = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={[styles.reveal, shown ? styles.show : '', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
