import type { APIRoute } from 'astro';
import {
  assertSameOrigin,
  jsonResponse,
  readJsonWithLimit,
  rsvpErrorResponse,
} from '../../../server/rsvp/http';
import { enforceRsvpRateLimit } from '../../../server/rsvp/rate-limit';
import { claimSharedCode } from '../../../server/rsvp/service';
import { setInvitationSession } from '../../../server/rsvp/session';

export const POST: APIRoute = async (context) => {
  try {
    await enforceRsvpRateLimit(context, 'claim-code', 10, 60);
    assertSameOrigin(context.request);
    const input = await readJsonWithLimit(context.request);
    if (
      !input ||
      typeof input !== 'object' ||
      !('code' in input) ||
      typeof input.code !== 'string'
    ) {
      return jsonResponse({ ok: false, error: 'invalid_payload' }, { status: 400 });
    }
    const { code, ...claimInput } = input;
    const claimed = await claimSharedCode(code, claimInput);
    await setInvitationSession(context, claimed.invitationId);
    // This is the only response that contains the newly created private token. The UI must
    // prompt the guest to save it; subsequent API calls rely on the session instead.
    return jsonResponse(
      { ok: true, accessUrl: `/rsvp/access/${claimed.accessToken}` },
      { status: 201 },
    );
  } catch (error) {
    return rsvpErrorResponse(error);
  }
};
