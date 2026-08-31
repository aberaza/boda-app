import { getRsvpDatabase } from './database';
import type {
  Invitation,
  InvitationPerson,
  RsvpGuest,
  RsvpSnapshot,
  SaveRsvpInput,
} from './domain';
import { RsvpError } from './errors';

type TransactionClient = {
  query: <Row = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Row[] }>;
  release: () => void;
};

interface InvitationRow {
  id: string;
  external_id: string;
  kind: Invitation['kind'];
  locale: Invitation['locale'];
  status: Invitation['status'];
  primary_first_name: string | null;
  primary_last_name: string | null;
  primary_name_editable: boolean;
  max_companions: number;
  companion_policy: Invitation['companionPolicy'];
  rsvp_deadline: Date | null;
}

interface PersonRow {
  id: string;
  role: InvitationPerson['role'];
  first_name: string;
  last_name: string;
  name_editable: boolean;
  optional: boolean;
  position: number;
}

interface RsvpRow {
  id: string;
  revision: number;
  contact_email: string | null;
  contact_phone: string | null;
  updated_at: Date;
}

interface GuestRow {
  invitation_person_id: string | null;
  role: RsvpGuest['role'];
  first_name: string;
  last_name: string;
  attendance: RsvpGuest['attendance'];
  dietary_needs: string;
  transport_needed: RsvpGuest['transportNeeded'];
  message: string;
  position: number;
}

export interface ClaimedInvitation {
  invitationId: string;
  locale: Invitation['locale'];
}

