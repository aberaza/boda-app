# Repository Review

## Overall assessment

The repository is a good visual prototype for a wedding website, but it is not yet a complete production portal. The strongest part is the visual direction and the centralized presentation of the event information. The weakest parts are RSVP functionality, data persistence, security hardening and content completeness.

Current maturity: **prototype / early production foundation**, rather than a finished wedding portal.

## 1. Implementation quality

### Strengths

- Astro is a suitable choice for a content-focused site with limited dynamic behavior.
- The project uses SSR and the Netlify adapter, leaving room for server-side RSVP and invitation logic.
- Content is partially centralized in:
  - `src/config/content.ts`
  - `src/i18n/translations.ts`
  - `src/config/theme.ts`
- The visual system is reasonably componentized through reusable Astro components such as:
  - `BauhausPattern`
  - `GeoPattern`
  - `SectionHeading`
  - `Pill`
- Flight-route generation is separated into a script instead of being executed during page rendering.
- The build currently succeeds.
- The project contains useful architectural and maintenance documentation.

### Weaknesses

#### RSVP is only scaffolding

The main functional limitation is that the RSVP page is not actually implemented:

- The controls are not inside a real form.
- Buttons do not submit anything.
- There is no client-side state or feedback.
- `POST /api/rsvp` only echoes the received payload.
- No guest, invitation or RSVP data is persisted.
- Invitation tokens are read from the URL but not validated.

For a wedding portal, this is the most important missing feature.

#### The API lacks production validation

The RSVP endpoint currently accepts almost any JSON object. It should validate:

- Invitation token.
- Guest identity.
- Attendance status.
- Optional partner.
- Dietary requirements.
- Transport preference.
- Maximum lengths and allowed values.
- Duplicate submissions.

It should also return stable error responses and avoid echoing potentially sensitive submitted data.

#### Admin export is not functional

`/api/admin/export` currently returns a hardcoded demo record. It also needs:

- A real data source.
- CSV escaping.
- Explicit authorization handling.
- Rate limiting.
- Audit logging.
- Protection against accidental exposure of private guest data.

A shared bearer secret can be acceptable for a very small private portal, but it should be treated as a temporary solution.

#### Main-page modularization — resolved

The former monolithic `src/pages/index.astro` has been reduced to a composition layer. Navigation, primary slides, overlays and Jerez sub-sections now live under `src/components/home/`, route preparation is isolated in `src/lib/flight-routes.ts`, and browser behavior lives in `src/scripts/home.ts`.

The refactor preserves the desktop GSAP presentation and native touch scroll snap. It also adds shared keyboard navigation (arrow keys, WASD and HJKL), synchronized URL/navigation state, reduced-motion handling and safer dialog focus/visibility behavior.

#### No automated quality checks

There are no test, lint or type-check commands. At minimum, the project should add:

- `astro check`
- TypeScript validation.
- ESLint.
- Prettier.
- A small set of API tests.
- Possibly Playwright tests for the RSVP flow and language selector.

#### Generated data workflow is risky

`npm run routes:dry` rewrites `src/data/flight-routes.json`. This can create accidental changes in:

- Prices.
- Durations.
- Search dates.
- Available routes.
- Generated timestamps.

The generation process should ideally support:

- A separate output preview.
- A clearly recorded source/search date.
- Schema validation.
- A command that does not modify tracked data unless explicitly requested.

#### Secrets

The untracked `.envrc` contains a real-looking SerpAPI key. This is a serious issue even if the file is not committed. The key should be revoked and replaced immediately.

## 2. Usability, relevance and usefulness

### Strengths

The site already includes information that guests genuinely need:

- Date and venue.
- Location details.
- Transport context.
- Travel routes.
- Accommodation section.
- Surrounding destinations.
- Multilingual content.
- Interactive maps.
- Personalized RSVP URL concept.

The language selector is especially relevant because the guest list may be international.

### Usability concerns

#### The landing page prioritizes aesthetics over navigation

The animated slide-based experience is visually distinctive, but it may not be the fastest way for guests to find information. Wedding guests commonly want immediate access to:

- RSVP.
- Date.
- Venue.
- How to get there.
- Accommodation.
- Schedule.

The page should include a persistent, obvious primary action such as:

- “Confirm attendance”
- “RSVP”
- “View details and confirm”

The RSVP link should not be hidden inside the experience.

#### Scroll-driven navigation may be fragile

The desktop experience relies heavily on GSAP and custom scroll behavior. Potential issues include:

- Confusing behavior for users who do not understand the slide model.
- Poor keyboard navigation.
- Problems with browser history and deep links.
- Reduced usability on trackpads and mobile browsers.
- Possible issues for users who prefer reduced motion.

A conventional navigation fallback should always be available.

#### Mobile experience needs special attention

A wedding website will probably be accessed mainly from mobile devices. It should be tested on:

- Safari iOS.
- Chrome Android.
- Small-width phones.
- Slow networks.
- Landscape orientation.

The site should support:

- `prefers-reduced-motion`.
- Large touch targets.
- Clear focus states.
- No horizontal overflow.
- Readable text over image backgrounds.
- Easy access to maps and external links.

