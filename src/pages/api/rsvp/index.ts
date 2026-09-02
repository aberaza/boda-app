import type { APIRoute } from 'astro';
import {
  assertSameOrigin,
  jsonResponse,
  readJsonWithLimit,
  rsvpErrorResponse,
} from '../../../server/rsvp/http';
import { enforceRsvpRateLimit } from '../../../server/rsvp/rate-limit';
import { getRsvpSnapshot } from '../../../server/rsvp/repository';
import { updateInvitationRsvp } from '../../../server/rsvp/service';
import { requireInvitationSession } from '../../../server/rsvp/session';

export const GET: APIRoute = async (context) => {
  try {
    await enforceRsvpRateLimit(context, 'rsvp-read', 120, 60);
    const invitationId = await requireInvitationSession(context);
    return jsonResponse({ ok: true, data: await getRsvpSnapshot(invitationId) });
  } catch (error) {
    return rsvpErrorResponse(error);
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    await enforceRsvpRateLimit(context, 'rsvp-write', 30, 60);
    assertSameOrigin(context.request);
    const invitationId = await requireInvitationSession(context);
    const input = await readJsonWithLimit(context.request);
    const snapshot = await updateInvitationRsvp(invitationId, input);
    return jsonResponse({ ok: true, data: snapshot });
  } catch (error) {
    return rsvpErrorResponse(error);
  }
};
