import type { APIRoute } from 'astro';
import { assertSameOrigin, jsonResponse, rsvpErrorResponse } from '../../../server/rsvp/http';
import { clearInvitationSession } from '../../../server/rsvp/session';

export const POST: APIRoute = async (context) => {
  try {
    assertSameOrigin(context.request);
    await clearInvitationSession(context);
    return jsonResponse({ ok: true });
  } catch (error) {
    return rsvpErrorResponse(error);
  }
};
