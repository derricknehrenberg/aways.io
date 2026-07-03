# aways.io Design Roadmap — from functional to remarkable

*Created July 2, 2026, after the token-polish approach was rejected. Operating principle: **concept before pixels, divergence before refinement, Derrick's taste as the judge.** He is not a designer but knows what exceptional is — the process must generate genuinely strong options for that taste to select between, never ask it to bless incremental fixes.*

## Diagnosis: why the current site can't get there by iteration

- It wears a **borrowed design system** (Linear's, extracted via getdesign into DESIGN.md). Linear's system expresses Linear's brand — software-craft, dense product screenshots. Applied here it produces competent generic dark-SaaS, which is a *category look*, not an identity.
- The page's one genuinely remarkable asset — **the map, with the JuicyTrails rainbow trail palette** — is boxed into a widget at the bottom. Nothing else on the page could not appear on any B2B site.
- AWAYS has distinctive raw material no competitor can copy: the Grade A standard, the ground-truth/honesty posture, real places, OSM craft heritage, and a beautiful living map. None of it is visually expressed.

**Conclusion: don't refine. Re-conceive.** The Linear DESIGN.md becomes one reference among several, not the foundation.

## Phase D1 — The bar, as defined by Derrick (July 2, 2026) ✅

**Web references** (information honesty): Drudge Report · Craigslist · trackleaders.com · tourdivide.org · Rotten Tomatoes · McDonald's 1996 · Apple 1996 (webdesignmuseum.org). "Websites are for clicking, processing information" — but pure information-processing is *boring*; a site should also convey aesthetics, values, interest. "Old school is the new school."

**Musical/aesthetic references:** Pavement, Talking Heads, Guided by Voices, The Band, Amish Jihad, The Police, Bob Dylan — and above all **Angine de Poitrine** ("changed music"; loves their aesthetic). Their site/stagecraft autopsy: THREE colors only (black, cream, gold); hand-inked wordmark and illustration as the single loud element; plain functional chrome around it; polka-dot pattern as texture; the gold triangle as a repeated physical motif; total commitment. Notably: **their gold triangle ≈ the AWAYS striped-triangle mark.**

### The brief (v1 — for Derrick's sign-off)

- **Feeling in 5 seconds:** "This was made by people who actually walk the ground — and nobody is selling me software."
- **The one thing to remember:** *the honest map people with the beautiful map.*
- **Principles:**
  1. **Honesty of means.** The page looks like what it is: a working document from a working mapping outfit. System/mono/Times-class type, dense, instant-loading, no scroll theater, no SaaS chrome.
  2. **The map is the art.** The only saturated color on the page comes from the map's rainbow trail palette. Everything around it is near-monochrome plus at most one precious accent (gold, per AdP).
  3. **Handmade over corporate.** Hand-drawn/stamped marks welcome; the AWAYS triangle used the way AdP uses their gold triangle — a recurring, almost physical motif.
  4. **Density is respect.** Like Drudge/Craigslist/Trackleaders: real information, one screen, no filler. Lo-fi surface, virtuoso underneath (the Pavement/GBV pattern).
  5. **Wit is allowed.** Old-web conventions used knowingly — plain blue links, a "last updated" stamp, no cookie-banner nonsense.
- **Fixed constraints:** discovery-posture copy; intake invariants (AGENTS.md); no prices/named people; Grade A vocabulary.

## Phase D2 — Divergent concepts (next)

Build **three genuinely different directions**, each a real clickable HTML page in `mockups/` with the actual copy and the real (or faithfully faked) map:

- **A. The Broadsheet** — Drudge/Craigslist bones: Times/system type, plain blue links, dense columns, black-and-white chrome — and the live rainbow map embedded as the page's single blazing color object. 1996 structure, 2026 map.
- **B. Field Station** — Trackleaders/tourdivide energy: monospace, data-dense, live-instrument aesthetic; the page reads as a readout of a region's data quality, map as the instrument display.
- **C. The Poster (AdP)** — maximal handmade: black/cream/gold, pattern textures, hand-inked AWAYS triangle motif, the map presented like a framed print; everything functional kept deliberately plain beneath the art.

Each direction can be built by an independent agent in parallel (opt in with "use a workflow") or sequentially. Derrick reacts: kill, keep, or cross-breed.

**Exit:** one direction chosen (possibly a hybrid), with named elements borrowed from runners-up.

## Phase D3 — Converge and systematize

1. Iterate the chosen direction against the D1 references with screenshot-compare loops until it stands next to them without embarrassment. Multiple rounds; Derrick judges each.
2. Extract the result into **AWAYS's own DESIGN.md** — its palette, type, spacing, and rules — replacing the borrowed Linear file. The system is now downstream of the concept, not upstream.

**Exit:** an approved homepage design + an owned design system.

## Phase D4 — Build it for real

Rebuild the production page to the approved design on a branch: real typography (licensed/hosted fonts if the concept needs them), motion pass (scroll, hover, map entrance), responsive + performance discipline, the intake invariants preserved (form contract, SUBMISSION_URL, vendored style — see AGENTS.md). Merge when Derrick says it's ready, not before.

## Phase D5 — Compounding (ongoing)

- Every future page/section starts from the AWAYS system.
- Quarterly "raise the bar" review against fresh references.
- As Grade A regions and real photography accumulate, feed them back into the site — the design should get *more* concrete over time, not more abstract.

## Tooling map (what exists in Claude Code for this)

| Need | Tool |
|---|---|
| Clickable design explorations | Artifacts (shareable web pages) and/or `mockups/*.html` viewed locally — both already proven patterns here |
| Reference research + autopsy | Chrome browser automation (screenshots of real sites), WebSearch/WebFetch |
| Design-system extraction from admired sites | getdesign (the tool that produced the Linear DESIGN.md) |
| Parallel divergent exploration | Multi-agent workflows (opt in with "use a workflow") |
| Visual iteration loop | Local dev server + browser screenshots, compare against reference captures |
| Judgment | Derrick. Non-delegable. |
