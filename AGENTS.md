<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# aways.io

The public marketing site for AWAYS — the professional Grade A mapping arm of the AWAYS three-arm structure (JuicyTrails / AWAYS / AWAYS AI). Audience is organizations that need authoritative trail and amenity data: counties, recreation districts, state parks, conservation orgs, tourism bureaus, DMOs, resorts, camps, retreat centers, private landowners with public access. Federal agencies are deliberately not in the buyer set.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript
- Tailwind v4 with `@theme` tokens in `app/globals.css` (subset of DESIGN.md, Linear-inspired)
- MapLibre GL JS for the region selector
- `pmtiles` for byte-range trail tile fetching
- Vendored `juicytrails-style.js` for the JT color palette / layers / hillshade pipeline
- Google Apps Script + Google Sheet for form intake (no email notifications)
- Google Calendar appointment scheduling for the 15-min booking step
- Netlify (target host; not yet connected at time of writing)

## File map

- `app/layout.tsx` — root, Inter font, dark canvas, antialiased
- `app/page.tsx` — header / hero / "Tell us about your region" section / footer
- `app/globals.css` — `@theme` tokens, base body styles, JT-style attribution control CSS
- `components/AwaysLogo.tsx` — inline SVG of the AWAYS mark. Bars rendered with `var(--color-canvas)` so they cut as gaps through the white triangle on dark surfaces. `withWordmark` toggle for hero vs header use.
- `components/RegionRequest.tsx` — the only client-component island: MapLibre map, two-click bbox draw, form, post-submit screen, Apps Script POST.
- `public/juicytrails-style.js` — vendored from `github.com/derricknehrenberg/juicytrails-pm-style` via the JuicyTrails app. Don't edit directly; updates flow from the upstream repo.
- `public/AWAYS_logo.svg` — original Illustrator export. The `AwaysLogo` component reimplements it inline so the bar fills can be themed.
- `scripts/aways-intake.gs` — Google Apps Script source for the form-intake web app. Setup steps in its header comment.
- `DESIGN.md` — full Linear-inspired design system (getdesign-generated). Reference for components / tokens we haven't wired yet.
- `PLAN.md` — original homepage MVP plan. Most of it is now built; useful as a record of decisions.

## Region map pipeline

Inside `components/RegionRequest.tsx`, on `map.on('load')`, in this order:

1. `applyJuicyTrailsColorOverrides(map)` — recolors OpenFreeMap Liberty layers to the JT palette
2. `addJuicyTrailsHillshade(map)` — AWS Terrarium DEM hillshade
3. `map.addSource('jt-trails', { type: 'vector', url: 'pmtiles://…us_trails.pmtiles' })` + `addJuicyTrailsLayers(map, 'jt-trails')` — 11 colored trail line layers
4. `liftJuicyTrailsLabels(map)` — pushes Liberty labels above trails
5. App-owned `bbox` source + `bbox-fill` / `bbox-line` layers — drawn on top so the user's selection is always visible

Attribution uses a custom `JtAttributionControl` class — a white pill with an italic "i" toggle that expands to "JuicyTrails © | OpenFreeMap © | MapLibre | Data from OpenStreetMap". Default MapLibre attribution is suppressed via `attributionControl: false` in map options.

PMTiles protocol is registered once per page lifecycle via `ensurePmtilesProtocol()` (idempotent guard against StrictMode double-invocation).

## Region → form → notification flow

Deliberately split between two surfaces, correlated by email:

1. Map draw + form (email, note) → POSTs to a Google Apps Script web app (`SUBMISSION_URL`) → script appends a row to the "AWAYS scoping requests" Google Sheet. Sent as `text/plain` so no CORS preflight is needed.
2. Submission also POSTs to `/` for Netlify Forms as a silent fallback (only fires when deployed on Netlify).
3. After submit, the user sees a "Book a 15-min scoping call" CTA → standard Google Calendar appointment scheduling URL (`BOOK_URL`).
4. Each sheet row includes a pre-built JOSM Remote Control URL — one click loads the bbox in JOSM if Remote Control is running locally.

**Why no emails**: Derrick prefers pull-based surfaces (Sheets, Calendar) over push (inbox). Don't add email-based notifications without asking.

`SUBMISSION_URL` in `components/RegionRequest.tsx` must be set to the deployed Apps Script web app URL for the Sheet flow to work. Deploy steps live in the `scripts/aways-intake.gs` header.

## Conventions

- **Vocabulary**: use "Grade A" on aways.io copy (B2B register). "Juicy" is consumer-facing JT vocabulary; references to the JT app are fine but not as the noun for the threshold.
- **Copy**: no prices, no named team members, no specific sales mechanics in evergreen content. (Mirrors the AWAYS vision-doc conventions.)
- **Brand mark**: header pairs the icon-only logo with the "AWAYS" wordmark in type. Hero uses a bigger icon treatment.
- **Commits**: commit + push after every change (standing rule). Doc-only updates can go directly to `main`.
- **DESIGN.md tokens**: when reaching for a color/spacing/component, check DESIGN.md first and add the token to `@theme` in `globals.css` rather than inventing.

## Pending handoffs

- `SUBMISSION_URL` empty — paste deployed Apps Script web app URL once Derrick has stood up the Sheet + Apps Script.
- Netlify connection — repo not yet linked to a Netlify site. Connect when ready to go live; `@netlify/plugin-nextjs` auto-detects.
- `aways.io` DNS — not yet pointed at Netlify. Configure at Namecheap after the Netlify site is up.

## Known non-blocking warnings

- Server boot: "multiple lockfiles" — Next is inferring workspace root from `~/package-lock.json`. Fix by setting `turbopack.root` in `next.config.ts`. Doesn't affect rendering.
- Browser console: missing sprite icons (`gate`, `cycling`) for some JT trail layers. Liberty's sprite doesn't include those symbols. Trail lines still render; only the icon decorations are skipped.
