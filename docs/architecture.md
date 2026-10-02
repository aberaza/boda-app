# Architecture

## Runtime

The project is an Astro SSR application configured with `output: "server"` and `@astrojs/netlify`. Astro renders the pages and API routes on Netlify. Vite integrates Tailwind CSS v4.

## Page composition

`src/pages/index.astro` is the primary page. It composes:

- `BaseLayout.astro` for the HTML document, metadata and fonts.
- Pattern components for the visual background.
- Configuration from `src/config/content.ts` and `src/config/theme.ts`.
- Translation copy selected through `getLang(Astro.url)` and `getT(lang)`.
- Generated flight data from `src/data/flight-routes.json`.

`src/pages/index.astro` is intentionally a thin composition layer. The home UI is split under `src/components/home/` into navigation, four primary slides, the event overlay and the Jerez sub-sections. Shared view helpers and prop types live alongside those components; route-summary preparation lives in `src/lib/flight-routes.ts`.

The browser controller is `src/scripts/home.ts`. GSAP/ScrollTrigger preserves the wheel and trackpad-driven desktop presentation. Touch-capable devices use native vertical and horizontal scroll snap, so swipes retain browser momentum. The same controller supports the dot controls and keyboard navigation with arrow keys, WASD and HJKL, keeps URL state synchronized, and manages overlay visibility/focus.

## Content and localization

Stable event facts and image URLs belong in `src/config/content.ts`. Rendered copy belongs in `src/i18n/translations.ts`, which currently defines `es`, `fr` and `en`.

Localization is query-string based:

- `/` uses Spanish by default.
- `/?lang=fr` selects French.
- `/?lang=en` selects English.

`src/i18n/index.ts` validates locale values and builds links preserving the current path and query string.

## Flight routes

`scripts/build-routes.mjs` queries SerpAPI's Google Flights endpoint for configured origin and destination airports. It normalizes options into route objects containing segments, airports, coordinates, airlines, duration and price, then atomically writes `src/data/flight-routes.json`.

The default query date is the confirmed wedding date, `2027-05-08`; use `--date YYYY-MM-DD` for a different search. `npm run routes:dry` uses embedded mock data and accepts `--output /tmp/flight-routes.json` so a dry run can be inspected without touching tracked data. A real run requires `SERPAPI_KEY`. The page selects route summaries for the cities configured in `src/lib/flight-routes.ts`.

## RSVP flow

The RSVP domain is implemented in `src/server/rsvp/` and uses Netlify Database for persistent invitations and responses. Private QR links resolve through `/rsvp/access/[token]`, store only a hashed token in PostgreSQL, establish an Astro Session backed by Netlify Blobs, and remove the token from the visible URL.

`GET /api/rsvp` loads the invitation and current response. `PUT /api/rsvp` validates strict Zod payloads, invitation capacity, locked names, deadlines and optimistic revisions before updating transactionally. Shared generic QR codes can be claimed once through `POST /api/rsvp/claim`, which creates a distinct private editing link.

The Excel/QR CLI in `scripts/invitations/` validates and imports invitations idempotently and generates QR files locally. The protected admin export reads actual database records and applies CSV/formula escaping. Operational setup is documented in `docs/rsvp-operations.md`.

## Deployment considerations

- Netlify must provide `ADMIN_EXPORT_SECRET` at runtime.
- `SERPAPI_KEY` is needed only when regenerating route data, not when rendering the site.
- External images and Google Fonts require network access in the browser.
- Generated route data should be reviewed for stale dates and prices before publication.
