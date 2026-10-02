# RSVP operations

## Architecture

The RSVP uses Astro SSR on Netlify, Astro Sessions backed by Netlify Blobs, and Netlify Database for invitations and responses. Private access tokens are stored only as SHA-256 hashes with `RSVP_TOKEN_PEPPER`.

## Required environment

Link this repository to its Netlify site, configure Netlify Database for that site and set `RSVP_TOKEN_PEPPER`, `ADMIN_EXPORT_SECRET`, and `SITE_URL` in Netlify. Never commit their values.

## Migrations

Netlify detects SQL files in `netlify/database/migrations/` during deployment. For local verification:

```sh
netlify database migrations apply
```

## Excel workflow

Generate the private template:

```sh
npm run invites:template -- private/invitations.xlsx
```

Validate it without database writes:

```sh
npm run invites:validate -- private/invitations.xlsx
npm run invites:import -- private/invitations.xlsx
```

Apply intentionally from a linked Netlify environment:

```sh
netlify database connect --json
NETLIFY_DB_URL="<connection_string>" RSVP_TOKEN_PEPPER="<pepper>" \
npm run invites:import -- private/invitations.xlsx --apply --manifest private/manifest.json
```

The local database connection returned by `netlify database connect --json` is temporary; run the import while it is active. The importer is idempotent by `external_id` and does not delete existing RSVP responses. Never reduce companion capacity below existing responses without reviewing those responses first.

## QR workflow

QR generation accepts a private JSON manifest containing `{ "externalId", "token" }` entries. Tokens must be captured by a secure provisioning workflow and the manifest must remain under the ignored `private/` directory.

```sh
npm run invites:qr -- --manifest private/manifest.json --base-url https://your-domain.example
```

QRs are generated locally as SVG and PNG; private invitation URLs are not sent to third parties.

## Rate limiting

The RSVP access and API routes use PostgreSQL-backed fixed-window limits keyed by a one-way hash of the client address. Configure `RSVP_RATE_LIMIT_PEPPER` separately from the token pepper. Expired buckets can be removed periodically with `DELETE FROM rsvp_rate_limits WHERE expires_at < now()`.

## Privacy

RSVP pages use `no-store`, `noindex`, and `no-referrer`. Dietary requirements may be health data: restrict exports, retain only as long as necessary, and delete after the event according to the couple's retention policy.

## Shared generic QR codes

Rows in the `SharedClaimCodes` Excel sheet provision the two genuinely shared QR codes. Shared generic codes are stored in `generic_claim_codes`. Scanning one must call `POST /api/rsvp/claim`, which transactionally consumes one claim and returns a new private access URL. The shared QR itself is never an editing credential. Prefer unique anonymous QR codes per physical card when possible.
