import { useState } from 'react'
import type { FormEvent } from 'react'
import { Section, Wrap, SectionHead } from '../layout/Section'
import { Reveal } from '../ui/Reveal'
import { SIGNUP } from '../../content/site'
import styles from './SignupSection.module.css'

/* 06 — ./subscribe. No backend yet: swap the body of `submit` for a fetch to
 * whatever list provider you land on and the rest of the component stands. */

export function SignupSection() {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setNote(`> ACK. ${email} added to the list. LOCATION DROPS SOON.`)
    setEmail('')
  }

  return (
    <Section id="signup">
      <Wrap>
        <Reveal className={styles.panel}>
          <SectionHead>{SIGNUP.head}</SectionHead>
          <p className={styles.blurb}>{SIGNUP.blurb}</p>

          <form className={styles.form} onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={SIGNUP.placeholder}
              aria-label="Email address"
            />
            <button className={styles.btn} type="submit">{SIGNUP.cta}</button>
          </form>

          <div className={styles.note} aria-live="polite">{note}</div>
        </Reveal>
      </Wrap>
    </Section>
  )
}
