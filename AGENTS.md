<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# aways.io

The public marketing site for AWAYS — the professional Grade A mapping arm of the AWAYS three-arm structure (JuicyTrails / AWAYS / AWAYS AI). Audience is organizations that need authoritative trail and amenity data: counties, recreation districts, state parks, conservation orgs, tourism bureaus, DMOs, resorts, camps, retreat centers, private landowners with public access. Federal agencies are deliberately not in the buyer set.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript
- **Design: "FIELD STATION"** (chosen July 2026, see DESIGN-ROADMAP.md) — monospace
  system stack, paper/ink/gold palette (`--paper #f5f1e6`, `--ink #16130d`,
  `--gold #b8921f`), custom CSS in `app/globals.css`. Square corners, 2px ink
  borders, old-web link colors, wit-with-intent (live UTC clock, blinking
  cursors, [OK] flags). The old Linear-derived DESIGN.md is superseded —
  reference only. Brand mark: **Mark 03 "The Field"** (`public/mark-03.svg`,
  favicon `app/icon.svg`) — gold Grade A region holding the black mountain.
- MapLibre GL JS for the region selector; `pmtiles` for byte-range tile fetching
- Vendored `juicytrails-style.js` for the JT palette / layers / hillshade / peaks / ski lifts
- Google Apps Script + Google Sheet for form intake (no email notifications)
- Google Calendar appointment scheduling for the 15-min booking step
- Netlify (live; push to `main` = production deploy)

## Station readout figures

The ledger in `components/RegionRequest.tsx` (`READOUT` constant) holds REAL
figures pulled from OpenStreetMap via Overpass for the Gunnison frame
(38.41–39.09 N, 107.21–106.44 W; highway=path|footway|cycleway|bridleway|track).
Last pulled 2026-07-02. Refresh manually (Overpass count queries + geometry
length sum) until the certification engine automates the pass — never invent
figures; honest gaps (42% named) are deliberate: "this is what a region looks
like before Grade A." GRADE reads IN ASSESSMENT until a real certification
exists.

## File map

- `app/layout.tsx` — root, metadata, system mono via globals
- `app/page.tsx` — masthead (clock) / hero (Mark 03) / instrument / transmission / footer; defines the shared `#awtri` SVG symbol every mark stamps from
- `app/globals.css` — the whole Field Station design system (custom CSS, element-level)
- `app/icon.svg` — Mark 03 favicon
- `components/StationClock.tsx` — ticking UTC clock (client)
- `components/AwaysLogo.tsx` — LEGACY striped mark, no longer rendered (kept for history)
- `components/RegionRequest.tsx` — the instrument: readout ledger (`READOUT` constant), line key, request form, MapLibre map with viewfinder-frame region select (fixed on-screen frame, pan/zoom the map to fit, lock — same model as the JuicyTrails webapp; works on touch; `FRAME_INSET` must match `.framebox` inset in globals.css), live center chip, Grade A seal, post-submit screen, Apps Script POST.
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

Attribution is a Field Station chip (`.chip.attrib`, bottom-right): collapsed to an italic serif "i", click-expands to "JUICYTRAILS © · OPENFREEMAP © · MAPLIBRE · DATA FROM OPENSTREETMAP" (July 2026; replaced the earlier static bar and the JT webapp's `JtAttributionControl` pill). Default MapLibre attribution is suppressed via `attributionControl: false` in map options.

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
- **Commits**: commit + push after every change (standing rule), on `dev` by default. `dev` = staging (branch deploy at https://dev--aways-io.netlify.app, enabled July 5, 2026), `main` = production — same convention as the JuicyTrails webapp. Preview on the dev URL, then merge `dev` → `main` to ship. Doc-only updates can go directly to `main`.
- **DESIGN.md tokens**: when reaching for a color/spacing/component, check DESIGN.md first and add the token to `@theme` in `globals.css` rather than inventing.

## Live infrastructure (completed July 2, 2026 — handoffs done)

The site is LIVE. Every push to `main` auto-deploys to production at aways.io.

- **Apps Script intake**: deployed as web app "AWAYS intake" (execute as Derrick, access: Anyone), bound to the "AWAYS scoping requests" Google Sheet. Its URL is wired into `SUBMISSION_URL` in `RegionRequest.tsx`. Verified end-to-end (test POST → sheet row).
- **Netlify**: project `aways-io` on the AWAYS team, deploys from GitHub `main`, Next.js Runtime auto-detected. Form detection enabled; `aways-scoping-request` form registered via `public/__forms.html`.
- **DNS** (Namecheap): `A @ → 75.2.60.5`, `CNAME www → aways-io.netlify.app`. Let's Encrypt cert via Netlify.
- **Baseline tag**: `v0-intake-baseline` marks the verified-working intake flow. If a redesign breaks the map or form, diff against or roll back to this tag.

## Redesign invariants — do not break while iterating on content/design

The July 2026 site is a functional test of the draw-region + scoping-call flow, not final content — a substantial content/design pass is expected. While making it:

1. **Form field names** (`email`, `note`, `bbox`, `josm_url`; form name `aways-scoping-request`) are contract-bound in three places: `RegionRequest.tsx`, `public/__forms.html`, and the Apps Script `doPost`. Change them in lockstep or not at all.
2. **`SUBMISSION_URL`** must keep pointing at the deployed Apps Script; the POST stays `text/plain` (avoids CORS preflight).
3. **`public/juicytrails-style.js`** stays vendored — never edit it here.
4. **Pushes to `main` go straight to production.** Work on `dev` and preview at https://dev--aways-io.netlify.app before merging; the commit-after-every-change rule still applies on `dev`.

## Known non-blocking warnings

- Server boot: "multiple lockfiles" — Next is inferring workspace root from `~/package-lock.json`. Fix by setting `turbopack.root` in `next.config.ts`. Doesn't affect rendering.
- Browser console: missing sprite icons (`gate`, `cycling`) for some JT trail layers. Liberty's sprite doesn't include those symbols. Trail lines still render; only the icon decorations are skipped.
