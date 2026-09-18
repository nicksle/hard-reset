import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

/* The URL mirrors overlay state; it does not own it.
 *
 * The terminal windows animate out over 360ms. If the route owned the overlay,
 * navigating away would unmount it instantly and eat that animation — so the
 * section keeps `phase` in local state and uses this to push the URL alongside
 * it. Reading `routeId` back covers deep links, the back button, and someone
 * pasting a link into a fresh tab.
 */

export interface DetailRoute {
  /** The id in the URL when this section's detail route is active. */
  routeId: string | undefined
  /** Push the detail URL — creates a history entry so Back closes the window. */
  openTo: (id: string) => void
  /** Replace back to the page root — Back shouldn't reopen what you just closed. */
  closeTo: () => void
}

export function useDetailRoute(prefix: string): DetailRoute {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const match = pathname.startsWith(`${prefix}/`)
  const routeId = match ? pathname.slice(prefix.length + 1).split('/')[0] || undefined : undefined

  const openTo = useCallback(
    (id: string) => {
      // preventScrollReset is not optional here: the detail window is an
      // overlay on the panel you're already looking at, so ScrollRestoration
      // resetting to the top would yank the deck out from under it.
      navigate(`${prefix}/${id}`, { preventScrollReset: true })
    },
    [navigate, prefix],
  )

  const closeTo = useCallback(() => {
    navigate('/', { replace: true, preventScrollReset: true })
  }, [navigate])

  return { routeId, openTo, closeTo }
}
