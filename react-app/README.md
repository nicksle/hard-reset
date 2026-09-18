# Hard Reset — site

React Router 8 (framework mode) + React 19 + TypeScript strict, prerendered to
static files for GitHub Pages.

**Node 22.22+ required** — React Router 8 won't run below it.

```bash
npm install
npm run dev            # http://localhost:5173/hard-reset/
npm run typecheck      # route typegen + tsc
npm run check:tickets  # the buy-button contract
npm run build          # prerender + pack for Pages
npm run build:domain   # ...for live.hardresetpresents.com (root + CNAME)
```

## Every event and every DJ is its own page

This is the thing the architecture exists for. `/parties/overclock-oct-17` and
`/talent/summers` are real prerendered documents with their own `<title>`,
`og:image` and `og:url`, so a flier link pasted into a group chat unfurls as
*that party* rather than as the homepage.

Adding an event to `src/content/events.ts` adds its page automatically —
`react-router.config.ts` reads that list to build the prerender manifest.

The detail windows are still overlays on the deck, not separate screens. The
URL **mirrors** the overlay rather than owning it (`src/hooks/useDetailRoute.ts`),
because a route that unmounts the instant the URL changes can't play the 360ms
close animation. Deep links, the back button and the close button all work.

## Layout

```
site.config.mjs          ONE switch for the base path + custom domain
react-router.config.ts   prerender manifest, basename, ssr:false
vite.config.ts           base path
scripts/
  pack-pages.mjs         merges the build into build/pages (the Pages root)
  serve-pages.mjs        serves it the way Pages does — use this, not `preview`
verify/
  buy-button.test.tsx    ticket-link states, run in CI before every deploy
src/
  root.tsx               the document, site-wide meta
  routes.ts              / , /parties/:eventId , /talent/:djId
  routes/
    site.tsx             the deck — every route renders this
    home.tsx             metadata only
    event.tsx  dj.tsx    metadata only; the sections read the URL
  content/               all copy and data, typed against types.ts
  styles/                tokens.css + global.css + fonts.css (Space Mono)
  hooks/                 coverflow, binary decode, glitch, player, overlay
  components/
    intro/  hero/  events/  talent/  world/  about/  signup/  footer/
    carousel/            shared coverflow used by events and talent
    layout/              Section / Wrap / SectionHead / PanelModule
    ui/                  TerminalWindow, Overlay, StatusBadge, Equalizer, Reveal
  utils/                 accent map, public-asset path helper
public/media/            hero video, fliers, DJ photos, world/01..21.jpg
```

## Rules of thumb

- **No hex codes in components.** Everything reads a token from
  `styles/tokens.css`. Accent-colored things set `--acc` once at the top and
  let children inherit.
- **Two font tokens, and the difference matters.** `--mono` is Space Mono
  (self-hosted, latin only). `--mono-glyph` is a system mono stack for anything
  drawn out of box-drawing or block characters — Space Mono's subset doesn't
  include them, so ASCII art in `--mono` falls back per glyph and stops lining
  up. The About panel's art uses `--mono-glyph` for exactly this reason.
- **Public assets go through `asset()`** (`src/utils/asset.ts`) so they respect
  the base path. A bare `/media/...` string 404s on Pages.
- **Content is data.** A new party is an object in `content/events.ts`; a new
  DJ is an object in `content/djs.ts`. Set `next: true` on exactly one of each
  to say where the carousels open.
- **One coverflow.** Both carousels are `<Coverflow>` with a different
  `renderCard`. Motion changes land in `hooks/useCoverflow.ts` and apply to both.
- **Vertical scroll is never intercepted.** `useCoverflow` listens for `wheel`
  but returns early unless the gesture is predominantly horizontal. Don't
  "simplify" that check away.
- **The three interactive panels are code-split** (`layout/PanelModule.tsx`).
  They load while the boot log is still typing, which keeps the initial bundle
  under budget. Keep new heavy panels lazy too.

## Deploying to GitHub Pages

Pushing to `main` deploys — `.github/workflows/deploy.yml` typechecks, runs
`check:tickets`, builds and publishes `react-app/build/pages`.

**The site has two possible homes and one switch between them.**
`site.config.mjs` reads `SITE_DOMAIN` and derives everything downstream:

| `SITE_DOMAIN` | base path | CNAME written | served at |
| --- | --- | --- | --- |
| unset | `/hard-reset/` | no | `nicksle.github.io/hard-reset/` |
| `live.hardresetpresents.com` | `/` | yes | `live.hardresetpresents.com` |

In CI it comes from the repo variable of the same name, so moving the site is a
settings change, not a commit. The DNS side — and why the apex stays on Wix —
is in [`docs/HOSTING.md`](../docs/HOSTING.md).

Three things read that one value: Vite's `base`, React Router's `basename`, and
`pack-pages.mjs`, which has to know where the prerendered documents were
nested. They used to be three hardcoded strings. The failure mode when they
disagree is quiet — the build succeeds and every asset 404s — which is why
they're derived rather than repeated.

`build/pages/` **is** the published root:

```
build/pages/index.html            -> /
build/pages/parties/<id>/         -> /parties/<id>
build/pages/assets/, media/       -> /assets, /media
build/pages/404.html              -> the SPA fallback; unknown paths still boot
build/pages/CNAME                 -> custom-domain builds only
```

Note that React Router puts the SPA fallback in a different place depending on
the basename (`build/client/index.html` when nested, `__spa-fallback.html` at
root). `pack-pages.mjs` sorts that out; the thing it's protecting against is
publishing the *homepage* as `404.html`, which makes every mistyped party link
unfurl as the homepage.

To check a build locally the way Pages will actually serve it:

```bash
npm run serve          # http://localhost:4300/hard-reset/
npm run serve:domain   # http://localhost:4300/          (root build)
```

Use those rather than `vite preview`, which has an SPA fallback that will
happily serve the homepage for every deep link and hide a broken prerender.

## Budgets

Measured on the last build:

| Metric | Now | Budget |
| --- | --- | --- |
| Initial JS, gzipped | 115.0 kB | 120 kB |
| CSS, gzipped | 10.5 kB | 20 kB |
| Fonts | 32.5 kB | — |
| Media, total | 2.5 MB | — |

The framework is ~97 kB of that initial figure; app code is the rest. If it
creeps over, the next thing to split is the About/Signup/Footer group.

**LCP element is the boot terminal's text**, not the hero — the gate paints
first and the video doesn't start loading until INITIALIZE. Budget the video as
transfer, not as paint.

## Known gaps

- **No ticket URLs are filled in yet.** The button is wired — it reads
  `ticketUrl`, opens the Wix event page in a new tab, and renders *nothing*
  when the URL is missing. But every event in `content/events.ts` is still
  `null`, so no buy button appears anywhere. Wix slugs carry an unpredictable
  suffix and have to be copied out of the Wix dashboard by hand; the comment
  at the top of `content/events.ts` says where from.
- `og:image` for events points at the placeholder flier **SVG**, which most
  unfurlers won't render. Low priority while site links aren't the share path.
- Signup form has no backend — `SignupSection.submit` is the hook point.
- DJ socials are `#`.
- Copy in `content/site.ts` is still the old "underground" voice, not the
  inclusive brand voice in the design system.
- No `prefers-reduced-motion` handling yet, and panels have no
  `aria-labelledby` — that's the next phase.
