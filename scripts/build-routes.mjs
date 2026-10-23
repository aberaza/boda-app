/**
 * build-routes.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Queries SerpAPI's Google Flights endpoint for each configured origin city
 * and builds a static JSON file consumed by the Leaflet routes map.
 *
 * Usage:
 *   SERPAPI_KEY=<key> node scripts/build-routes.mjs
 *   SERPAPI_KEY=<key> node scripts/build-routes.mjs --date 2027-05-08
 *   node scripts/build-routes.mjs --dry-run [--date YYYY-MM-DD] [--output path]
 *   node scripts/build-routes.mjs --allow-partial
 *
 * By default the search date is the wedding date. Use --date to query a
 * different future date explicitly. The output is written atomically and is
 * not replaced when a real API request fails, unless --allow-partial is used.
 *
 * Output:
 *   src/data/flight-routes.json
 */

import { writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_PATH = resolve(ROOT, 'src/data/flight-routes.json');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ALLOW_PARTIAL = args.includes('--allow-partial');
const dateArgIdx = args.indexOf('--date');
const dateArg = dateArgIdx !== -1 ? args[dateArgIdx + 1] : undefined;
const outputArgIdx = args.indexOf('--output');
const outputArg = outputArgIdx !== -1 ? args[outputArgIdx + 1] : undefined;
const hasValue = (value) => typeof value === 'string' && !value.startsWith('-');
const WEDDING_DATE = '2027-05-08';

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

if (dateArgIdx !== -1 && !hasValue(dateArg)) {
  console.error('❌  --date requires a value in YYYY-MM-DD format.');
  process.exit(1);
}
if (outputArgIdx !== -1 && !hasValue(outputArg)) {
  console.error('❌  --output requires a file path.');
  process.exit(1);
}
const SEARCH_DATE = dateArg ?? WEDDING_DATE;
if (!isValidDate(SEARCH_DATE)) {
  console.error(`❌  Invalid date: ${SEARCH_DATE}. Use --date YYYY-MM-DD.`);
  process.exit(1);
}
const TARGET_PATH = outputArg ? resolve(ROOT, outputArg) : OUT_PATH;

const SERPAPI_KEY = process.env.SERPAPI_KEY;
if (!DRY_RUN && !SERPAPI_KEY) {
  console.error('❌  SERPAPI_KEY env var is required. Use --dry-run to skip API calls.');
  process.exit(1);
}

// ─── Destination airports ─────────────────────────────────────────────────────
// Jerez (XRY) is a small airport. Sevilla (SVQ) is a practical alternate.
const DESTINATIONS = [
  { city: 'Jerez de la Frontera', airport: 'XRY', lat: 36.7446, lng: -6.0601 },
  { city: 'Sevilla', airport: 'SVQ', lat: 37.418, lng: -5.8931 },
];

// ─── Origin cities ────────────────────────────────────────────────────────────
// Add or remove cities here. `airport` is the IATA code SerpAPI will use.
// `altAirports` are tried if the primary yields no results.
const ORIGINS = [
  {
    city: 'Barcelona',
    airport: 'BCN',
    lat: 41.385,
    lng: 2.173,
    altAirports: [],
  },
  {
    city: 'París',
    airport: 'CDG',
    lat: 48.857,
    lng: 2.352,
    altAirports: ['ORY', 'BVA'],
  },
  {
    city: 'Pamplona',
    // PNA is the local airport but has very few routes; MAD is the practical gateway
    airport: 'PNA',
    lat: 42.817,
    lng: -1.644,
    altAirports: ['MAD', 'BIO'],
  },
  {
    city: 'Madrid',
    airport: 'MAD',
    lat: 40.416,
    lng: -3.703,
    altAirports: [],
  },
  {
    city: 'Valencia',
    airport: 'VLC',
    lat: 39.4893,
    lng: -0.4816,
  },
  {
    city: 'Granada',
    airport: 'GRX',
    lat: 37.1887,
    lng: -3.7774,
  },
];

// ─── Airport coordinate lookup ────────────────────────────────────────────────
// Populated with the airports that are likely to appear as layovers.
const AIRPORT_COORDS = {
  XRY: { city: 'Jerez de la Frontera', lat: 36.7446, lng: -6.0601 },
  SVQ: { city: 'Sevilla', lat: 37.418, lng: -5.8931 },
  AGP: { city: 'Málaga', lat: 36.6749, lng: -4.4991 },
  MAD: { city: 'Madrid', lat: 40.4983, lng: -3.5676 },
  BCN: { city: 'Barcelona', lat: 41.2971, lng: 2.0785 },
  CDG: { city: 'París (CDG)', lat: 49.0097, lng: 2.5479 },
  ORY: { city: 'París (Orly)', lat: 48.7253, lng: 2.3795 },
  PNA: { city: 'Pamplona', lat: 42.7701, lng: -1.6464 },
  BIO: { city: 'Bilbao', lat: 43.3011, lng: -2.9106 },
  LIS: { city: 'Lisboa', lat: 38.7742, lng: -9.1342 },
  FCO: { city: 'Roma', lat: 41.8003, lng: 12.2389 },
  LHR: { city: 'Londres (LHR)', lat: 51.4775, lng: -0.4614 },
  AMS: { city: 'Ámsterdam', lat: 52.3086, lng: 4.7639 },
  FRA: { city: 'Frankfurt', lat: 50.0379, lng: 8.5622 },
  MRS: { city: 'Marsella', lat: 43.4353, lng: 5.2214 },
  TLS: { city: 'Toulouse', lat: 43.6293, lng: 1.3638 },
  GRX: { city: 'Granada', lat: 37.1887, lng: -3.7774 },
  VLC: { city: 'Valencia', lat: 39.4893, lng: -0.4816 },
  PMI: { city: 'Palma de Mallorca', lat: 39.5517, lng: 2.7388 },
};

/** Resolve coordinates for an IATA code. Falls back to a placeholder. */
function coordsFor(iata) {
  return AIRPORT_COORDS[iata] ?? { city: iata, lat: 0, lng: 0 };
}

// ─── SerpAPI call ─────────────────────────────────────────────────────────────
async function fetchFlights(fromCode, toCode) {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: fromCode,
    arrival_id: toCode,
    outbound_date: SEARCH_DATE,
    currency: 'EUR',
    hl: 'es',
    type: '2', // one-way
    api_key: SERPAPI_KEY,
  });

  const url = `https://serpapi.com/search.json?${params}`;
  console.log(`  → GET ${fromCode} → ${toCode}`);

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorMessage = `Network error: ${message}`;
    console.warn(`    ⚠️  ${errorMessage} for ${fromCode}→${toCode}`);
    return { data: null, error: errorMessage };
  }
  let data;
  try {
    data = await res.json();
  } catch {
    const errorMessage = `Invalid JSON response (HTTP ${res.status})`;
    console.warn(`    ⚠️  ${errorMessage} for ${fromCode}→${toCode}`);
    return { data: null, error: errorMessage };
  }
  if (!res.ok || data.error) {
    const errorMessage = data.error ?? `HTTP ${res.status}`;
    console.warn(`    ⚠️  SerpApi error for ${fromCode}→${toCode}: ${errorMessage}`);
    return { data: null, error: errorMessage };
  }
  return { data, error: null };
}

