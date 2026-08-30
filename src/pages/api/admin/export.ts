import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization');

  if (!auth || auth !== `Bearer ${import.meta.env.ADMIN_EXPORT_SECRET ?? ''}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const csv = [
    'name,attendance,partner,dietary_needs,transport_needed',
    'Demo Guest,yes,,none,no',
  ].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rsvp-export.csv"',
    },
  });
};
