"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

type BBox = { west: number; south: number; east: number; north: number };

const DEFAULT_CENTER: [number, number] = [-106.92, 38.87]; // Crested Butte
const DEFAULT_ZOOM = 8;
const STYLE_URL = "/liberty-style.json";
const TRAILS_PMTILES_URL =
  "pmtiles://https://pub-a1acba1578d9437aaa71b986c790e914.r2.dev/us_trails.pmtiles";

const BOOK_URL = "https://calendar.app.google/HcRztFz6DJevB5776";

// Paste the deployed Google Apps Script Web app URL here once set up.
// Form submissions append a row to your "AWAYS scoping requests" Google Sheet.
// Setup instructions: scripts/aways-intake.gs
const SUBMISSION_URL =
  "https://script.google.com/macros/s/AKfycbzb_QclRSP9xN3BLbqD9VsKsRG9IOnG2pLNDWkWSvzi9WEvBscssCmJZhiSEl0U3CiCJA/exec";

declare global {
  interface Window {
    applyJuicyTrailsColorOverrides?: (map: maplibregl.Map) => void;
    addJuicyTrailsLayers?: (map: maplibregl.Map, sourceId: string) => void;
    addJuicyTrailsHillshade?: (map: maplibregl.Map, opts?: object) => void;
    liftJuicyTrailsLabels?: (map: maplibregl.Map) => void;
  }
}

let pmtilesProtocolRegistered = false;
function ensurePmtilesProtocol() {
  if (typeof window === "undefined" || pmtilesProtocolRegistered) return;
  maplibregl.addProtocol("pmtiles", new Protocol().tile);
  pmtilesProtocolRegistered = true;
}

class JtAttributionControl implements maplibregl.IControl {
  private container: HTMLDivElement | null = null;

  onAdd(): HTMLElement {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl attribution-control collapsed";

    const button = document.createElement("button");
    button.className = "attribution-toggle";
    button.type = "button";
    button.title = "Map credits";
    button.innerHTML =
      '<span style="font-family:Georgia,Times,serif;font-size:15px;font-style:italic;font-weight:bold;">i</span>';

    const text = document.createElement("div");
    text.className = "attribution-text";
    text.innerHTML =
      "JuicyTrails &copy; | OpenFreeMap &copy; | MapLibre | Data from OpenStreetMap";

    button.addEventListener("click", () => {
      if (!this.container) return;
      this.container.classList.toggle("collapsed");
      this.container.classList.toggle("expanded");
    });

    this.container.appendChild(button);
    this.container.appendChild(text);
    return this.container;
  }

  onRemove(): void {
    this.container?.parentNode?.removeChild(this.container);
    this.container = null;
  }
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

function formatCoord(n: number) {
  return n.toFixed(5);
}

export default function RegionRequest() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [firstCorner, setFirstCorner] = useState<[number, number] | null>(null);
  const [bbox, setBbox] = useState<BBox | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.addControl(new JtAttributionControl(), "bottom-right");
      map.on("load", () => {
        // 1. JT color palette over Liberty layers
        try { window.applyJuicyTrailsColorOverrides?.(map); } catch (e) { console.warn(e); }

        // 2. Hillshade (AWS Terrarium DEM)
        try { window.addJuicyTrailsHillshade?.(map); } catch (e) { console.warn(e); }

        // 3. Trails PMTiles source + 11 colored trail layers
        try {
          map.addSource("jt-trails", { type: "vector", url: TRAILS_PMTILES_URL });
          window.addJuicyTrailsLayers?.(map, "jt-trails");
        } catch (e) {
          console.warn("JT trails source/layers failed:", e);
        }

        // 4. Lift Liberty labels above trails
        try { window.liftJuicyTrailsLabels?.(map); } catch (e) { console.warn(e); }

        // 5. bbox layers on top of everything
        map.addSource("bbox", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "bbox-fill",
          type: "fill",
          source: "bbox",
          paint: { "fill-color": "#5e6ad2", "fill-opacity": 0.18 },
        });
        map.addLayer({
          id: "bbox-line",
          type: "line",
          source: "bbox",
          paint: { "line-color": "#5e6ad2", "line-width": 2 },
        });
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Click handler for draw mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drawing) return;

    map.getCanvas().style.cursor = "crosshair";

