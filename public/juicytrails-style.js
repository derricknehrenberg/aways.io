/**
 * juicytrails-style.js
 * ─────────────────────────────────────────────────────────────────
 * Source repo:  github.com/derricknehrenberg/juicytrails-pm-style
 * Update flow:  edit in pm-style, verify in preview.html, then run
 *               bin/sync-to-webapp.sh to push the file into consumer
 *               repos. Vendored copies in consumers (juicytrailswebapp,
 *               juicycuz, etc.) should not be edited directly — edits
 *               are overwritten on the next sync.
 *
 * JuicyTrails map style for MapLibre GL JS (open-source port of
 * the JuicyTrails-USA Mapbox style). Exports:
 *
 *   applyJuicyTrailsColorOverrides(map)          ← USE THIS IN PRODUCTION
 *     Applies JuicyTrails colors to an already-loaded MapLibre map
 *     instance via setPaintProperty. Call inside map.on('load', …).
 *     This is the production-safe method — no pre-load fetch required.
 *
 *   applyJuicyTrailsColors(styleJSON)             ← for pre-load use only
 *     Mutates an OpenFreeMap Liberty style JSON object in-place.
 *     Only use this if you fetch the style JSON yourself before map init.
 *
 *   addJuicyTrailsLayers(map, sourceId)
 *     Adds all 12 color-coded trail line layers to an already-loaded
 *     MapLibre map instance. Call inside map.on('load', …) after source.
 *
 *   addJuicyTrailsHillshade(map, options?)
 *     Adds the AWS Terrarium DEM source and a JT-styled hillshade
 *     layer. Idempotent. Options can override DEM URL, exaggeration,
 *     individual paint props, and beforeId.
 *
 *   addJuicyTrailsContours(map, options?)
 *     Adds DEM source via mlcontour, registers a zoom listener that
 *     lazy-loads contour-lines and contour-labels at z≥12. Requires
 *     the mlcontour plugin to be loaded as a global; warns and noops
 *     if missing. contour-lines is placed before 'water' so it
 *     renders above terrain colors but below water/roads/trails.
 *
 *   addJuicyTrailsPeaks(map, options?)
 *     Adds mountain-peak icons + name/elevation labels from the Liberty
 *     base source (openmaptiles mountain_peak), which Liberty ships but
 *     never styles. No-op-safe on non-Liberty bases.
 *
 *   addJuicyTrailsSkiLifts(map, options?)
 *     Adds ski-lift / aerialway lines from the Liberty base source
 *     (openmaptiles transportation, class=aerialway). Liberty draws lift
 *     station icons but no lift lines. No-op-safe on non-Liberty bases.
 *
 *   liftJuicyTrailsLabels(map)
 *     Moves every base-map symbol layer (place/road/water labels, road
 *     & highway shields, POI icons + names, airport labels, one-way
 *     arrows) to the top of the layer stack so it renders above trails.
 *     Excludes contour-labels and JT's own jt-* symbol layers so Liberty
 *     place labels win symbol collisions against them.
 *
 * Color/filter source: JuicyTrails-USA Mapbox style (cmkkgcpzb000c01rfhttf0z47)
 */

// Shipped style version. Keep in sync with the top entry in CHANGELOG.md.
// Lets a deployed (vendored) copy report which version it is — read it in
// the browser console as JT_STYLE_VERSION to confirm what's running.
const JT_STYLE_VERSION = '0.6.1';

// ── BASE MAP COLOR PALETTE (from style.json) ──────────────────────
const JT_COLORS = {
    // Land
    land: 'hsl(60, 20%, 85%)',
    residential: 'hsl(60, 7%, 87%)',
    // Vegetation
    wood: 'hsla(103, 50%, 60%, 0.7)',
    grass: 'hsla(98, 50%, 74%, 0.6)',
    sand: 'hsl(69, 60%, 72%)',
    // Parks
    park: 'hsl(98, 38%, 68%)',
    parkOutline: 'hsl(98, 38%, 58%)',
    cemetery: 'hsl(98, 45%, 75%)',
    // POI landuse
    hospital: 'hsl(20, 45%, 82%)',
    school: 'hsl(40, 45%, 78%)',
    airport: 'hsl(230, 36%, 74%)',
    // Water
    water: 'hsl(205, 75%, 70%)',
    waterText: 'hsl(205, 60%, 45%)',
    // Buildings
    building: 'hsl(50, 15%, 75%)',
    buildingOut: 'hsl(60, 10%, 65%)',
    // Roads — warm cream/tan palette
    roadMinor: '#f0ede8',
    roadMajor: '#e8e0c8',
    roadPrimary: '#d6c89a',
    roadMotorway: '#d4a76a',
    roadCasing: '#c9b98a',
    // Admin & labels
    adminBndry: 'hsl(60, 10%, 55%)',
    textDark: 'hsl(60, 10%, 25%)',
    textHalo: 'hsl(60, 20%, 92%)',
};

