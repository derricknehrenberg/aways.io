"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

type BBox = { west: number; south: number; east: number; north: number };

const DEFAULT_CENTER: [number, number] = [-106.95, 38.75]; // Gunnison Valley
const DEFAULT_ZOOM = 10;
const STYLE_URL = "/liberty-style.json";
const TRAILS_PMTILES_URL =
  "pmtiles://https://pub-a1acba1578d9437aaa71b986c790e914.r2.dev/us_trails-v2-hd.pmtiles";

const BOOK_URL = "https://calendar.app.google/HcRztFz6DJevB5776";

// Deployed Google Apps Script Web app URL ("AWAYS intake").
// Form submissions append a row to the "AWAYS scoping requests" Google Sheet.
// Setup instructions: scripts/aways-intake.gs
const SUBMISSION_URL =
  "https://script.google.com/macros/s/AKfycbzb_QclRSP9xN3BLbqD9VsKsRG9IOnG2pLNDWkWSvzi9WEvBscssCmJZhiSEl0U3CiCJA/exec";

// Station readout — REAL figures, pulled live from OpenStreetMap via
// Overpass on 2026-07-02 for the frame below (highway = path / footway /
// cycleway / bridleway / track). Refresh manually until the certification
// engine automates the pass. The gaps are the point: this is what a region
// looks like before Grade A.
const READOUT = {
  region: "GUNNISON VALLEY, CO",
  frame: "38.41–39.09 N · 107.21–106.44 W",
  pulled: "2026-07-02",
  segments: "3,484",
  trailMiles: "≈ 2,707",
  named: "1,468 / 3,484 · 42 %",
  surfaced: "1,674 / 3,484 · 48 %",
};

declare global {
  interface Window {
    applyJuicyTrailsColorOverrides?: (map: maplibregl.Map) => void;
    addJuicyTrailsLayers?: (map: maplibregl.Map, sourceId: string) => void;
    addJuicyTrailsHillshade?: (map: maplibregl.Map, opts?: object) => void;
    addJuicyTrailsPeaks?: (map: maplibregl.Map, opts?: object) => void;
    addJuicyTrailsSkiLifts?: (map: maplibregl.Map, opts?: object) => void;
    liftJuicyTrailsLabels?: (map: maplibregl.Map) => void;
  }
}

let pmtilesProtocolRegistered = false;
function ensurePmtilesProtocol() {
  if (typeof window === "undefined" || pmtilesProtocolRegistered) return;
  maplibregl.addProtocol("pmtiles", new Protocol().tile);
  pmtilesProtocolRegistered = true;
}

function loadJtStyleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.applyJuicyTrailsColorOverrides) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-jt-style="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("juicytrails-style.js failed to load"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "/juicytrails-style.js";
    script.dataset.jtStyle = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("juicytrails-style.js failed to load"));
    document.head.appendChild(script);
  });
}

function bboxToJosmUrl(b: BBox): string {
  return `http://127.0.0.1:8111/load_and_zoom?left=${b.west}&right=${b.east}&top=${b.north}&bottom=${b.south}`;
}

// Viewfinder model (same as the JuicyTrails webapp): the frame is fixed on
// screen and the user pans/zooms the map to fit the region inside it. The
// inset here must match .framebox{ inset:14% } in globals.css.
const FRAME_INSET = 0.14;

function frameBBox(map: maplibregl.Map): BBox {
  const el = map.getContainer();
  const w = el.clientWidth, h = el.clientHeight;
  const ix = w * FRAME_INSET, iy = h * FRAME_INSET;
  const sw = map.unproject([ix, h - iy]);
  const ne = map.unproject([w - ix, iy]);
  return {
    west: Math.min(sw.lng, ne.lng),
    south: Math.min(sw.lat, ne.lat),
    east: Math.max(sw.lng, ne.lng),
    north: Math.max(sw.lat, ne.lat),
  };
}

function Tri({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true">
      <use href="#awtri" />
    </svg>
  );
}

