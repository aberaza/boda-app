import { RsvpError } from './errors';

export const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, {
    ...init,
    headers: { ...PRIVATE_HEADERS, ...Object.fromEntries(new Headers(init.headers).entries()) },
  });
}

export function rsvpErrorResponse(error: unknown): Response {
  if (error instanceof RsvpError)
    return jsonResponse({ ok: false, error: error.code }, { status: error.status });
  console.error('Unexpected RSVP error');
  return jsonResponse({ ok: false, error: 'internal_error' }, { status: 500 });
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new RsvpError('invalid_origin', 403, 'Cross-origin requests are not allowed');
  }
}

export async function readJsonWithLimit(request: Request, maxBytes = 32_768): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > maxBytes)
    throw new RsvpError('payload_too_large', 413, 'Payload is too large');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new RsvpError('payload_too_large', 413, 'Payload is too large');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new RsvpError('invalid_json', 400, 'Invalid JSON');
  }
}