// ── BASE LAYER OVERRIDES ──────────────────────────────────────────
// Maps OpenFreeMap Liberty layer IDs → paint property overrides
const JT_BASE_OVERRIDES = {
    'background': { 'background-color': JT_COLORS.land },
    'park': { 'fill-color': JT_COLORS.park, 'fill-outline-color': JT_COLORS.parkOutline },
    'park_outline': { 'line-color': JT_COLORS.parkOutline },
    'landuse_residential': { 'fill-color': JT_COLORS.residential },
    'landcover_wood': { 'fill-color': JT_COLORS.wood },
    'landcover_grass': { 'fill-color': JT_COLORS.grass },
    'landcover_sand': { 'fill-color': JT_COLORS.sand },
    'landuse_cemetery': { 'fill-color': JT_COLORS.cemetery },
    'landuse_hospital': { 'fill-color': JT_COLORS.hospital },
    'landuse_school': { 'fill-color': JT_COLORS.school },
    'aeroway_fill': { 'fill-color': JT_COLORS.airport },
    'aeroway_runway': { 'line-color': JT_COLORS.airport },
    'aeroway_taxiway': { 'line-color': JT_COLORS.airport },
    'water': { 'fill-color': JT_COLORS.water },
    'waterway_river': { 'line-color': JT_COLORS.water },
    'waterway_other': { 'line-color': JT_COLORS.water },
    'waterway_tunnel': { 'line-color': JT_COLORS.water },
    'building': { 'fill-color': JT_COLORS.building, 'fill-outline-color': JT_COLORS.buildingOut },
    'building-3d': { 'fill-extrusion-color': JT_COLORS.building },
    // Roads
    'road_service_track_casing': { 'line-color': JT_COLORS.roadCasing },
    'road_minor_casing': { 'line-color': JT_COLORS.roadCasing },
    'road_secondary_tertiary_casing': { 'line-color': JT_COLORS.roadCasing },
    'road_trunk_primary_casing': { 'line-color': JT_COLORS.roadCasing },
    'road_motorway_casing': { 'line-color': JT_COLORS.roadMotorway },
    'road_motorway_link_casing': { 'line-color': JT_COLORS.roadMotorway },
    'road_link_casing': { 'line-color': JT_COLORS.roadCasing },
    'road_service_track': { 'line-color': JT_COLORS.roadMinor },
    'road_minor': { 'line-color': JT_COLORS.roadMinor },
    'road_link': { 'line-color': JT_COLORS.roadMajor },
    'road_secondary_tertiary': { 'line-color': JT_COLORS.roadMajor },
    'road_trunk_primary': { 'line-color': JT_COLORS.roadPrimary },
    'road_motorway_link': { 'line-color': JT_COLORS.roadMotorway },
    'road_motorway': { 'line-color': JT_COLORS.roadMotorway },
    // Tunnels
    'tunnel_service_track_casing': { 'line-color': JT_COLORS.roadCasing },
    'tunnel_street_casing': { 'line-color': JT_COLORS.roadCasing },
    'tunnel_secondary_tertiary_casing': { 'line-color': JT_COLORS.roadCasing },
    'tunnel_trunk_primary_casing': { 'line-color': JT_COLORS.roadCasing },
    'tunnel_motorway_casing': { 'line-color': JT_COLORS.roadMotorway },
    'tunnel_service_track': { 'line-color': JT_COLORS.roadMinor },
    'tunnel_minor': { 'line-color': JT_COLORS.roadMinor },
    'tunnel_secondary_tertiary': { 'line-color': JT_COLORS.roadMajor },
    'tunnel_trunk_primary': { 'line-color': JT_COLORS.roadPrimary },
    'tunnel_motorway': { 'line-color': JT_COLORS.roadMotorway },
    // Bridges
    'bridge_service_track_casing': { 'line-color': JT_COLORS.roadCasing },
    'bridge_street_casing': { 'line-color': JT_COLORS.roadCasing },
    'bridge_secondary_tertiary_casing': { 'line-color': JT_COLORS.roadCasing },
    'bridge_trunk_primary_casing': { 'line-color': JT_COLORS.roadCasing },
    'bridge_motorway_casing': { 'line-color': JT_COLORS.roadMotorway },
    'bridge_service_track': { 'line-color': JT_COLORS.roadMinor },
    'bridge_street': { 'line-color': JT_COLORS.roadMinor },
    'bridge_secondary_tertiary': { 'line-color': JT_COLORS.roadMajor },
    'bridge_trunk_primary': { 'line-color': JT_COLORS.roadPrimary },
    'bridge_motorway': { 'line-color': JT_COLORS.roadMotorway },
    // Admin boundaries
    'boundary_2': { 'line-color': JT_COLORS.adminBndry },
    'boundary_3': { 'line-color': JT_COLORS.adminBndry },
    // Labels
    'waterway_line_label': { 'text-color': JT_COLORS.waterText, 'text-halo-color': JT_COLORS.textHalo },
    'water_name_point_label': { 'text-color': JT_COLORS.waterText, 'text-halo-color': JT_COLORS.textHalo },
    'water_name_line_label': { 'text-color': JT_COLORS.waterText, 'text-halo-color': JT_COLORS.textHalo },
    'highway-name-path': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'highway-name-minor': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'highway-name-major': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_other': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_village': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_town': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_state': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_city': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_city_capital': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_country_1': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_country_2': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
    'label_country_3': { 'text-color': JT_COLORS.textDark, 'text-halo-color': JT_COLORS.textHalo },
};

