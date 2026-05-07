# aways.io homepage MVP — Plan

**Goal**: live at aways.io via Netlify within an hour. Starter page that lets a prospective client (1) see AWAYS positioning, (2) draw a bbox of their region of interest, (3) submit it with a note + email, (4) book a 15-min scoping call. Likely to change drastically — this is a foothold, not a final design.

## Architecture

- **Framework**: Next.js 15 App Router (scaffolded), TypeScript, Tailwind v4
- **Map**: MapLibre GL JS + OpenStreetMap raster tiles (no API key, free). Custom drag-to-select rectangle interaction (~50 lines, no `mapbox-gl-draw` bloat).
- **Form submission**: Netlify Forms (zero backend; auto-emails my Netlify account)
- **Booking**: Google Calendar appointment scheduling URL (swappable; placeholder until Derrick supplies one)
- **Hosting**: Netlify (`@netlify/plugin-nextjs` auto-detected)

## Why Google Calendar over Calendly

For our flow they're equivalent. Calendly's only edge is rich URL-prefill of custom questions, which we don't need: bbox + note are captured by the Netlify form first, then the user is sent to GCal just to pick a time slot. GCal is reliable, free, and already lives in your existing Google Workspace.

## Page (single page, mobile-first)

1. **Header**: AWAYS logo + small anchor nav (How it works / Schedule)
2. **Hero**: One-sentence positioning + ~3 sentences on Grade A, drawn from the vision doc in B2B register. No prices, no named people.
3. **Map**: full-width MapLibre slippy map, drag-to-select bbox. Coordinates rendered beneath.
4. **Form**: Email (required) + Note (textarea) + hidden bbox field + hidden JOSM Remote Control URL field. POSTs to Netlify Forms.
5. **After submit**: "Now book your 15-min call" → Google Calendar scheduler URL.
6. **Footer**: minimal. Link to juicytrails.com, OSM credit.

## JOSM handoff (manual but one-click)

Each form submission email includes a JOSM Remote Control URL:

```
http://127.0.0.1:8111/load_and_zoom?left=...&right=...&top=...&bottom=...
```

Derrick clicks it before the scoping call with JOSM running locally → bbox loads instantly. No backend integration needed.

## What I'll build (autonomous, this session)

- [ ] `app/layout.tsx` — site-wide layout, metadata, fonts per DESIGN.md
- [ ] `app/page.tsx` — homepage sections
- [ ] `app/globals.css` — Tailwind + DESIGN.md tokens (colors, spacing, type)
- [ ] `components/RegionMap.tsx` — MapLibre map + bbox-draw interaction (client component)
- [ ] `public/AWAYS_logo.svg` — move from repo root into `/public/` so Next can serve it
- [ ] `public/__forms.html` — hidden static form for Netlify Forms build-time detection (App Router workaround)
- [ ] `netlify.toml` — explicit build config
- [ ] `CLAUDE.md` — replace stub with real project doc
- [ ] Commit + push to `main` as work progresses

## Handoff points (where I pull you in)

| When | What I need from you |
|---|---|
| **HANDOFF 1** — in parallel with build (now) | Set up Google Calendar appointment scheduling for a 15-min "AWAYS scoping call" and grab the URL. Paste when ready. |
| **HANDOFF 2** — after first push | Connect this GitHub repo to Netlify (same flow as juicytrails.com / juicycuz.com). Defaults are fine; plugin auto-detects Next.js. |
| **HANDOFF 3** — after Netlify deploys to its subdomain | Add `aways.io` as custom domain in Netlify, configure DNS at Namecheap. |
| **HANDOFF 4** — once HANDOFF 1 returns | Paste the GCal URL; I swap it in and push. |

## Risks / tradeoffs

- **DNS propagation** may exceed the hour. Netlify's auto-subdomain (e.g. `aways-io.netlify.app`) works immediately as a fallback to demo from.
- **OSM raster tiles** are rate-limited per the OSM tile usage policy. Fine for early traffic; swap to MapTiler / Stadia / our own tiles when traffic justifies.
- **Netlify Forms with App Router** requires a hidden static form at `public/__forms.html` for build-time detection. Standard workaround.

## Out of scope (later iterations)

- JuicyTrails MapLibre vector style + PMTiles integration (will look prettier; not needed for starter)
- Multi-page IA (`/grade-a`, `/about`, `/customers`, etc.)
- Polished marketing copy past the starter draft
- Auth, dashboards, CRM hooks
- AI-assisted bbox-to-jurisdiction lookup