export async function claimGenericCode(
  codeHash: string,
  firstName: string,
  lastName: string,
  tokenHash: string,
  locale?: Invitation['locale'],
): Promise<ClaimedInvitation> {
  const { pool } = getRsvpDatabase();
  const client = (await pool.connect()) as unknown as TransactionClient;
  try {
    await client.query('BEGIN');
    const codeResult = await client.query<{
      id: string;
      external_id: string;
      locale: Invitation['locale'];
      max_companions: number;
      max_claims: number;
      claims_used: number;
      status: Invitation['status'];
      expires_at: Date | null;
    }>(
      `SELECT id, external_id, locale, max_companions, max_claims, claims_used, status, expires_at
       FROM generic_claim_codes WHERE token_hash = $1 FOR UPDATE`,
      [codeHash],
    );
    const code = codeResult.rows[0];
    if (
      !code ||
      code.status !== 'active' ||
      (code.expires_at && code.expires_at.getTime() < Date.now())
    ) {
      throw new RsvpError('invalid_claim_code', 404, 'Claim code not found');
    }
    if (code.claims_used >= code.max_claims) {
      throw new RsvpError('claim_limit_reached', 409, 'Claim code limit reached');
    }
    const selectedLocale = locale ?? code.locale;
    const externalId = `${code.external_id}-CLAIM-${String(code.claims_used + 1).padStart(4, '0')}`;
    const invitationResult = await client.query<{ id: string }>(
      `INSERT INTO invitations (external_id, kind, token_hash, locale, primary_first_name,
         primary_last_name, primary_name_editable, max_companions, companion_policy, claimed_from_code_id)
       VALUES ($1, 'anonymous', $2, $3, $4, $5, true, $6, $7, $8) RETURNING id`,
      [
        externalId,
        tokenHash,
        selectedLocale,
        firstName,
        lastName,
        code.max_companions,
        code.max_companions > 0 ? 'open' : 'none',
        code.id,
      ],
    );
    await client.query(
      'UPDATE generic_claim_codes SET claims_used = claims_used + 1 WHERE id = $1',
      [code.id],
    );
    await client.query(
      `INSERT INTO rsvp_audit_log (invitation_id, action, actor) VALUES ($1, 'invitation.claimed', 'guest')`,
      [invitationResult.rows[0].id],
    );
    await client.query('COMMIT');
    return { invitationId: invitationResult.rows[0].id, locale: selectedLocale };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findInvitationIdByTokenHash(tokenHash: string): Promise<string | null> {
  const { sql } = getRsvpDatabase();
  const rows = await sql<{ id: string }>`
    SELECT id FROM invitations WHERE token_hash = ${tokenHash} LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

export async function getRsvpSnapshot(invitationId: string): Promise<RsvpSnapshot> {
  const { sql } = getRsvpDatabase();
  const invitations = await sql<InvitationRow>`
    SELECT id, external_id, kind, locale, status, primary_first_name, primary_last_name,
           primary_name_editable, max_companions, companion_policy, rsvp_deadline
    FROM invitations WHERE id = ${invitationId} LIMIT 1
  `;
  const row = invitations[0];
  if (!row) throw new RsvpError('invitation_not_found', 404, 'Invitation not found');

  const peopleRows = await sql<PersonRow>`
    SELECT id, role, first_name, last_name, name_editable, optional, position
    FROM invitation_people WHERE invitation_id = ${invitationId} ORDER BY position
  `;
  const rsvpRows = await sql<RsvpRow>`
    SELECT id, revision, contact_email, contact_phone, updated_at
    FROM rsvps WHERE invitation_id = ${invitationId} LIMIT 1
  `;
  const rsvp = rsvpRows[0];
  const guestRows = rsvp
    ? await sql<GuestRow>`
        SELECT invitation_person_id, role, first_name, last_name, attendance, dietary_needs,
               transport_needed, message, position
        FROM rsvp_guests WHERE rsvp_id = ${rsvp.id} ORDER BY position
      `
    : [];

  return {
    invitation: {
      id: row.id,
      externalId: row.external_id,
      kind: row.kind,
      locale: row.locale,
      status: row.status,
      primaryFirstName: row.primary_first_name,
      primaryLastName: row.primary_last_name,
      primaryNameEditable: row.primary_name_editable,
      maxCompanions: row.max_companions,
      companionPolicy: row.companion_policy,
      rsvpDeadline: row.rsvp_deadline?.toISOString() ?? null,
      people: peopleRows.map(mapPerson),
    },
    revision: rsvp?.revision ?? 0,
    contactEmail: rsvp?.contact_email ?? null,
    contactPhone: rsvp?.contact_phone ?? null,
    guests: guestRows.map(mapGuest),
    updatedAt: rsvp?.updated_at.toISOString() ?? null,
  };
}

export async function saveRsvp(invitationId: string, input: SaveRsvpInput): Promise<RsvpSnapshot> {
  const { pool } = getRsvpDatabase();
  const client = (await pool.connect()) as unknown as TransactionClient;
  try {
    await client.query('BEGIN');
    const invitationResult = await client.query<InvitationRow>(
      `SELECT id, external_id, kind, locale, status, primary_first_name, primary_last_name,
              primary_name_editable, max_companions, companion_policy, rsvp_deadline
       FROM invitations WHERE id = $1 FOR UPDATE`,
      [invitationId],
    );
    const invitation = invitationResult.rows[0];
    if (!invitation) throw new RsvpError('invitation_not_found', 404, 'Invitation not found');
    validateInvitationState(invitation);
    validateGuestCapacity(invitation, input.guests);

    const peopleResult = await client.query<PersonRow>(
      `SELECT id, role, first_name, last_name, name_editable, optional, position
       FROM invitation_people WHERE invitation_id = $1 ORDER BY position`,
      [invitationId],
    );
    validateLockedNames(invitation, peopleResult.rows, input.guests);

    const existing = await client.query<RsvpRow>(
      'SELECT id, revision, contact_email, contact_phone, updated_at FROM rsvps WHERE invitation_id = $1 FOR UPDATE',
      [invitationId],
    );
    const current = existing.rows[0];
    if ((current?.revision ?? 0) !== input.revision) {
      throw new RsvpError('revision_conflict', 409, 'The RSVP was updated elsewhere');
    }

    const rsvpId = current
      ? await updateRsvp(client, current.id, input)
      : await insertRsvp(client, invitationId, input);
    await client.query('DELETE FROM rsvp_guests WHERE rsvp_id = $1', [rsvpId]);
    for (const guest of input.guests) await insertGuest(client, rsvpId, guest);
    await client.query(
      `INSERT INTO rsvp_audit_log (invitation_id, action, actor, metadata)
       VALUES ($1, $2, 'guest', $3::jsonb)`,
      [
        invitationId,
        current ? 'rsvp.updated' : 'rsvp.created',
        JSON.stringify({ guestCount: input.guests.length }),
      ],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return getRsvpSnapshot(invitationId);
}

export interface RsvpExportRow {
  externalId: string;
  locale: string;
  revision: number | null;
  guestRole: string | null;
  firstName: string | null;
  lastName: string | null;
  attendance: string | null;
  dietaryNeeds: string | null;
  transportNeeded: string | null;
  message: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  updatedAt: string | null;
}

export async function listRsvpExportRows(): Promise<RsvpExportRow[]> {
  const { sql } = getRsvpDatabase();
  const rows = await sql<{
    external_id: string;
    locale: string;
    revision: number | null;
    guest_role: string | null;
    first_name: string | null;
    last_name: string | null;
    attendance: string | null;
    dietary_needs: string | null;
    transport_needed: string | null;
    message: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    updated_at: Date | null;
  }>`
    SELECT i.external_id, i.locale, r.revision, g.role AS guest_role, g.first_name, g.last_name,
           g.attendance, g.dietary_needs, g.transport_needed, g.message,
           r.contact_email, r.contact_phone, r.updated_at
    FROM invitations i
    LEFT JOIN rsvps r ON r.invitation_id = i.id
    LEFT JOIN rsvp_guests g ON g.rsvp_id = r.id
    ORDER BY i.external_id, g.position
  `;
  return rows.map((row) => ({
    externalId: row.external_id,
    locale: row.locale,
    revision: row.revision,
    guestRole: row.guest_role,
    firstName: row.first_name,
    lastName: row.last_name,
    attendance: row.attendance,
    dietaryNeeds: row.dietary_needs,
    transportNeeded: row.transport_needed,
    message: row.message,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    updatedAt: row.updated_at?.toISOString() ?? null,
  }));
}

function validateInvitationState(invitation: InvitationRow): void {
  if (invitation.status !== 'active')
    throw new RsvpError('invitation_inactive', 403, 'Invitation is inactive');
  if (invitation.rsvp_deadline && invitation.rsvp_deadline.getTime() < Date.now()) {
    throw new RsvpError('rsvp_closed', 403, 'The RSVP deadline has passed');
  }
}

function validateGuestCapacity(invitation: InvitationRow, guests: RsvpGuest[]): void {
  const primaries = guests.filter((guest) => guest.role === 'primary');
  const companions = guests.filter((guest) => guest.role !== 'primary');
  if (primaries.length !== 1)
    throw new RsvpError('invalid_primary', 400, 'Exactly one primary guest is required');
  if (companions.length > invitation.max_companions) {
    throw new RsvpError('too_many_companions', 400, 'The invitation companion limit was exceeded');
  }
  if (invitation.companion_policy === 'none' && companions.length > 0) {
    throw new RsvpError('companions_not_allowed', 400, 'Companions are not allowed');
  }
}

function validateLockedNames(
  invitation: InvitationRow,
  people: PersonRow[],
  guests: RsvpGuest[],
): void {
  if (
    !invitation.primary_name_editable &&
    invitation.primary_first_name &&
    invitation.primary_last_name
  ) {
    const primary = guests.find((guest) => guest.role === 'primary');
    if (
      !primary ||
      primary.firstName !== invitation.primary_first_name ||
      primary.lastName !== invitation.primary_last_name
    ) {
      throw new RsvpError('primary_name_locked', 400, 'The primary guest name cannot be changed');
    }
  }
  for (const person of people.filter((candidate) => !candidate.name_editable)) {
    const guest = guests.find((candidate) => candidate.invitationPersonId === person.id);
    if (!guest || guest.firstName !== person.first_name || guest.lastName !== person.last_name) {
      throw new RsvpError('guest_name_locked', 400, 'A preassigned guest name cannot be changed');
    }
  }
}

async function insertRsvp(
  client: TransactionClient,
  invitationId: string,
  input: SaveRsvpInput,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO rsvps (invitation_id, revision, contact_email, contact_phone)
     VALUES ($1, 1, $2, $3) RETURNING id`,
    [invitationId, input.contactEmail, input.contactPhone],
  );
  return result.rows[0].id;
}

async function updateRsvp(
  client: TransactionClient,
  rsvpId: string,
  input: SaveRsvpInput,
): Promise<string> {
  await client.query(
    `UPDATE rsvps SET revision = revision + 1, contact_email = $2, contact_phone = $3 WHERE id = $1`,
    [rsvpId, input.contactEmail, input.contactPhone],
  );
  return rsvpId;
}

async function insertGuest(
  client: TransactionClient,
  rsvpId: string,
  guest: RsvpGuest,
): Promise<void> {
  await client.query(
    `INSERT INTO rsvp_guests (
       rsvp_id, invitation_person_id, role, first_name, last_name, attendance,
       dietary_needs, transport_needed, message, position
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      rsvpId,
      guest.invitationPersonId,
      guest.role,
      guest.firstName,
      guest.lastName,
      guest.attendance,
      guest.dietaryNeeds,
      guest.transportNeeded,
      guest.message,
      guest.position,
    ],
  );
}

function mapPerson(row: PersonRow): InvitationPerson {
  return {
    id: row.id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    nameEditable: row.name_editable,
    optional: row.optional,
    position: row.position,
  };
}

function mapGuest(row: GuestRow): RsvpGuest {
  return {
    invitationPersonId: row.invitation_person_id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    attendance: row.attendance,
    dietaryNeeds: row.dietary_needs,
    transportNeeded: row.transport_needed,
    message: row.message,
    position: row.position,
  };
}