/**
 * Mutates a Liberty style JSON object in-place, applying JuicyTrails
 * color overrides to all matching base layers.
 * Use this only when you have fetched the style JSON before map init.
 * @param {Object} style - MapLibre/Mapbox style spec object
 */
function applyJuicyTrailsColors(style) {
    style.layers.forEach(layer => {
        const overrides = JT_BASE_OVERRIDES[layer.id];
        if (overrides) Object.assign(layer.paint, overrides);
    });
}

/**
 * Helper: multiplies text-size values in a MapLibre expression by a factor.
 * Handles both flat numbers and zoom-interpolated expressions.
 * @param {*} sizeValue - the text-size value (number or expression array)
 * @param {number} factor - multiplication factor (e.g., 1.3 for 30% increase)
 * @returns {*} scaled size value
 */
function scaleTextSize(sizeValue, factor) {
    if (typeof sizeValue === 'number') {
        return sizeValue * factor;
    }
    if (Array.isArray(sizeValue) && sizeValue[0] === 'interpolate') {
        // Clone the expression and multiply all numeric size values
        const scaled = [...sizeValue];
        for (let i = 0; i < scaled.length; i++) {
            // In interpolate expressions, size values appear after zoom values
            // Pattern: ['interpolate', ['linear'], ['zoom'], zoom1, size1, zoom2, size2, ...]
            if (i > 3 && i % 2 === 0 && typeof scaled[i] === 'number') {
                scaled[i] = scaled[i] * factor;
            }
        }
        return scaled;
    }
    // Return as-is if we can't parse it
    return sizeValue;
}

/**
 * Applies JuicyTrails color overrides to a live, already-loaded MapLibre map.
 * Uses setPaintProperty — works with any style loaded by URL or object.
 * Call this inside map.on('load', …). Silently skips layers that don't exist.
 * This is the PRODUCTION-SAFE method — no pre-load fetch required.
 * @param {maplibregl.Map} map - an already-loaded MapLibre map instance
 */
function applyJuicyTrailsColorOverrides(map) {
    // Apply base color overrides
    Object.entries(JT_BASE_OVERRIDES).forEach(([layerId, props]) => {
        // Check the layer exists in the loaded style before applying
        if (!map.getLayer(layerId)) return;
        Object.entries(props).forEach(([prop, value]) => {
            try {
                map.setPaintProperty(layerId, prop, value);
            } catch (e) {
                // Silently skip properties that don't apply to this layer type
            }
        });
    });

    // Enhance all text/label layers: increase size by 30%, add white halo
    const style = map.getStyle();
    if (!style || !style.layers) return;

    style.layers.forEach(layer => {
        if (layer.type !== 'symbol') return;
        if (!layer.layout || !layer.layout['text-field']) return;

        const layerId = layer.id;

        try {
            // Increase text-size by 30%
            const currentSize = map.getLayoutProperty(layerId, 'text-size');
            if (currentSize !== undefined) {
                const scaledSize = scaleTextSize(currentSize, 1.3);
                map.setLayoutProperty(layerId, 'text-size', scaledSize);
            }

            // Add white text halo for better visibility
            map.setPaintProperty(layerId, 'text-halo-color', '#ffffff');
            map.setPaintProperty(layerId, 'text-halo-width', 2);
        } catch (e) {
            // Silently skip if properties don't apply
        }
    });
}

// ── TRAIL LAYER DEFINITIONS ───────────────────────────────────────
// Colors and filters sourced directly from JuicyTrails-USA style.json.
// Layer order matters: rendered bottom-to-top (tracks under paths under hike, etc.)

const _W = ['interpolate', ['linear'], ['zoom'], 8, 1, 13, 2, 22, 4]; // standard trail width
const _W_HALF = ['interpolate', ['linear'], ['zoom'], 8, 0.5, 13, 1, 22, 2]; // 50% of _W, for informal paths

