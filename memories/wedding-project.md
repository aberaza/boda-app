# Wedding Project

## Overview
A wedding web app/page for Aritz's wedding. Mostly static with RSVP functionality.

## Tech Stack
- **Framework:** Astro (SSR mode)
- **Styling:** Tailwind CSS
- **Deployment:** Netlify (free tier, includes DB)
- **DB:** Netlify DB (Postgres via Neon, included in Netlify free plan)
- **Language:** i18n — Spanish (primary), French, English. Language stored per guest (in DB + encoded in QR token)

## QR / RSVP Flow
- QR encodes a URL: `https://yourwedding.com/rsvp?t=<token>`
- Token decodes to: guestId, language
- Guest info (name, partner, dietary needs) stored in DB, looked up by guestId
- RSVP form: confirm/decline, declare/skip partner, dietary needs/allergies
- POST /api/rsvp → saves to DB
- GET /api/admin/export → CSV/Excel (protected)

## Sections (public page)
- Hero / landing (invitation style)
- Event details (date, time, venue — updatable)
- Venue details
- City guide
- Hotel recommendations
- Side events schedule (pre/post wedding)

## Admin
- Hidden endpoint /admin
- Export guests + partners + dietary needs as CSV/Excel
- Simple auth (secret key or basic auth — TBD)

## Design System
- Fonts: Cormorant Garamond (display, `font-display`), DM Sans (body, `font-sans`) via Google Fonts
- Visual duality: Bauhaus (clean, grid, ink/paper) vs Mozárabe/Almohade (clay, 8-pointed star tessellation SVG)
  - Both patterns span full width per slide, each masked with CSS `mask-image` fading toward centre
  - They overlap in the ~25% centre zone → natural visual amalgam, not a hard split
  - Left col: DM Sans (data/labels), Right col: Cormorant Garamond (display/poetic)
- Animations: GSAP + ScrollTrigger (installed)
  - Scroll slideshow: `#scroll-driver` (4×100vh) drives a scrubbed master GSAP timeline
  - All slides are `position: fixed`, hidden scrollbar, crossfade + scale 1.03↔1↔0.97
  - `scrub: 1.2` for physical lag feel
- Pattern components:
  - `src/components/GeoPattern.astro` — Almohade 8-pointed star tessellation (accepts color, opacity)
  - `src/components/BauhausPattern.astro` — Bauhaus grid (thin lines, circles, compass arcs, accepts color, opacity)
- Images:
  - Hero: Unsplash `photo-1529651737248-dad5e287768e` (hands B&W), CSS grayscale(1)
  - Cuándo bg: https://cdn0.bodas.net/vendor/40644/3_2/1280/jpg/6_1_40644-162500944294411.jpeg (La Carreña vineyard)
  - La Finca photo: lacarrena.com/wp-content/uploads/2018/09/la-carreña-acceso-iluminado-boda.jpg
  - Pronto img: lacarrena.com/wp-content/uploads/2018/09/la-carreña-bodas-unicas-jerez.jpg

## Page Structure (index.astro)
Single-page scroll, 4 full-viewport sections:
1. Hero — fachada-principal.jpg, split overlay (ink left / clay+pattern right), "Nos casamos"
2. Cuándo — carril-acceso.jpg bg, two-column, date + city info
3. La Finca — acceso-iluminado-boda.jpg, clay panel right with geo pattern
4. Pronto más — paper bg, centred notice, geo pattern overlay

## RSVP / Personal section
- /rsvp?t=<token> — personalised per-guest page with RSVP form + transport question
- RSVP + transport info removed from main index, lives only in personal page

## Key Decisions Pending
- Admin auth method
- QR generation approach (Node script in project?)
- Content management (edit files directly vs CMS)
- Replace hotlinked lacarrena.com images with locally hosted assets when available
