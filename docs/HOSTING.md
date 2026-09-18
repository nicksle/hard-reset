# Hosting the React site alongside Wix

## The constraint

`hardresetpresents.com` is a Wix-registered domain pointed at a Wix site, and
Wix **does not allow changing nameservers on a domain it registers**. That rules
out the usual "move the domain to Netlify/Vercel" move.

What Wix *does* allow is editing individual DNS records — A, CNAME, TXT — from
its own DNS panel. That's the entire opening, and it's enough.

Current state, for reference:

```
hardresetpresents.com      A      185.230.63.107 / .171 / .186   (Wix)
www.hardresetpresents.com  CNAME  -> Wix (fronted by Cloudflare)
```

## The plan: subdomain first

```
hardresetpresents.com        Wix site + Wix Events   ← untouched
www.hardresetpresents.com    Wix site                ← untouched
live.hardresetpresents.com   React site on GitHub Pages   ← new
```

Nothing about the Wix side changes. Every `/event-details/<slug>` URL that has
already been shared, printed on a flier, or embedded in an Instagram bio keeps
working, and ticket sales never go through a DNS change. The React site gets a
real HTTPS domain it can be reviewed and shared on, and the apex cutover
becomes a decision to make later rather than a prerequisite.

`live` is one string — `SITE_DOMAIN` in `react-app/package.json` and the
repo variable below. `tickets`, `hq`, `next`, `v2` are all equally fine.

## Step 1 — Wix DNS (Summers)

Wix dashboard → **Domains** → `hardresetpresents.com` → **Manage DNS Records**
→ **CNAME** → *Add Record*:

| Field | Value |
| --- | --- |
| Host name | `live` |
| Value / Points to | `nicksle.github.io` |
| TTL | leave default |

Then save. **Do not touch the existing A records on `@`** — those are what keep
the Wix site and ticketing alive.

Note the trailing-dot convention: Wix wants the bare hostname
`nicksle.github.io`, not a URL and not `nicksle.github.io/hard-reset`. The
repository path is handled by GitHub, not DNS.

Propagation is usually minutes, but Wix quotes up to 48 hours.

## Step 2 — GitHub (Nick / Lindsey)

1. Settings → **Secrets and variables → Actions → Variables** → *New variable*:
   `SITE_DOMAIN` = `live.hardresetpresents.com`
2. Settings → **Pages** → Source: **GitHub Actions**
3. Push to `main`. `.github/workflows/deploy.yml` builds `react-app/` and
   publishes it.
4. Settings → **Pages** → Custom domain: `live.hardresetpresents.com` → Save.
   GitHub verifies the CNAME from step 1, so do this after DNS has propagated.
5. Wait for the certificate, then tick **Enforce HTTPS**.

Order matters. Setting the custom domain before DNS resolves gives a red
"domain does not resolve" banner and the HTTPS checkbox stays greyed out until
it's re-saved.

### Why `SITE_DOMAIN` is a repo variable

Setting it flips `react-app/site.config.mjs` from `base: '/hard-reset/'` to
`base: '/'` and makes the build write a `CNAME` file. Pages drops a custom
domain on any deploy that doesn't include `CNAME` at the published root, so the
file is regenerated every build rather than committed once and forgotten.

Unset the variable and the next deploy goes back to
`nicksle.github.io/hard-reset/` cleanly.

## Step 3 — verify

```bash
# DNS points at Pages
dig +short live.hardresetpresents.com
# -> nicksle.github.io. then 185.199.108-111.153

# the apex is still Wix — this must not change
dig +short hardresetpresents.com
# -> 185.230.63.x

# deep links serve their own document, not the homepage
curl -s https://live.hardresetpresents.com/parties/overclock-oct-17 | grep -o '<title>[^<]*</title>'
# -> HARD_RESET — SAT · OCT 17 · 2026 · ...

# and ticketing is untouched
curl -sI https://www.hardresetpresents.com/ | head -1
```

Locally, `npm run serve:domain` serves the root-based build the way Pages will.

## Later: taking the apex

When the React site should *be* `hardresetpresents.com`:

1. Move the Wix site to its own subdomain first (`tickets.hardresetpresents.com`),
   in Wix → Domains → *Assign to a different site* / connect as subdomain. This
   needs a Wix Premium plan and it **changes every existing event URL** — so
   every `ticketUrl` in `react-app/src/content/events.ts` gets re-pasted, and
   any flier or link-in-bio pointing at the old apex URLs is dead.
2. Only then repoint the apex A records to GitHub:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   and `www` CNAME → `nicksle.github.io`.
3. `SITE_DOMAIN` = `hardresetpresents.com`.

Step 1 is the expensive one and it is not reversible for links already in the
wild. There is no hurry: the subdomain works, and the apex can move on a slow
week rather than the week of a party.

## What was ruled out

- **Embedding the React site in Wix** (iframe / HTML component) — the URL stays
  a Wix URL, deep links don't unfurl, and the boot sequence runs inside a box.
- **Rebuilding in Wix Studio / Velo** — throws away the whole reason the React
  port exists.
- **Moving the domain registration off Wix** — possible, but it takes Wix Events
  down with it and ticketing is the one thing that cannot break.