const _PAVED = ['paved', 'asphalt', 'chipseal', 'concrete', 'concrete:lanes',
    'concrete:plates', 'paving_stones', 'paving_stone:lanes', 'grass_paver',
    'sett', 'unhewn_cobblestone', 'cobblestone', 'bricks', 'metal', 'metal_grid',
    'wood', 'stepping_stones', 'rubber', 'tiles', 'fibre_reinforced_polymer_grate'];

const _F = {
    notPaved: ['!', ['match', ['get', 'surface'], _PAVED, true, false]],
    notAccess: ['!', ['match', ['get', 'access'], ['no', 'private', 'discouraged'], true, false]],
    notSidewalk: ['!', ['any', ['==', ['get', 'footway'], 'sidewalk'], ['has', 'sidewalk']]],
    hasBike: ['match', ['get', 'bicycle'], ['yes', 'designated', 'permissive'], true, false],
    hasFoot: ['match', ['get', 'foot'], ['yes', 'designated', 'permissive'], true, false],
    hasHorse: ['match', ['get', 'horse'], ['yes', 'designated', 'permissive'], true, false],
    hasMoto: ['match', ['get', 'motorcycle'], ['yes', 'designated', 'permissive'], true, false],
    hasAtv: ['match', ['get', 'atv'], ['yes', 'designated', 'permissive'], true, false],
    is4wd: ['==', ['get', '4wd_only'], 'yes'],
};

