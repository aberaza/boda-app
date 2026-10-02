# Contributing

## Before making changes

1. Read [`README.md`](README.md) and [`docs/architecture.md`](docs/architecture.md).
2. Check the working tree with `git status --short`.
3. Never read, commit or paste secrets. Use `.env.example` to document variable names.
4. Confirm the authoritative wedding date before changing event copy.

## Development workflow

1. Install dependencies with `npm install`.
2. Start the site with `npm run dev`.
3. Keep shared facts in `src/config/content.ts` and translated copy in `src/i18n/translations.ts`.
4. Preserve all three locales when changing translated structures.
5. Run `npm run check` and `npm run build` before submitting changes.
6. For browser-facing changes, run `npm run test:e2e` after installing the required Playwright browsers.
7. If route data changes, run `npm run routes:dry`, inspect the generated JSON, and include only intentional changes.

## Code conventions

- Follow the existing Astro, TypeScript and Tailwind style.
- Prefer existing components and theme tokens over duplicating markup or styles.
- Keep API handlers explicit about accepted input, error status and response content type.
- Do not place credentials, guest data or production exports in the repository.
- Keep user-facing copy out of templates when it belongs to a shared locale.

## Pull requests

Include:

- A concise description of the behavior change.
- The validation commands that were run.
- Any content, migration or environment-variable requirements.
- A note when generated flight data was intentionally updated.

Known limitations are tracked in [`docs/known-issues.md`](docs/known-issues.md). Update that file when a limitation is fixed or a new repository-wide issue is discovered.