    const onClick = (e: maplibregl.MapMouseEvent) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (!firstCorner) {
        setFirstCorner(lngLat);
      } else {
        const newBbox: BBox = {
          west: Math.min(firstCorner[0], lngLat[0]),
          east: Math.max(firstCorner[0], lngLat[0]),
          south: Math.min(firstCorner[1], lngLat[1]),
          north: Math.max(firstCorner[1], lngLat[1]),
        };
        setBbox(newBbox);
        setDrawing(false);
        setFirstCorner(null);
      }
    };

    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
      map.getCanvas().style.cursor = "";
    };
  }, [drawing, firstCorner]);

  // Render bbox polygon
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("bbox") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      if (bbox) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [bbox.west, bbox.south],
                [bbox.east, bbox.south],
                [bbox.east, bbox.north],
                [bbox.west, bbox.north],
                [bbox.west, bbox.south],
              ],
            ],
          },
        });
      } else {
        src.setData({ type: "FeatureCollection", features: [] });
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [bbox]);

  const drawButtonLabel = !drawing
    ? bbox
      ? "Redraw region"
      : "Draw region"
    : firstCorner
      ? "Click second corner"
      : "Click first corner";

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

  if (submitted) {
    return (
      <div className="rounded-lg border border-hairline bg-surface-1 p-8 max-w-2xl">
        <h3 className="text-xl font-semibold tracking-tight">
          Got your region and note.
        </h3>
        <p className="mt-2 text-ink-muted">
          Last step — pick a 15-minute slot for the scoping call. Use the same
          email on the booking page so we can match it to what you just
          submitted.
        </p>
        <a
          href={BOOK_URL}
          target={BOOK_URL.startsWith("http") ? "_blank" : undefined}
          rel={BOOK_URL.startsWith("http") ? "noreferrer" : undefined}
          className="mt-5 inline-flex items-center rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-on-primary hover:bg-primary-hover transition-colors"
        >
          Book a 15-min scoping call
        </a>
      </div>
    );
  }

  return (
    <form
      name="aways-scoping-request"
      method="POST"
      data-netlify="true"
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6"
    >
      <input type="hidden" name="form-name" value="aways-scoping-request" />
      <input
        type="hidden"
        name="bbox"
        value={bbox ? JSON.stringify(bbox) : ""}
      />
      <input
        type="hidden"
        name="josm_url"
        value={bbox ? bboxToJosmUrl(bbox) : ""}
      />

      <div className="relative">
        <div
          ref={mapContainer}
          className="h-[480px] w-full rounded-lg overflow-hidden border border-hairline outline-none [&_canvas]:outline-none"
        />
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (!drawing) {
                setDrawing(true);
                setFirstCorner(null);
                setBbox(null);
              } else {
                setDrawing(false);
                setFirstCorner(null);
              }
            }}
            className={`rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
              drawing
                ? "bg-primary text-on-primary"
                : "bg-surface-1/95 text-ink border border-hairline hover:bg-surface-2"
            }`}
          >
            {drawButtonLabel}
          </button>
          {bbox && !drawing && (
            <button
              type="button"
              onClick={() => setBbox(null)}
              className="rounded-md px-3 py-2 text-[13px] font-medium bg-surface-1/95 text-ink border border-hairline hover:bg-surface-2 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-muted">
            Region (bounding box)
          </label>
          <div className="mt-2 rounded-md border border-hairline bg-surface-1 p-3 text-[13px] font-mono text-ink-muted leading-relaxed min-h-[68px]">
            {bbox ? (
              <>
                <div>W {formatCoord(bbox.west)} &nbsp; S {formatCoord(bbox.south)}</div>
                <div>E {formatCoord(bbox.east)} &nbsp; N {formatCoord(bbox.north)}</div>
              </>
            ) : (
              <span className="text-ink-tertiary">Draw a region on the map.</span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-[13px] font-medium text-ink-muted">
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@organization.org"
            className="mt-2 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-[14px] placeholder:text-ink-tertiary focus:outline-none focus:border-primary-focus"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-[13px] font-medium text-ink-muted">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            rows={5}
            required
            placeholder="A few sentences about the region, your organization, and what you're hoping to do."
            className="mt-2 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-[14px] placeholder:text-ink-tertiary focus:outline-none focus:border-primary-focus resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!bbox}
          className="rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-on-primary hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Request scoping call
        </button>
      </div>
    </form>
  );
}