const JT_TRAIL_LAYERS = [
    // Track — brown solid  rgb(159,89,15)
    {
        id: 'jc-track',
        label: 'Track',
        color: 'rgb(159,89,15)',
        filter: ['all',
            ['==', ['get', 'highway'], 'track'],
            ['!', _F.is4wd],
        ],
        width: _W,
        minzoom: 11,
    },
    // 4WD Track — track brown + path dash  rgb(159,89,15)
    // highway=track + 4wd_only=yes; split out of jc-track so the dash shows.
    {
        id: 'jc-track-4wd',
        label: '4WD Track',
        color: 'rgb(159,89,15)',
        dash: [3, 1.5],
        filter: ['all',
            ['==', ['get', 'highway'], 'track'],
            _F.is4wd,
        ],
        width: _W,
        minzoom: 11,
    },
    // Restricted access (no / private / discouraged) — black dashed
    {
        id: 'jc-no-access',
        label: 'No Access',
        color: '#000000',
        opacity: 0.6,
        dash: [3, 3],
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway', 'bridleway', 'cycleway'], true, false],
            ['match', ['get', 'access'], ['no', 'private', 'discouraged'], true, false],
        ],
        width: ['interpolate', ['linear'], ['zoom'], 16, 0.5, 22, 2],
    },
    // Hiking (foot only, unpaved, no sidewalk) — magenta  rgb(236,82,250)
    {
        id: 'jc-hike',
        label: 'Hike',
        color: 'rgb(236,82,250)',
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway'], true, false],
            ['any', _F.hasFoot, ['all', ['==', ['get', 'highway'], 'footway'], ['!', ['has', 'foot']]]],
            _F.notAccess,
            ['!', ['any',
                ['==', ['get', 'footway'], 'sidewalk'], ['has', 'sidewalk'],
                ['==', ['get', 'footway'], 'crossing'], ['has', 'crossing'],
            ]],
            _F.notPaved,
        ],
        width: _W,
    },
    // Hiking + Horse (bridleway, or horse-allowed path/footway, unpaved) — purple  rgb(150,49,252)
    {
        id: 'jc-hike-horse',
        label: 'Hike + Horse',
        color: 'rgb(150,49,252)',
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway', 'bridleway'], true, false],
            ['any',
                ['all', ['match', ['get', 'highway'], ['path', 'footway'], true, false], _F.hasHorse],
                ['==', ['get', 'highway'], 'bridleway'],
            ],
            _F.notAccess, _F.notSidewalk, _F.notPaved,
        ],
        width: _W,
    },
    // Bicycle (designated bike, no motor/horse, unpaved) — amber  #faba0a
    {
        id: 'jc-bicycle',
        label: 'Bicycle',
        color: '#faba0a',
        filter: ['all',
            _F.notAccess, _F.notSidewalk, _F.notPaved,
            ['all', ['!', _F.hasMoto], ['!', _F.hasAtv], ['!', _F.hasHorse]],
            ['any',
                ['==', ['get', 'highway'], 'cycleway'],
                ['all', ['match', ['get', 'highway'], ['path', 'footway', 'cycleway', 'bridleway'], true, false], _F.hasBike],
            ],
        ],
        width: _W,
    },
    // Bicycle + Horse — orange  rgb(255,128,0)
    {
        id: 'jc-bicycle-horse',
        label: 'Bicycle + Horse',
        color: 'rgb(255,128,0)',
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway', 'cycleway', 'bridleway'], true, false],
            _F.hasHorse, _F.hasBike, _F.notAccess, _F.notSidewalk, _F.notPaved,
        ],
        width: _W,
    },
    // Paved rec path (bike on paved surface) — blue  rgb(0,0,255)
    {
        id: 'jc-bicycle-rec',
        label: 'Bike Rec Path',
        color: 'rgb(0,0,255)',
        filter: ['all',
            ['in', ['get', 'surface'], ['literal', ['asphalt', 'concrete', 'paved']]],
            ['any',
                ['==', ['get', 'highway'], 'cycleway'],
                ['all',
                    ['in', ['get', 'highway'], ['literal', ['path', 'footway', 'bridleway']]],
                    ['in', ['get', 'bicycle'], ['literal', ['yes', 'designated', 'permissive']]],
                ],
            ],
        ],
        width: _W,
    },
    // Motorcycle — dark green  rgb(2,115,17)
    {
        id: 'jc-motorcycle',
        label: 'Motorcycle',
        color: 'rgb(2,115,17)',
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway', 'bridleway', 'track'], true, false],
            _F.hasMoto, _F.notAccess, _F.notSidewalk, _F.notPaved,
        ],
        width: _W,
    },
    // ATV — lime green  rgb(91,197,52)
    {
        id: 'jc-atv',
        label: 'ATV',
        color: 'rgb(91,197,52)',
        filter: ['all',
            ['==', ['get', 'highway'], 'path'],
            _F.hasAtv, _F.notAccess,
        ],
        width: _W,
    },
    // Path — red dashed  rgb(255,0,0)
    {
        id: 'jc-path',
        label: 'Path',
        color: 'rgb(255,0,0)',
        dash: [3, 3],
        filter: ['all',
            ['==', ['get', 'highway'], 'path'],
            ['!', ['==', ['get', 'informal'], 'yes']],
            _F.notAccess, _F.notSidewalk, _F.notPaved,
            ['all',
                ['!', _F.hasFoot],
                ['!', _F.hasBike],
                ['!', _F.hasMoto],
                ['!', _F.hasAtv],
                ['!', _F.hasHorse],
            ],
        ],
        width: _W,
    },
    // Informal Path — same red dashed as jc-path, half width  rgb(255,0,0)
    // highway=path + informal=yes, no mode tags (the informal subset of jc-path)
    {
        id: 'jc-path-informal',
        label: 'Informal Path',
        color: 'rgb(199,91,82)',   // muted brick red — was rgb(255,0,0)
        dash: [3, 3],
        minzoom: 13,               // invisible at overview/regional zoom
        opacity: 0.8,              // de-emphasized vs the 0.9 default, still readable
        filter: ['all',
            ['==', ['get', 'highway'], 'path'],
            ['==', ['get', 'informal'], 'yes'],
            _F.notAccess, _F.notSidewalk, _F.notPaved,
            ['all',
                ['!', _F.hasFoot],
                ['!', _F.hasBike],
                ['!', _F.hasMoto],
                ['!', _F.hasAtv],
                ['!', _F.hasHorse],
            ],
        ],
        width: _W_HALF,
    },
    // Sidewalk and Footpath — purple/lavender  rgb(146,101,174)
    {
        id: 'jc-sidewalk-footpath',
        label: 'Sidewalk & Footpath',
        color: 'rgb(146,101,174)',
        filter: ['all',
            ['match', ['get', 'highway'], ['path', 'footway'], true, false],
            ['any',
                ['==', ['get', 'footway'], 'sidewalk'],
                ['has', 'sidewalk'],
                ['==', ['get', 'footway'], 'crossing'],
                ['has', 'crossing'],
                // Paved footway with no mode tags is treated as a sidewalk
                ['all',
                    ['==', ['get', 'highway'], 'footway'],
                    ['match', ['get', 'surface'], _PAVED, true, false],
                ],
            ],
            _F.notAccess,
            ['all',
                ['!', _F.hasBike],
                ['!', _F.hasMoto],
                ['!', _F.hasAtv],
                ['!', _F.hasHorse],
            ],
        ],
        width: _W,
        minzoom: 13,
    },
];

/**
 * Adds all JuicyTrails trail line layers to the given MapLibre map.
 * Must be called inside map.on('load', …) after the source is added.
 * @param {maplibregl.Map} map
 * @param {string} sourceId  - the vector source id (e.g. 'jc-trails')
 * @param {string} sourceLayer - MVT source-layer name (e.g. 'trails')
 */
