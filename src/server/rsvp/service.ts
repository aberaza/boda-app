import type { APIContext } from 'astro';
import type { RsvpSnapshot } from './domain';
import { RsvpError } from './errors';
import {
  claimGenericCode,
  findInvitationIdByTokenHash,
  getRsvpSnapshot,
  saveRsvp,
} from './repository';
import { genericClaimSchema, saveRsvpSchema } from './schemas';
import { createAccessToken, hashAccessToken, isPlausibleAccessToken } from './tokens';

export async function authenticateInvitationToken(token: string): Promise<string> {
  if (!isPlausibleAccessToken(token))
    throw new RsvpError('invalid_token', 404, 'Invitation not found');
  const invitationId = await findInvitationIdByTokenHash(hashAccessToken(token));
  if (!invitationId) throw new RsvpError('invalid_token', 404, 'Invitation not found');
  const snapshot = await getRsvpSnapshot(invitationId);
  assertInvitationReadable(snapshot);
  return invitationId;
}

export async function updateInvitationRsvp(
  invitationId: string,
  rawInput: unknown,
): Promise<RsvpSnapshot> {
  const parsed = saveRsvpSchema.safeParse(rawInput);
  if (!parsed.success) throw new RsvpError('invalid_payload', 400, 'Invalid RSVP payload');
  return saveRsvp(invitationId, parsed.data);
}

export function getRequestLocale(
  context: APIContext,
  fallback: RsvpSnapshot['invitation']['locale'] = 'es',
) {
  const requested = context.url.searchParams.get('lang');
  return requested === 'es' || requested === 'fr' || requested === 'en' ? requested : fallback;
}

function assertInvitationReadable(snapshot: RsvpSnapshot): void {
  if (snapshot.invitation.status !== 'active') {
    throw new RsvpError('invitation_inactive', 403, 'Invitation is inactive');
  }
}

export async function claimSharedCode(code: string, rawInput: unknown) {
  if (!isPlausibleAccessToken(code))
    throw new RsvpError('invalid_claim_code', 404, 'Claim code not found');
  const parsed = genericClaimSchema.safeParse(rawInput);
  if (!parsed.success) throw new RsvpError('invalid_payload', 400, 'Invalid claim payload');
  const accessToken = createAccessToken();
  const claimed = await claimGenericCode(
    hashAccessToken(code),
    parsed.data.firstName,
    parsed.data.lastName,
    hashAccessToken(accessToken),
    parsed.data.locale,
  );
  return { ...claimed, accessToken };
}
