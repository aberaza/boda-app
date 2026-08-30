# Bodorrio

Website for the wedding of Aritz and Sandra, held at Finca La Carreña in Jerez de la Frontera.

## Stack

- Astro 6 with server-side rendering.
- Netlify adapter for deployment.
- Tailwind CSS v4 for utility styles.
- GSAP for slide and overlay animations.
- Leaflet for route and location maps.
- TypeScript and Astro components.

## Local development

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

The development server is available at `http://localhost:4321` by default.

## Commands

| Command              | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Start the local development server.                           |
| `npm run build`      | Build the SSR site for Netlify.                               |
| `npm run preview`    | Preview the production build locally.                         |
| `npm run routes:dry` | Generate flight-route data from mock data and write the JSON. |
| `npm run routes`     | Query SerpAPI and generate flight-route data.                 |

The generator queries the wedding date (`2027-05-08`) by default. Pass `--date YYYY-MM-DD` to query another date. Use `--output /tmp/flight-routes.json` to inspect a run without modifying the tracked file. A real run requires `SERPAPI_KEY`; `routes:dry` never calls SerpApi.

Examples:

```sh
npm run routes:dry -- --output /tmp/flight-routes.json
SERPAPI_KEY=... npm run routes -- --date 2027-05-08
```

`src/data/flight-routes.json` is generated data; inspect it before committing it.

## Configuration

Copy `.env.example` to `.env` for local environment configuration. The route-generation script requires:

- `SERPAPI_KEY`: SerpAPI key used only by `scripts/build-routes.mjs`.
- `ADMIN_EXPORT_SECRET`: bearer secret required by the RSVP export endpoint.

Never commit `.env`, `.envrc`, API keys or other credentials.

## Application structure

- `src/pages/index.astro`: main animated landing page and overlays.
- `src/pages/rsvp.astro`: RSVP page UI.
- `src/pages/api/rsvp.ts`: RSVP API endpoint.
- `src/pages/api/admin/export.ts`: protected RSVP CSV export endpoint.
- `src/config/content.ts`: shared couple, event and image data.
- `src/i18n/`: Spanish, French and English copy and locale helpers.
- `src/data/flight-routes.json`: generated route data consumed by the site.
- `scripts/build-routes.mjs`: SerpAPI route-data generator (see the date/output options above).
- `tests/`: Vitest unit/API tests and Playwright browser tests.
- `.github/workflows/quality.yml`: required CI checks for pull requests and main.

More detail is available in [`docs/architecture.md`](docs/architecture.md), known limitations in [`docs/known-issues.md`](docs/known-issues.md), and development guidance in [`CONTRIBUTING.md`](CONTRIBUTING.md).