export default function RegionRequest() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const armedRef = useRef(false);
  const paintBoxRef = useRef<(b: BBox | null) => void>(() => {});

  const [armed, setArmed] = useState(false);
  const [bbox, setBbox] = useState<BBox | null>(null);
  const [center, setCenter] = useState({ lat: 38.75, lng: -106.95, z: 10 });
  const [submitted, setSubmitted] = useState(false);
  const [attribOpen, setAttribOpen] = useState(false);

  // Keep refs in sync for the map event closures; on arming, seed the live
  // readout with the current frame so the REGION field fills immediately
  useEffect(() => {
    armedRef.current = armed;
    const map = mapRef.current;
    if (!map) return;
    if (armed) setBbox(frameBBox(map));
  }, [armed]);

  // Init map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadJtStyleScript();
      } catch (e) {
        console.warn("JT style script load failed; falling back to Liberty defaults:", e);
      }
      if (cancelled || !mapContainer.current) return;

      ensurePmtilesProtocol();

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.on("load", () => {
        // Same chain as the JuicyTrails webapp
        try { window.applyJuicyTrailsColorOverrides?.(map); } catch (e) { console.warn(e); }
        try { window.addJuicyTrailsHillshade?.(map); } catch (e) { console.warn(e); }
        try {
          map.addSource("jt-trails", { type: "vector", url: TRAILS_PMTILES_URL });
          window.addJuicyTrailsLayers?.(map, "jt-trails");
          window.addJuicyTrailsPeaks?.(map);
          window.addJuicyTrailsSkiLifts?.(map);
        } catch (e) {
          console.warn("JT trails source/layers failed:", e);
        }
        try { window.liftJuicyTrailsLabels?.(map); } catch (e) { console.warn(e); }

        // bbox scratch layers, inked in the station's own hand
        map.addSource("bbox", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "bbox-fill",
          type: "fill",
          source: "bbox",
          paint: { "fill-color": "#16130d", "fill-opacity": 0.06 },
        });
        map.addLayer({
          id: "bbox-line",
          type: "line",
          source: "bbox",
          paint: { "line-color": "#16130d", "line-width": 2, "line-dasharray": [2, 2] },
        });
      });

      // Live center readout chip
      const readout = () => {
        const c = map.getCenter();
        setCenter({ lat: c.lat, lng: c.lng, z: map.getZoom() });
      };
      map.on("move", readout);
      map.on("zoom", readout);

      // Viewfinder frame: while armed, the map moves under a fixed frame and
      // the REGION readout tracks the frame's geographic bounds live. Locking
      // inks the captured box onto the chart.
      const paintBox = (b: BBox | null) => {
        const src = map.getSource("bbox") as maplibregl.GeoJSONSource | undefined;
        if (!src) return;
        src.setData(
          b
            ? {
                type: "FeatureCollection",
                features: [{
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Polygon",
                    coordinates: [[
                      [b.west, b.south], [b.east, b.south], [b.east, b.north],
                      [b.west, b.north], [b.west, b.south],
                    ]],
                  },
                }],
              }
            : { type: "FeatureCollection", features: [] }
        );
      };
      paintBoxRef.current = paintBox;

      map.on("move", () => {
        if (armedRef.current) setBbox(frameBBox(map));
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") ?? ""),
      note: String(formData.get("note") ?? ""),
      bbox,
      josm_url: bbox ? bboxToJosmUrl(bbox) : null,
      submitted_at: new Date().toISOString(),
    };

    // Primary: Google Apps Script Web app → appends a row to the Google Sheet.
    // text/plain content type avoids a CORS preflight; the script reads the raw body.
    if (SUBMISSION_URL.startsWith("http")) {
      try {
        await fetch(SUBMISSION_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("Sheet submission failed:", err);
      }
    }

    // Silent fallback: Netlify Forms (only fires when deployed on Netlify).
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
    } catch {
      // Local dev — silent.
    }
    setSubmitted(true);
  }

  const bboxDisplay = bbox
    ? `${bbox.west.toFixed(4)}, ${bbox.south.toFixed(4)}, ${bbox.east.toFixed(4)}, ${bbox.north.toFixed(4)}`
    : "";

  return (
    <div className="instrument">
      <div className="inst-head">
        <span>INSTRUMENT 01 — LIVE READOUT · EXAMPLE REGION: GUNNISON VALLEY, COLORADO, USA</span>
        <span className="dim">TILESET us_trails-v2-hd.pmtiles · BASE liberty/openfreemap · DATUM WGS84</span>
      </div>

      {/* ---- left rail ---- */}
      <div className="rail">
        <section>
          <h2><Tri className="tri" /> Station readout</h2>
          <p className="sub">example region · figures pulled live from OSM · {READOUT.pulled}</p>
          <div className="ledger">
            <div className="lrow"><span className="k">REGION</span><span className="lead" /><span className="v">{READOUT.region}</span></div>
            <div className="lrow"><span className="k">FRAME</span><span className="lead" /><span className="v">{READOUT.frame}</span></div>
            <div className="lrow"><span className="k">SEGMENTS MAPPED</span><span className="lead" /><span className="v">{READOUT.segments}</span></div>
            <div className="lrow"><span className="k">TRAIL MILES</span><span className="lead" /><span className="v">{READOUT.trailMiles}</span></div>
            <div className="lrow"><span className="k">NAMED</span><span className="lead" /><span className="v">{READOUT.named}</span></div>
            <div className="lrow"><span className="k">SURFACE TAGGED</span><span className="lead" /><span className="v">{READOUT.surfaced}</span></div>
            <div className="lrow"><span className="k">FIELD SURVEY</span><span className="lead" /><span className="v">on foot · by bike · by ski</span></div>
            <div className="lrow"><span className="k">GRADE</span><span className="lead" /><span className="v"><b>IN ASSESSMENT</b></span></div>
            <p className="note">
              Real figures from the public OpenStreetMap database — gaps included.
              This is what a region looks like before Grade A. Nothing here is
              proprietary; the accuracy is the deliverable.
            </p>
          </div>
        </section>

        <section>
          <h2><Tri className="tri" /> Line key — trail classes</h2>
          <div className="key">
            <div><span className="sw" style={{ background: "rgb(236,82,250)" }} />Hike</div>
            <div><span className="sw" style={{ background: "rgb(150,49,252)" }} />Hike + Horse</div>
            <div><span className="sw" style={{ background: "#faba0a" }} />Bicycle</div>
            <div><span className="sw" style={{ background: "rgb(255,128,0)" }} />Bicycle + Horse</div>
            <div><span className="sw" style={{ background: "rgb(0,0,255)" }} />Bike Rec Path</div>
            <div><span className="sw" style={{ background: "rgb(2,115,17)" }} />Motorcycle</div>
            <div><span className="sw" style={{ background: "rgb(91,197,52)" }} />ATV</div>
            <div><span className="sw dash-p" />Path</div>
            <div><span className="sw" style={{ background: "rgb(159,89,15)" }} />Track</div>
            <div><span className="sw dash-b" />4WD Track</div>
            <div><span className="sw dash-r" />Informal Path</div>
            <div><span className="sw" style={{ background: "rgb(146,101,174)" }} />Sidewalk &amp; Footpath</div>
            <div><span className="sw dash-k" />No Access</div>
          </div>
        </section>

        <section className="request">
          <h2><Tri className="tri" /> Show us your region</h2>
          {submitted ? (
            <div className="received">
              <div className="head">// TRANSMISSION RECEIVED [OK]</div>
              <p>
                Got your region and note. Last step — pick a 15-minute slot for
                the scoping call. Use the same email on the booking page so we
                can match it to what you just sent.
              </p>
              <a className="book" href={BOOK_URL} target="_blank" rel="noreferrer">
                [ BOOK THE 15-MIN CALL ]
              </a>
            </div>
          ) : (
            <>
              <p>
                Frame the area on your mind — pan and zoom the chart until it
                fits the box, then lock it. Tell us about
                your organization and the situation in your own words — however
                it looks from where you sit. We&apos;ll get back to you to
                schedule the call.
              </p>
              <form
                name="aways-scoping-request"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="form-name" value="aways-scoping-request" />
                <input type="hidden" name="bbox" value={bbox ? JSON.stringify(bbox) : ""} />
                <input type="hidden" name="josm_url" value={bbox ? bboxToJosmUrl(bbox) : ""} />

                <div className="field">
                  <label htmlFor="bbox-display">
                    <span>Region</span>
                    <span className="st">{bbox ? "bounding box · W,S,E,N [OK]" : "bounding box · W,S,E,N"}</span>
                  </label>
                  <input
                    id="bbox-display"
                    type="text"
                    readOnly
                    value={bboxDisplay}
                    placeholder="— frame on the chart →"
                  />
                </div>
                <div className="btnrow" style={{ margin: "-4px 0 14px" }}>
                  <button
                    type="button"
                    className={`ghost${armed ? " armed" : ""}`}
                    onClick={() => {
                      const map = mapRef.current;
                      if (!armed) {
                        paintBoxRef.current(null); // clear a previously locked box
                        setArmed(true);
                        // On stacked (mobile) layout the map is above the form —
                        // bring it into view so "armed" doesn't strand the user
                        if (window.innerWidth <= 1060) {
                          mapContainer.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      } else {
                        if (map) {
                          const b = frameBBox(map);
                          setBbox(b);
                          paintBoxRef.current(b);
                        }
                        setArmed(false);
                      }
                    }}
                  >
                    {armed ? "[ LOCK THIS FRAME ]" : bbox ? "[ REFRAME ]" : "[ FRAME REGION ON MAP ]"}
                  </button>
                </div>

                <div className="field">
                  <label htmlFor="email"><span>Your email</span></label>
                  <input id="email" name="email" type="email" required placeholder="you@organization.org" />
                </div>
                <div className="field">
                  <label htmlFor="note"><span>Note</span></label>
                  <textarea id="note" name="note" required placeholder="What's going on in your region?" />
                </div>
                <div className="btnrow">
                  <button type="submit" disabled={!bbox}>Request scoping call</button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>

      {/* ---- map ---- */}
      <div className="mapcell">
        <div ref={mapContainer} className="map" />
        {armed && <div className="framebox" aria-hidden="true" />}

        <svg className="xhair" viewBox="0 0 38 38" aria-hidden="true">
          <g stroke="#16130d" strokeWidth="1.5">
            <line x1="19" y1="0" x2="19" y2="13" />
            <line x1="19" y1="25" x2="19" y2="38" />
            <line x1="0" y1="19" x2="13" y2="19" />
            <line x1="25" y1="19" x2="38" y2="19" />
          </g>
        </svg>

        <div className="chip tl">DRAG TO PAN · SCROLL TO ZOOM · HILLSHADE ON</div>
        <div className="chip bl">
          {`CTR ${center.lat.toFixed(4)} ${center.lat >= 0 ? "N" : "S"} · ${Math.abs(center.lng).toFixed(4)} ${center.lng <= 0 ? "W" : "E"} · Z ${center.z.toFixed(1)}`}
        </div>
        <button
          type="button"
          className="chip br attrib"
          onClick={() => setAttribOpen((o) => !o)}
          aria-expanded={attribOpen}
          aria-label={attribOpen ? "Hide map attribution" : "Show map attribution"}
        >
          {attribOpen && (
            <span>JUICYTRAILS © · OPENFREEMAP © · MAPLIBRE · DATA FROM OPENSTREETMAP&ensp;</span>
          )}
          <i>i</i>
        </button>

        {/* the one gold thing on this page */}
        <svg className="seal" viewBox="0 0 200 200" aria-label="Grade A seal">
          <defs>
            <path id="sealArc" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0" />
          </defs>
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="3.5" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text
            fontFamily="ui-monospace, Menlo, Consolas, 'Courier New', monospace"
            fontSize="12.5" letterSpacing="2.6" fill="currentColor" fontWeight="700"
          >
            <textPath href="#sealArc">AWAYS · FIELD VERIFIED · KEPT CURRENT ·</textPath>
          </text>
          <use href="#awtri" x="86" y="56" width="28" height="28" />
          <text
            x="100" y="95" textAnchor="middle"
            fontFamily="ui-monospace, Menlo, Consolas, 'Courier New', monospace"
            fontSize="11" letterSpacing="4" fill="currentColor" fontWeight="700"
          >GRADE</text>
          <text
            x="100" y="141" textAnchor="middle"
            fontFamily="ui-monospace, Menlo, Consolas, 'Courier New', monospace"
            fontSize="52" fill="currentColor" fontWeight="700"
          >A</text>
        </svg>
      </div>
    </div>
  );
}
