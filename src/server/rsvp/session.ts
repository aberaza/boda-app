import type { APIContext } from 'astro';
import { RsvpError } from './errors';

const SESSION_KEY = 'rsvpInvitationId';

export async function setInvitationSession(
  context: APIContext,
  invitationId: string,
): Promise<void> {
  if (!context.session)
    throw new RsvpError('session_unavailable', 503, 'Session storage is unavailable');
  await context.session.regenerate();
  context.session.set(SESSION_KEY, invitationId);
}

export async function requireInvitationSession(context: APIContext): Promise<string> {
  const invitationId = await context.session?.get(SESSION_KEY);
  if (typeof invitationId !== 'string')
    throw new RsvpError('not_authenticated', 401, 'Invitation access is required');
  return invitationId;
}

export async function clearInvitationSession(context: APIContext): Promise<void> {
  context.session?.delete(SESSION_KEY);
}