#### RSVP token handling needs a clear user experience

The personalized URL should provide a friendly experience:

- Recognize the guest.
- Show who is invited.
- Explain whether a partner can be added.
- Support updating an existing response.
- Show a confirmation after submission.
- Provide a clear error if the token is invalid or expired.

Displaying `sin token` is useful for development, but not a suitable production experience.

## 3. Is it a good wedding portal?

### As a visual invitation: yes

The design is distinctive and appropriate for a wedding:

- Strong visual identity.
- Personal content.
- Venue-focused storytelling.
- Elegant typography.
- Good use of photography and patterns.
- Multilingual support.
- Travel and accommodation information.

It feels more like a designed digital invitation than a generic template, which is a strength.

### As an operational wedding portal: not yet

A complete wedding portal should reduce organizational work for the couple. Currently, the project does not yet provide:

- Working RSVP collection.
- Guest management.
- Invitation validation.
- Reliable attendance reporting.
- Real accommodation information.
- Final booking instructions.
- Practical transport confirmation.
- Dietary and accessibility management.
- Update capability for guests.
- Production-grade administration.

The core distinction is:

> The site currently communicates the event well, but it does not yet manage the event.

## 4. Recommended improvements

### Highest priority

1. **Rotate the exposed SerpAPI credential.**
2. **Complete the RSVP flow.**
3. **Choose and implement a persistent data store.**
4. **Validate invitation tokens server-side.**
5. **Replace all placeholder hotels, URLs and booking copy.**
6. **Add a visible primary RSVP action on the home page.**
7. **Add success, error and loading states.**
8. **Add proper form semantics and accessibility support.**

### Recommended RSVP data model

A minimal model could contain:

- `invitation_token`
- `guest_name`
- `partner_name`
- `attendance`
- `dietary_needs`
- `transport_needed`
- `message`
- `submitted_at`
- `updated_at`

An invitation record should separately define:

- Main guest.
- Allowed partner.
- Number of seats.
- Token status.
- Optional language.
- RSVP deadline.

### Recommended technical direction

For a small private wedding portal, a simple serverless architecture would be sufficient:

- Astro API routes.
- Netlify Blobs, Supabase, Neon or another managed database.
- Server-side token validation.
- Environment variables for secrets.
- Protected admin export.
- Server-side schema validation using a library such as Zod.
- Rate limiting on RSVP and export endpoints.

The system does not need a complex authentication platform unless the portal grows significantly.

### Improve content architecture

The current separation between shared content and translations is good, but it should become stricter:

- Keep all event facts in one authoritative object.
- Avoid duplicating dates in translation files when possible.
- Pass the selected locale to `BaseLayout.astro`.
- Move hardcoded RSVP strings into the translation system.
- Define a common translation type to ensure all locales have the same keys.

### Improve accessibility

Add:

- Semantic `<form>` elements.
- Proper `<label>` associations.
- Keyboard-accessible overlays.
- Focus trapping inside dialogs.
- Escape-key closing.
- `aria-expanded` and `aria-controls`.
- Visible focus styles.
- Alternative text for every meaningful image.
- Reduced-motion support.
- Sufficient contrast over photographic backgrounds.
- A non-animated navigation fallback.

### Improve performance

- Optimize and size local images.
- Use responsive image formats such as WebP or AVIF.
- Consider lazy-loading non-critical images.
- Review externally hosted images for reliability and privacy.
- Avoid loading unnecessary map code until the relevant overlay is opened.
- Consider splitting the large home page into maintainable components.

### Improve operational reliability

Add:

- Type checking.
- Linting and formatting.
- API tests.
- End-to-end tests for RSVP.
- Schema validation for generated flight data.
- A documented deployment checklist.
- A production content checklist.
- Monitoring for failed RSVP submissions.

## Suggested prioritization

### Phase 1 — security and correctness

- Rotate the SerpAPI key.
- Confirm environment variables.
- Ensure the date is consistently 8 May 2027.
- Remove all placeholder links and hotel data.
- Add `astro check`.

### Phase 2 — RSVP

- Create the invitation and RSVP data model.
- Implement persistence.
- Validate tokens and payloads.
- Convert the static UI into a real form.
- Implement confirmation and error states.
- Replace the demo CSV export.

### Phase 3 — user experience

- Add a prominent RSVP call-to-action.
- Improve mobile and keyboard navigation.
- Add reduced-motion behavior.
- Pass the selected locale to the HTML layout.
- Improve overlay accessibility.

### Phase 4 — maintainability

- **Completed:** split `index.astro` into focused home components.
- Add tests and linting.
- Improve route-data generation.
- Add deployment and content-management procedures.

## Final verdict

The project has a strong visual foundation and is well suited to become an excellent wedding website. Its design, venue storytelling and multilingual structure are valuable strengths. However, the application should not yet be considered ready for real guest management because RSVP persistence, invitation validation and operational content are still incomplete.

The next most valuable implementation would be a complete, secure RSVP flow backed by persistent storage.
