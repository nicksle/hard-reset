import { useState } from 'react'
import { Outlet } from 'react-router'
import { IntroGate } from '../components/intro/IntroGate'
import { BinaryBackdrop } from '../components/hero/BinaryBackdrop'
import { Hero } from '../components/hero/Hero'
import { lazyPanel } from '../components/layout/PanelModule'
import { AboutSection } from '../components/about/AboutSection'
import { SignupSection } from '../components/signup/SignupSection'
import { SiteFooter } from '../components/footer/SiteFooter'
import styles from '../components/layout/Site.module.css'

// The three interactive panels are code-split — see PanelModule.
const EventsSection = lazyPanel('parties', () => import('../components/events/EventsSection'))
const TalentSection = lazyPanel('talent', () => import('../components/talent/TalentSection'))
const WorldSection = lazyPanel('world', () => import('../components/world/WorldSection'))

/* The deck. Every route renders this; the children only add metadata.
 *
 * Panel order:
 *   00 IntroGate       boot terminal + INITIALIZE   (overlay, not a panel)
 *   01 Hero            wordmark over the backdrop
 *   02 EventsSection   flier coverflow -> /parties/:id
 *   03 TalentSection   DJ coverflow -> /talent/:id
 *   04 WorldSection    photo globe
 *   05 AboutSection    man page
 *   06 SignupSection   ./subscribe
 *   07 SiteFooter
 *
 * `live` flips when the gate clears: it starts the video decode and the
 * wordmark glitch, and fades the deck in.
 */
export default function SiteLayout() {
  const [live, setLive] = useState(false)

  return (
    <>
      <IntroGate onLaunch={() => setLive(true)} />
      <BinaryBackdrop active={live} />

      <div className={[styles.site, live ? styles.live : ''].join(' ')}>
        <Hero live={live} />
        <div className={styles.body}>
          <EventsSection />
          <TalentSection />
          <WorldSection />
          <AboutSection />
          <SignupSection />
          <SiteFooter />
        </div>
      </div>

      {/* metadata-only children */}
      <Outlet />
    </>
  )
}
