import type { APIRoute } from 'astro';
import { PRIVATE_HEADERS } from '../../../server/rsvp/http';
import { RsvpError } from '../../../server/rsvp/errors';
import { enforceRsvpRateLimit } from '../../../server/rsvp/rate-limit';
import { authenticateInvitationToken } from '../../../server/rsvp/service';
import { setInvitationSession } from '../../../server/rsvp/session';

export const GET: APIRoute = async (context) => {
  try {
    await enforceRsvpRateLimit(context, 'token-access', 30, 60);
    const token = context.params.token ?? '';
    const invitationId = await authenticateInvitationToken(token);
    await setInvitationSession(context, invitationId);
    const redirect = new URL('/rsvp', context.url);
    const language = context.url.searchParams.get('lang');
    if (language) redirect.searchParams.set('lang', language);
    return new Response(null, {
      status: 303,
      headers: { ...PRIVATE_HEADERS, Location: redirect.toString() },
    });
  } catch (error) {
    const redirect = new URL('/rsvp', context.url);
    redirect.searchParams.set(
      'error',
      error instanceof RsvpError && error.code === 'session_unavailable'
        ? 'service_unavailable'
        : 'invalid_token',
    );
    return new Response(null, {
      status: 303,
      headers: { ...PRIVATE_HEADERS, Location: redirect.toString() },
    });
  }
};
