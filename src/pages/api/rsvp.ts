import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true, received: body }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
