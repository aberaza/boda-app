import { createHash } from 'node:crypto';
import type { APIContext } from 'astro';
import { getRsvpDatabase } from './database';
import { RsvpError } from './errors';

type QueryClient = {
  query: <Row = { hits: number }>(text: string, values?: unknown[]) => Promise<{ rows: Row[] }>;
};

export async function enforceRsvpRateLimit(
  context: APIContext,
  action: string,
  windowLimit: number,
  windowSeconds: number,
): Promise<void> {
  const pepper = import.meta.env.RSVP_RATE_LIMIT_PEPPER ?? import.meta.env.RSVP_TOKEN_PEPPER;
  if (!pepper) throw new RsvpError('service_unavailable', 503, 'Rate limiting is not configured');
  const address = context.clientAddress || 'unknown';
  const keyHash = createHash('sha256')
    .update(pepper)
    .update('\0rate-limit\0')
    .update(address)
    .digest('hex');
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const expiresAt = new Date(windowStart.getTime() + windowMs * 2);
  const client = getRsvpDatabase().pool as unknown as QueryClient;
  const result = await client.query<{ hits: number }>(
    `INSERT INTO rsvp_rate_limits (action, key_hash, window_start, hits, expires_at)
     VALUES ($1, $2, $3, 1, $4)
     ON CONFLICT (action, key_hash, window_start)
     DO UPDATE SET hits = rsvp_rate_limits.hits + 1, expires_at = EXCLUDED.expires_at
     RETURNING hits`,
    [action, keyHash, windowStart, expiresAt],
  );
  if ((result.rows[0]?.hits ?? windowLimit + 1) > windowLimit) {
    throw new RsvpError('rate_limited', 429, 'Too many requests');
  }
}