/** Sleep helper for rate-limiting */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Parse SerpAPI response into our shape ────────────────────────────────────
/**
 * Converts one SerpAPI flight option into our route shape.
 *
 * A SerpAPI "flight option" looks like:
 * {
 *   flights: [
 *     { departure_airport: { id, name }, arrival_airport: { id, name },
 *       airline, duration, airline_logo }
 *   ],
 *   layovers: [{ id, name, duration }],
 *   total_duration: number  (minutes),
 *   price: number
 * }
 */
function parseOption(option) {
  const { flights = [], layovers = [], total_duration, price } = option;
  if (!flights.length || typeof price !== 'number' || !Number.isFinite(price)) return null;

  const isConnecting = flights.length > 1;

  // Build segments with full coordinate data
  const segments = flights.map((f) => {
    const fromCode = f.departure_airport?.id ?? '???';
    const toCode = f.arrival_airport?.id ?? '???';
    const fromInfo = AIRPORT_COORDS[fromCode] ?? {
      city: f.departure_airport?.name ?? fromCode,
      lat: 0,
      lng: 0,
    };
    const toInfo = AIRPORT_COORDS[toCode] ?? {
      city: f.arrival_airport?.name ?? toCode,
      lat: 0,
      lng: 0,
    };

    return {
      from: {
        code: fromCode,
        city: fromInfo.city,
        lat: fromInfo.lat,
        lng: fromInfo.lng,
      },
      to: { code: toCode, city: toInfo.city, lat: toInfo.lat, lng: toInfo.lng },
      airline: f.airline ?? 'Desconocida',
      logo: f.airline_logo ?? null,
      duration: f.duration ?? 0,
    };
  });

  // Layovers with coords
  const parsedLayovers = layovers.map((l) => {
    const info = AIRPORT_COORDS[l.id] ?? {
      city: l.name ?? l.id,
      lat: 0,
      lng: 0,
    };
    return {
      code: l.id,
      city: info.city,
      lat: info.lat,
      lng: info.lng,
      duration: l.duration ?? 0,
    };
  });

  // Primary airline = first segment's airline (or majority)
  const primaryAirline = segments[0]?.airline ?? 'Desconocida';

  return {
    type: isConnecting ? 'connecting' : 'direct',
    airline: primaryAirline,
    totalDuration: total_duration ?? segments.reduce((s, f) => s + f.duration, 0),
    price: price ?? null,
    segments,
    layovers: parsedLayovers,
  };
}

