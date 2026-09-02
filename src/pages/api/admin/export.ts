import { timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import { renderRsvpCsv } from '../../../server/rsvp/csv';
import { PRIVATE_HEADERS } from '../../../server/rsvp/http';
import { listRsvpExportRows } from '../../../server/rsvp/repository';

export const GET: APIRoute = async ({ request }) => {
  const configuredSecret = import.meta.env.ADMIN_EXPORT_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!configuredSecret || !secureEqual(supplied, configuredSecret)) {
    return new Response('Unauthorized', { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    const csv = renderRsvpCsv(await listRsvpExportRows());
    return new Response(csv, {
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvp-export.csv"',
      },
    });
  } catch {
    console.error('RSVP export failed');
    return new Response('Export failed', { status: 500, headers: PRIVATE_HEADERS });
  }
};

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