function addJuicyTrailsLayers(map, sourceId, sourceLayer = 'trails') {
    JT_TRAIL_LAYERS.forEach(({ id, color, filter, width, dash, opacity, minzoom }) => {
        const layer = {
            id,
            type: 'line',
            source: sourceId,
            'source-layer': sourceLayer,
            filter,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
                'line-color': color,
                'line-width': width,
                'line-opacity': opacity ?? 0.9,
            },
        };
        if (minzoom != null) layer.minzoom = minzoom;
        if (dash) layer.paint['line-dasharray'] = dash;
        map.addLayer(layer);
    });
}

// ── HILLSHADE / CONTOURS / LABEL LIFT ─────────────────────────────
// These helpers wrap MapLibre lifecycle calls (sources, layers, event
// listeners) to deliver the full JuicyTrails map look from a few
// function calls. They live here rather than in consumer HTML so a
// single bin/sync-to-webapp.sh propagates value changes (hillshade
// exaggeration, contour thresholds, etc.) to all consumers.

/**
 * Adds the JuicyTrails-styled hillshade layer to a loaded map.
 * Idempotent on the source: if the source already exists, only the
 * layer is added.
 *
 * @param {maplibregl.Map} map
 * @param {Object} [options]
 * @param {string} [options.sourceId='terrain-dem']
 * @param {string} [options.layerId='terrain-hillshade']
 * @param {string} [options.demUrl]   Override DEM tile URL (must be terrarium-encoded)
 * @param {string} [options.beforeId] Insert hillshade layer before this layer id
 * @param {Object} [options.paint]    Override individual hillshade-* paint props
 */
function addJuicyTrailsHillshade(map, options = {}) {
    const {
        sourceId = 'terrain-dem',
        layerId = 'terrain-hillshade',
        demUrl = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
        beforeId,
        paint = {},
    } = options;

    if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
            type: 'raster-dem',
            tiles: [demUrl],
            tileSize: 256,
            encoding: 'terrarium',
            minzoom: 0,
            maxzoom: 15,
        });
    }

    map.addLayer({
        id: layerId,
        type: 'hillshade',
        source: sourceId,
        paint: {
            'hillshade-exaggeration': 0.25,
            'hillshade-shadow-color': '#000000',
            'hillshade-highlight-color': '#ffffff',
            'hillshade-accent-color': '#000000',
            ...paint,
        },
    }, beforeId);
}

/**
 * Adds JuicyTrails-styled contour lines and labels. Lazy-loads at
 * zoom ≥ minZoom (default 12) to avoid worker startup cost on
 * initial map load. Idempotent: noop if `contour-lines` already
 * exists.
 *
 * Requires the mlcontour plugin to be loaded as a global (typically
 * via <script src="…maplibre-contour.min.js">). If missing, logs a
 * clear warning and returns without modifying the map.
 *
 * @param {maplibregl.Map} map
 * @param {Object} [options]
 * @param {string} [options.demUrl]    Override DEM tile URL
 * @param {number} [options.minZoom=12]
 * @param {string} [options.beforeId='water']  Where to insert contour-lines
 * @param {Object} [options.thresholds] zoom→[minor_ft, major_ft] map
 * @param {string} [options.lineColor='#8B6914']
 * @param {number} [options.textSize=14]
 */
function addJuicyTrailsContours(map, options = {}) {
    const {
        demUrl = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
        minZoom = 12,
        beforeId = 'water',
        thresholds = {
            11: [500, 2000],
            12: [200, 1000],
            13: [100, 500],
            14: [50, 200],
            15: [20, 100],
        },
        lineColor = '#8B6914',
        textSize = 14,
    } = options;

    if (typeof mlcontour === 'undefined') {
        console.warn(
            '[juicytrails] mlcontour plugin not loaded; contours disabled. ' +
            'Add <script src="…maplibre-contour.min.js"></script> before ' +
            'juicytrails-style.js to enable contours.'
        );
        return;
    }

    if (map.getLayer('contour-lines')) return;

    let demSource = null;
    let loaded = false;

    const load = () => {
        if (loaded || map.getZoom() < minZoom) return;
        loaded = true;

        try {
            if (!demSource) {
                demSource = new mlcontour.DemSource({
                    url: demUrl,
                    encoding: 'terrarium',
                    maxzoom: 15,
                    worker: true,
                    cacheSize: 100,
                    timeoutMs: 10000,
                });
                demSource.setupMaplibre(maplibregl);
            }

            const contourUrl = demSource.contourProtocolUrl({
                multiplier: 3.28084,
                thresholds,
                contourLayer: 'contours',
                elevationKey: 'ele',
                levelKey: 'level',
                extent: 4096,
            });

            map.addSource('contours', { type: 'vector', tiles: [contourUrl], maxzoom: 15 });

            const linesLayer = {
                id: 'contour-lines',
                type: 'line',
                source: 'contours',
                'source-layer': 'contours',
                paint: {
                    'line-opacity': 0.5,
                    'line-color': lineColor,
                    'line-width': ['match', ['get', 'level'], 1, 1.5, 0.5],
                },
                minzoom: minZoom,
            };
            try {
                map.addLayer(linesLayer, beforeId);
            } catch (_) {
                map.addLayer(linesLayer);
            }

            map.addLayer({
                id: 'contour-labels',
                type: 'symbol',
                source: 'contours',
                'source-layer': 'contours',
                filter: ['>', ['get', 'level'], 0],
                layout: {
                    'text-field': ['concat', ['get', 'ele'], 'ft'],
                    'text-font': ['Noto Sans Regular'],
                    'text-size': textSize,
                    'symbol-placement': 'line',
                    'text-rotation-alignment': 'map',
                    'text-pitch-alignment': 'viewport',
                },
                paint: {
                    'text-color': lineColor,
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1,
                },
                minzoom: minZoom,
            });

            map.off('zoom', load);
        } catch (e) {
            console.error('[juicytrails] failed to load contours:', e);
            loaded = false;
        }
    };

    map.on('zoom', load);
    load();
}