/**
 * Fetches and parses routes for a single origin → one destination.
 * Returns an array of route objects, or [] if nothing found.
 */
async function getRoutes(origin, dest) {
  let data;
  let error = null;

  if (DRY_RUN) {
    data = MOCK_DATA[`${origin.airport}-${dest.airport}`] ?? null;
    console.log(
      `  [dry-run] ${origin.airport} → ${dest.airport}: ${data ? 'mock hit' : 'no mock'}`,
    );
  } else {
    const response = await fetchFlights(origin.airport, dest.airport);
    await sleep(1200); // stay well under SerpAPI rate limit
    data = response.data;
    error = response.error;
  }

  if (error) return { routes: [], error };
  if (!data) return { routes: [], error: null };

  const allOptions = [
    ...(Array.isArray(data.best_flights) ? data.best_flights : []),
    ...(Array.isArray(data.other_flights) ? data.other_flights : []),
  ];

  if (!allOptions.length) return { routes: [], error: null };

  // Keep up to 3 options (best + a connecting alt if available).
  const routes = allOptions
    .slice(0, 3)
    .map((opt) => parseOption(opt))
    .filter(Boolean);
  return { routes, error: null };
}

// ─── Mock data (used with --dry-run) ─────────────────────────────────────────
// Mirrors the real SerpAPI response structure for local development.
const MOCK_DATA = {
  'BCN-XRY': {
    best_flights: [
      {
        flights: [
          {
            departure_airport: { id: 'BCN', name: 'Barcelona' },
            arrival_airport: { id: 'XRY', name: 'Jerez de la Frontera' },
            airline: 'Vueling',
            airline_logo: 'https://www.gstatic.com/flights/airline_logos/70px/VY.png',
            duration: 135,
          },
        ],
        layovers: [],
        total_duration: 135,
        price: 89,
      },
    ],
    other_flights: [
      {
        flights: [
          {
            departure_airport: { id: 'BCN', name: 'Barcelona' },
            arrival_airport: { id: 'MAD', name: 'Madrid' },
            airline: 'Iberia',
            airline_logo: 'https://www.gstatic.com/flights/airline_logos/70px/IB.png',
            duration: 75,
          },
          {
            departure_airport: { id: 'MAD', name: 'Madrid' },
            arrival_airport: { id: 'XRY', name: 'Jerez de la Frontera' },
            airline: 'Iberia',
            airline_logo: 'https://www.gstatic.com/flights/airline_logos/70px/IB.png',
            duration: 65,
          },
        ],
        layovers: [{ id: 'MAD', name: 'Madrid', duration: 90 }],
        total_duration: 230,
        price: 65,
      },
    ],
  },
  'CDG-XRY': {
    best_flights: [],
    other_flights: [],
  },
  'CDG-SVQ': {
    best_flights: [
      {
        flights: [
          {
            departure_airport: { id: 'CDG', name: 'París CDG' },
            arrival_airport: { id: 'SVQ', name: 'Sevilla' },
            airline: 'Air France',
            airline_logo: 'https://www.gstatic.com/flights/airline_logos/70px/AF.png',
            duration: 165,
          },
        ],
        layovers: [],
        total_duration: 165,
        price: 120,
      },
    ],
    other_flights: [],
  },
  'PNA-XRY': { best_flights: [], other_flights: [] },
  'PNA-SVQ': { best_flights: [], other_flights: [] },
  'MAD-XRY': {
    best_flights: [
      {
        flights: [
          {
            departure_airport: { id: 'MAD', name: 'Madrid' },
            arrival_airport: { id: 'XRY', name: 'Jerez de la Frontera' },
            airline: 'Iberia',
            airline_logo: 'https://www.gstatic.com/flights/airline_logos/70px/IB.png',
            duration: 70,
          },
        ],
        layovers: [],
        total_duration: 70,
        price: 55,
      },
    ],
    other_flights: [],
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    `\n✈️  Building flight routes — search date: ${SEARCH_DATE}${DRY_RUN ? ' [DRY RUN]' : ''}\n`,
  );

  const output = {
    generated: new Date().toISOString(),
    searchDate: SEARCH_DATE,
    destinations: DESTINATIONS,
    partial: false,
    failedQueries: 0,
    origins: [],
  };
  const failedQueries = [];

  for (const origin of ORIGINS) {
    console.log(`\n📍 ${origin.city} (${origin.airport})`);

    let routes = [];

    // Try each destination (XRY first, then SVQ)
    for (const dest of DESTINATIONS) {
      const result = await getRoutes(origin, dest);
      if (result.error) {
        failedQueries.push(`${origin.airport}→${dest.airport}: ${result.error}`);
        continue;
      }
      const found = result.routes;
      if (found.length) {
        routes.push(...found);
        // If we got direct flights to XRY, no need to also check SVQ for this origin
        const hasDirect = found.some((r) => r.type === 'direct' && dest.airport === 'XRY');
        if (hasDirect) break;
      }
    }

    // Try alternate airports for this origin if still empty
    if (!routes.length && origin.altAirports?.length) {
      for (const altCode of origin.altAirports) {
        console.log(`  ↪ No results, trying alt airport ${altCode}`);
        const altOrigin = {
          ...origin,
          airport: altCode,
          ...coordsFor(altCode),
        };
        for (const dest of DESTINATIONS) {
          const result = await getRoutes(altOrigin, dest);
          if (result.error) {
            failedQueries.push(`${altCode}→${dest.airport}: ${result.error}`);
            continue;
          }
          const found = result.routes;
          if (found.length) {
            routes.push(...found);
            break;
          }
        }
        if (routes.length) break;
      }
    }

    if (!routes.length) {
      console.log(`  ⚠️  No routes found for ${origin.city}`);
    } else {
      console.log(`  ✅  ${routes.length} route(s) found`);
    }

    output.origins.push({
      city: origin.city,
      airport: origin.airport,
      lat: origin.lat,
      lng: origin.lng,
      routes,
    });
  }

  if (failedQueries.length) {
    if (!DRY_RUN && !ALLOW_PARTIAL) {
      console.error(`\n❌  ${failedQueries.length} flight request(s) failed. No JSON was written.`);
      console.error('    Retry the command, or pass --allow-partial to write successful results.');
      process.exitCode = 1;
      return;
    }
    output.partial = true;
    output.failedQueries = failedQueries.length;
    console.warn(`\n⚠️  Writing partial output: ${failedQueries.length} request(s) failed.`);
  }

  const outDir = dirname(TARGET_PATH);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Atomic replace: an interrupted run cannot leave a truncated JSON file.
  const tempPath = `${TARGET_PATH}.${process.pid}.tmp`;
  writeFileSync(tempPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
  renameSync(tempPath, TARGET_PATH);
  console.log(`\n✅  Written to ${TARGET_PATH}\n`);
}

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
