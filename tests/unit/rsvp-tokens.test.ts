import { describe, expect, it } from 'vitest';
import {
  createAccessToken,
  hashAccessToken,
  isPlausibleAccessToken,
  safeHashEquals,
} from '../../src/server/rsvp/tokens';

describe('RSVP access tokens', () => {
  it('creates high-entropy URL-safe tokens', () => {
    const first = createAccessToken();
    const second = createAccessToken();
    expect(first).not.toBe(second);
    expect(isPlausibleAccessToken(first)).toBe(true);
  });
  it('hashes deterministically with a pepper', () => {
    const hash = hashAccessToken('abcdefghijklmnopqrstuvwxyz123456', 'test-pepper');
    expect(hash).toBe(hashAccessToken('abcdefghijklmnopqrstuvwxyz123456', 'test-pepper'));
    expect(safeHashEquals(hash, hash)).toBe(true);
  });
});