/**
 * Adds mountain-peak icons + name/elevation labels from the Liberty
 * base source (openmaptiles `mountain_peak`). Liberty ships the data
 * but styles no peak layer, so this fills that gap. No-op-safe: if the
 * source is absent (non-Liberty base), it warns and returns.
 *
 * @param {maplibregl.Map} map
 * @param {Object} [options]
 * @param {string} [options.sourceId='openmaptiles']
 * @param {string} [options.layerId='jt-mountain-peak']
 * @param {number} [options.minzoom=11]
 * @param {string} [options.textColor='#4a3f33']
 * @param {string} [options.haloColor='#ffffff']
 */
function addJuicyTrailsPeaks(map, options = {}) {
    const {
        sourceId = 'openmaptiles',
        layerId = 'jt-mountain-peak',
        minzoom = 11,
        textColor = '#4a3f33',
        haloColor = '#ffffff',
    } = options;

    if (!map.getSource(sourceId)) {
        console.warn(
            `[juicytrails] addJuicyTrailsPeaks: source "${sourceId}" not found; ` +
            'skipping (base style is not OpenFreeMap Liberty?).'
        );
        return;
    }
    if (map.getLayer(layerId)) map.removeLayer(layerId);

    map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        'source-layer': 'mountain_peak',
        minzoom,
        filter: ['match', ['get', 'class'], ['peak', 'volcano'], true, false],
        layout: {
            'icon-image': ['match', ['get', 'class'], 'volcano', 'volcano_11', 'triangle_11'],
            'icon-size': 1,
            // Name on top; elevation in feet (grouped, e.g. "12,976 ft")
            // on a second, smaller line. Peaks lacking ele_ft show name only.
            'text-field': [
                'case',
                ['has', 'ele_ft'],
                ['format',
                    ['get', 'name'], {},
                    '\n', {},
                    ['concat',
                        ['number-format', ['to-number', ['get', 'ele_ft']], { 'locale': 'en-US' }],
                        ' ft',
                    ],
                    { 'font-scale': 0.82 },
                ],
                ['get', 'name'],
            ],
            'text-font': ['Noto Sans Regular'],
            'text-size': 13,
            'text-offset': [0, 0.75],
            'text-anchor': 'top',
            'text-optional': true,
            // lower rank = more prominent peak; kept first on collision
            'symbol-sort-key': ['to-number', ['get', 'rank'], 99],
        },
        paint: {
            'text-color': textColor,
            'text-halo-color': haloColor,
            'text-halo-width': 1.4,
            'text-halo-blur': 0.5,
        },
    });
}

/**
 * Adds the ski-lift / aerialway system from the Liberty base source
 * (openmaptiles `transportation`, class=aerialway — subclass gondola,
 * chair_lift, t-bar, etc.). Liberty draws lift *station* icons via its
 * poi layer (only at z15+) but no lift lines at all, so chairlifts /
 * gondolas otherwise appear as disconnected points. Adds three layers:
 *   - `${layerId}`        — the cable, a thin continuous line.
 *   - `${layerId}-ticks`  — perpendicular crossbar ticks, via Liberty's
 *     rail-hatching trick (a wide line with a tiny-dash `line-dasharray`
 *     so each short dash renders as a crossbar).
 *   - `${layerId}-station` — the blue `aerialway` station icon, pulled
 *     down to z14 (lowest the `poi` source-layer carries it) and capped
 *     at z15 (maxzoom) where Liberty's own poi_r1 takes over.
 * Cable + ticks default to the station icon's blue so the system reads
 * as one. No-op-safe: warns and returns if the source is absent.
 *
 * @param {maplibregl.Map} map
 * @param {Object} [options]
 * @param {string} [options.sourceId='openmaptiles']
 * @param {string} [options.layerId='jt-aerialway']   base id; ticks/station use `${layerId}-ticks` / `-station`
 * @param {string} [options.color='#4898ff']          cable + tick color (station icon is Liberty's, not recolored)
 * @param {number} [options.minzoom=12]               cable + ticks floor
 * @param {number} [options.stationMinzoom=14]        station icon floor
 */
