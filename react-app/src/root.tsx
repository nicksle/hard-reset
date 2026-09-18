import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router'
import type { Route } from './+types/root'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import spaceMono400 from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2'
import spaceMono700 from '@fontsource/space-mono/files/space-mono-latin-700-normal.woff2'

export function meta() {
  return [
    { title: 'HARD_RESET // SF' },
    {
      name: 'description',
      content:
        'Hard Reset — techno, electro and indie dance in San Francisco. Every damn Sunday.',
    },
    { property: 'og:site_name', content: 'HARD_RESET' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'theme-color', content: '#050607' },
  ]
}

/* Preload both weights. The whole site is one typeface, so these are on the
 * critical path for the very first thing painted — the boot terminal. */
export function links(): Route.LinkDescriptors {
  return [
    { rel: 'preload', as: 'font', type: 'font/woff2', href: spaceMono400, crossOrigin: 'anonymous' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: spaceMono700, crossOrigin: 'anonymous' },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
        {/* SoundCloud's widget API. If it never arrives the player falls back
            to its simulated transport — see useSoundCloudPlayer. */}
        <script src="https://w.soundcloud.com/player/api.js" defer />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const heading = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'SYSTEM FAULT'
  const detail = isRouteErrorResponse(error)
    ? 'That page is not on the manifest.'
    : 'Something threw. Reload, or head back to the front page.'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12,
        padding: 40,
        fontFamily: 'var(--mono)',
        color: 'var(--green)',
        background: '#000',
      }}
    >
      <div style={{ color: 'var(--green-dim)', fontSize: 12, letterSpacing: 2 }}>
        hard_reset:~$ ./open
      </div>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 400 }}>{heading}</h1>
      <p style={{ color: 'var(--green-dim)' }}>{detail}</p>
      <a href="/hard-reset/" style={{ color: 'var(--magenta)', marginTop: 12 }}>
        ▸ back to the front
      </a>
    </main>
  )
}
