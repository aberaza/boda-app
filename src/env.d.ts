/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RSVP_TOKEN_PEPPER?: string;
  readonly RSVP_RATE_LIMIT_PEPPER?: string;
  readonly ADMIN_EXPORT_SECRET?: string;
  readonly SITE_URL?: string;
  readonly PUBLIC_MAP_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
