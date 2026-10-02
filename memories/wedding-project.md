Repository review — 2026-08-30

- Project: Astro 6 SSR site deployed with @astrojs/netlify; Tailwind v4, GSAP, Leaflet.
- Branch: feat/jerez_overlay, clean tracked worktree except untracked .envrc, memories/, savedateorig.jpeg.
- Main app: src/pages/index.astro; content in src/config/content.ts and src/i18n/translations.ts; Spanish/French/English query-string localization.
- Build passes: npm run build. routes:dry passes but rewrites src/data/flight-routes.json, so avoid treating it as read-only.
- Key findings: .envrc contains a real-looking SerpAPI secret and is untracked; revoke/rotate immediately and remove it from local sharing. Event date conflicts: content.ts says 9 May 2027 while translations say 8 May 2027. RSVP UI is static and does not submit; POST API only echoes payload and admin export returns demo CSV, so no persistence. Many hotel/city texts remain placeholders. BaseLayout hardcodes lang=es. No automated test/lint scripts.
