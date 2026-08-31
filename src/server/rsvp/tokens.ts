import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 24;

export function createAccessToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashAccessToken(token: string, pepper = getTokenPepper()): string {
  return createHash('sha256').update(pepper).update('\0').update(token).digest('hex');
}

export function isPlausibleAccessToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{24,128}$/.test(token);
}

export function safeHashEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getTokenPepper(): string {
  const pepper = import.meta.env.RSVP_TOKEN_PEPPER;
  if (!pepper) throw new Error('RSVP_TOKEN_PEPPER is not configured');
  return pepper;
}
