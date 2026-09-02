import { describe, expect, it } from 'vitest';
import { readJsonWithLimit, assertSameOrigin } from '../../src/server/rsvp/http';
import { saveRsvpSchema } from '../../src/server/rsvp/schemas';
import { RsvpError } from '../../src/server/rsvp/errors';

const validPayload = {
  revision: 0,
  contactEmail: null,
  contactPhone: null,
  guests: [
    {
      invitationPersonId: null,
      role: 'primary',
      firstName: 'Ada',
      lastName: 'Lovelace',
      attendance: 'yes',
      dietaryNeeds: '',
      transportNeeded: 'no',
      message: '',
      position: 0,
    },
  ],
};

describe('RSVP validation', () => {
  it('accepts a complete RSVP payload', () => {
    expect(saveRsvpSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects unknown fields and oversized text', () => {
    expect(saveRsvpSchema.safeParse({ ...validPayload, unexpected: true }).success).toBe(false);
    expect(
      saveRsvpSchema.safeParse({
        ...validPayload,
        guests: [{ ...validPayload.guests[0], message: 'x'.repeat(1001) }],
      }).success,
    ).toBe(false);
  });

  it('rejects invalid JSON with a stable error', async () => {
    const request = new Request('http://localhost/api/rsvp', { method: 'PUT', body: '{' });
    await expect(readJsonWithLimit(request)).rejects.toMatchObject({
      code: 'invalid_json',
      status: 400,
    });
  });

  it('rejects cross-origin writes', () => {
    const request = new Request('https://wedding.example/api/rsvp', {
      headers: { Origin: 'https://evil.example' },
    });
    expect(() => assertSameOrigin(request)).toThrowError(RsvpError);
  });
});
