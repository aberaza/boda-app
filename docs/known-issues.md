# Known issues

This file records limitations found during the repository review on 30 August 2026.

## Security

- `.envrc` is untracked and contains a real-looking SerpAPI credential. Revoke/rotate that credential immediately and remove the secret from the working tree. Use `.env.example` for documentation only.
- The admin export endpoint uses a shared bearer secret but has no audit logging, rate limiting or more granular authorization.

## Functional gaps

- **Resolved in code:** the RSVP form, token access, Netlify Database persistence, optimistic updates and real CSV export are implemented. Production still requires linking/enabling Netlify Database, applying migrations and provisioning invitations.
- Shared generic QR claim support exists at API level, but its public claim form and recovery UX are not yet implemented.
- PostgreSQL-backed rate limiting is implemented; external error monitoring and alerting remain to be added before public launch.

## Content

- **Resolved:** the wedding date is 8 May 2027. `src/config/content.ts` and all locale translations now use that date.
- Hotel names, URLs and booking instructions still contain placeholder content, including `example.com`.
- Several Jerez and accommodation descriptions explicitly identify themselves as provisional.
- **Resolved:** RSVP user-facing copy is available in Spanish, French and English.

## Localization and accessibility

- **Resolved:** `BaseLayout.astro` receives the selected locale.
- API error responses and RSVP labels need consistent localization if the RSVP flow becomes multilingual.
- **Resolved:** the RSVP uses semantic form controls, server validation and loading/error/success feedback.

## Quality and maintenance

- **Resolved:** the large home template is split into focused Astro components, with its browser behavior in `src/scripts/home.ts`.
- The slideshow supports wheel/trackpad navigation, native touch scroll snap, dot controls and arrow/WASD/HJKL keyboard navigation.
- **Resolved:** automated Astro/TypeScript checks, ESLint, Prettier, Vitest, Playwright and CI are configured. The RSVP endpoint tests intentionally cover its current scaffolding behavior only.
- **Resolved:** the route generator now defaults to the wedding date, validates `--date`, handles API/network errors, writes atomically, and supports `--output` for non-destructive previews.
- Valencia and Granada still have no mock routes, so the dry-run output is intentionally incomplete for those origins.
- Generated flight prices and availability are time-sensitive and should not be treated as permanent content.