function addJuicyTrailsSkiLifts(map, options = {}) {
    const {
        sourceId = 'openmaptiles',
        layerId = 'jt-aerialway',
        // Sky blue sampled from Liberty's own `aerialway` station icon
        // (#4898ff), so the cable + ticks read as one system with the
        // blue station markers.
        color = '#4898ff',
        minzoom = 12,
        stationMinzoom = 14,
    } = options;
    const ticksId = `${layerId}-ticks`;
    const stationId = `${layerId}-station`;

    if (!map.getSource(sourceId)) {
        console.warn(
            `[juicytrails] addJuicyTrailsSkiLifts: source "${sourceId}" not found; ` +
            'skipping (base style is not OpenFreeMap Liberty?).'
        );
        return;
    }
    [stationId, ticksId, layerId].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
    });

    const aerialwayFilter = ['==', ['get', 'class'], 'aerialway'];

    // The cable: thin continuous line.
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        'source-layer': 'transportation',
        filter: aerialwayFilter,
        minzoom,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': color,
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.6, 16, 1.6],
        },
    });

    // The ticks: a wide line whose tiny-dash pattern renders as
    // perpendicular crossbars (butt caps keep them crisp). Mirrors
    // Liberty's road_major_rail_hatching idiom.
    map.addLayer({
        id: ticksId,
        type: 'line',
        source: sourceId,
        'source-layer': 'transportation',
        filter: aerialwayFilter,
        minzoom,
        layout: { 'line-cap': 'butt' },
        paint: {
            'line-color': color,
            'line-dasharray': [0.25, 5],
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 16, 5],
        },
    });

    // Lift-station icons. Liberty only draws these via poi_r1 at z15+
    // (rank-tiered POIs), so they pop in late. This pulls the aerialway
    // station marker (the blue `aerialway` sprite icon) down to z14 —
    // the lowest the `poi` source-layer carries data — then hands back
    // to Liberty's poi_r1 at z15 (maxzoom) to avoid double-drawing.
    map.addLayer({
        id: stationId,
        type: 'symbol',
        source: sourceId,
        'source-layer': 'poi',
        filter: ['all',
            ['==', ['get', 'class'], 'aerialway'],
            ['==', ['get', 'subclass'], 'station'],
        ],
        minzoom: stationMinzoom,
        maxzoom: 15,
        layout: {
            'icon-image': 'aerialway',
            'icon-size': 1,
        },
    });
}

/**
 * Moves every base-map *symbol* layer to the top of the layer stack so
 * it renders above trails. This covers place/road/water labels, road &
 * highway shields, POI icons + names (building/amenity labels), airport
 * labels, and one-way arrows — i.e. anything Liberty draws as a symbol.
 * Admin (state/county) and park boundary *lines* are lifted too.
 * Iterating in style order and moving each to the top preserves
 * Liberty's original relative order (and thus its collision priority);
 * because boundary lines precede the symbols in Liberty's stack, they
 * end up above trails but below the labels.
 *
 * Two kinds of symbol layer are intentionally left where they are:
 *   - `contour-labels` — so Liberty place labels keep winning symbol
 *     collisions against elevation numbers (street/town names would
 *     otherwise hide behind contour labels).
 *   - JT's own `jt-*` symbol layers (e.g. jt-mountain-peak) — already
 *     placed deliberately; re-lifting would change their intended
 *     collision order vs. place labels.
 *
 * Despite the historical name, this lifts more than labels; the name is
 * kept because it's part of the public, consumer-referenced API.
 *
 * @param {maplibregl.Map} map
 */
function liftJuicyTrailsLabels(map) {
    const style = map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach(layer => {
        const id = layer.id;
        if (id === 'contour-labels' || id.startsWith('jt-')) return;
        // Admin (state/county) + park boundary LINES also lift above
        // trails. They sit before the symbols in Liberty's stack, so
        // iterating in style order leaves them below the labels lifted
        // afterward: boundaries above trails, labels above boundaries.
        const isBoundaryLine = layer.type === 'line' &&
            (layer['source-layer'] === 'boundary' || id === 'park_outline');
        if (layer.type === 'symbol' || isBoundaryLine) {
            try { map.moveLayer(id); } catch (_) { /* skip */ }
        }
    });
}
