import { describe, expect, it } from 'vitest';
import { POST } from '../../src/pages/api/rsvp';

describe('POST /api/rsvp scaffold', () => {
  it('accepts a JSON object and returns the current echo response', async () => {
    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ attendance: 'yes' }),
    });
    const response = await POST({ request } as never);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true, received: { attendance: 'yes' } });
  });

  it('rejects invalid JSON', async () => {
    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    const response = await POST({ request } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid payload' });
  });
});
