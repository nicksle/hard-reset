# Adding a party (or a DJ)

Everything on the site — parties, lineups, DJs, fliers — is edited at:

**https://live.hardresetpresents.com/admin/**

(While the domain is still being set up: `https://nicksle.github.io/hard-reset/admin/`)

Saving commits to GitHub, which rebuilds and publishes the site. There's no
separate publish button and no draft state: **if you save it, it goes live**,
usually within two or three minutes.

## Signing in, once

1. Go to https://github.com/settings/tokens?type=beta → *Generate new token*
2. Repository access: **Only select repositories** → `nicksle/hard-reset`
3. Permissions → Repository permissions → **Contents: Read and write**
4. Generate, copy the token
5. On the admin page click **Sign in with Token** and paste it

The token stays in your browser, so this is a one-time thing per device. Give
it a 1-year expiry so it doesn't quietly die the week of a party.

There is no server to run and nothing hosted anywhere for this — the admin page
talks to GitHub directly from your browser.

## Adding a party

**Parties → All parties → Add party**, then drag it into place. The order in
that list is the order of the carousel on the site.

| Field | What to put |
| --- | --- |
| URL slug | `overclock-oct-17` — lowercase, hyphens. **See the warning below.** |
| Date line | `SAT · OCT 17 · 2026` — shown exactly as typed |
| Venue | `THE CAFÉ · SF` or `[UNDISCLOSED WAREHOUSE] · SF` |
| Status | drives the badge and the buy button |
| Price line | `$15 PRESALE · $20 DOOR` |
| Flier | portrait image, about 1080×1350 |
| Wix ticket link | see below — leave empty until you have it |
| Doors open | only the next party needs this; it drives the countdown |
| Lineup | one row per act |
| Open the carousel here | tick on exactly one party |

**The slug is the web address.** `/parties/overclock-oct-17` is what gets pasted
into group chats and printed under a QR code. Changing it later doesn't
redirect — it just breaks every link already out there. Pick it once.

## The ticket link

The site never takes a payment. **BUY TICKETS** is a link out to the party's own
Wix page, where tickets, capacity and the guest list already live.

To get the link: **Wix dashboard → Events → the event → Share → copy the event
page link.** It looks like
`https://www.hardresetpresents.com/event-details/overclock-oct-17-2a9f1`.

**Copy it, don't type it.** Wix adds its own suffix to the end and there's no
way to guess it — a hand-typed URL goes to a 404.

If you don't have the link yet, leave the field empty. The button then doesn't
appear at all, which is deliberate: a BUY TICKETS button that goes nowhere
reads as broken checkout to someone who found the party off a flier, and they
don't try again. An announced party with no button is fine; a dead button is
not.

**Keep the link after the party.** Once a party is set to PAST or SOLD OUT,
the button becomes a quieter **VIEW EVENT PAGE** link to the same Wix page, so
people can still find the details. It never says BUY on a party you can't buy
tickets for.

## Adding a DJ

**DJs → All DJs → Add DJ.** Same idea — list order is carousel order.

Leaving **Photo** empty is a real option, not a gap: those DJs get the
typographic card instead, which is part of the look. **Accent colour** tints
their card and profile window.

Social links left empty (or as `#`) simply don't render a button.

## If something goes wrong

The build checks the content before publishing, so a bad entry stops the deploy
instead of shipping a broken page. If the site doesn't update after a few
minutes, look at **Actions** in the GitHub repo — a red run will name the file,
the entry and the field, e.g.:

```
ContentError: events.json[3] "overclock-oct-17" — "status" must be one of
"TICKETS LIVE", "EARLY BIRD", "SOLD OUT", "PAST" — got "TIX LIVE"
```

Fix it in the admin and save again. Nothing is lost; every save is a commit, so
the previous version is always recoverable.

## For developers

- Data: `react-app/src/content/data/{events,djs}.json`
- Validation boundary: `react-app/src/content/load.ts` — throws at build time
- Admin config: `react-app/public/admin/config.yml`
- Local check: `npm run check:content`

Adding an entry automatically adds its prerendered page —
`react-router.config.ts` reads these lists to build the prerender manifest.
