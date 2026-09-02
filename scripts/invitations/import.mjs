#!/usr/bin/env node
import { getDatabase } from '@netlify/database';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { expandBatches, createAccessToken, hashAccessToken, parseWorkbook } from './shared.mjs';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('-'));
const apply = args.includes('--apply');
const outputIndex = args.indexOf('--manifest');
const manifestPath = outputIndex === -1 ? null : args[outputIndex + 1];
if (!input) {
  console.error(
    'Usage: npm run invites:import -- path/to/invitations.xlsx [--apply --manifest private/manifest.json]',
  );
  process.exit(1);
}
const workbook = await parseWorkbook(input);
const invitations = [...workbook.invitations, ...expandBatches(workbook.batches)];
const duplicates = invitations.filter(
  (row, index) =>
    invitations.findIndex((candidate) => candidate.external_id === row.external_id) !== index,
);
if (duplicates.length)
  throw new Error(`Duplicate generated external_id: ${duplicates[0].external_id}`);
console.log(
  `${apply ? 'Applying' : 'Dry run'}: ${invitations.length} invitations, ${workbook.people.length} people, ${workbook.claimCodes.length} shared claim codes`,
);
if (!apply) {
  console.log('No database writes performed. Pass --apply to import.');
  process.exit(0);
}

const pepper = process.env.RSVP_TOKEN_PEPPER;
if (!pepper) throw new Error('RSVP_TOKEN_PEPPER is required');
if (!manifestPath)
  throw new Error('--manifest is required with --apply so newly generated tokens are not lost');
const db = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
const client = await db.pool.connect();
const manifest = [];
const claimManifest = [];
const output = resolve(manifestPath);
try {
  await client.query('BEGIN');
  for (const invitation of invitations) {
    const existing = await client.query(
      'SELECT id, token_hash FROM invitations WHERE external_id = $1 FOR UPDATE',
      [invitation.external_id],
    );
    let token = null;
    let tokenHash = existing.rows[0]?.token_hash ?? null;
    if (!tokenHash) {
      token = createAccessToken();
      tokenHash = hashAccessToken(token, pepper);
    }
    const result = await client.query(
      `INSERT INTO invitations (external_id, kind, token_hash, locale, primary_first_name, primary_last_name,
         primary_name_editable, max_companions, companion_policy, rsvp_deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (external_id) DO UPDATE SET kind=EXCLUDED.kind, locale=EXCLUDED.locale,
         primary_first_name=EXCLUDED.primary_first_name, primary_last_name=EXCLUDED.primary_last_name,
         primary_name_editable=EXCLUDED.primary_name_editable, max_companions=EXCLUDED.max_companions,
         companion_policy=EXCLUDED.companion_policy, rsvp_deadline=EXCLUDED.rsvp_deadline
       RETURNING id`,
      [
        invitation.external_id,
        invitation.kind,
        tokenHash,
        invitation.locale,
        invitation.primary_first_name,
        invitation.primary_last_name,
        invitation.primary_name_editable,
        invitation.max_companions,
        invitation.companion_policy,
        invitation.rsvp_deadline,
      ],
    );
    const invitationId = result.rows[0].id;
    const people = workbook.people.filter(
      (person) => person.external_id === invitation.external_id,
    );
    for (const person of people) {
      await client.query(
        `INSERT INTO invitation_people (invitation_id, role, first_name, last_name, name_editable, optional, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (invitation_id, position) DO UPDATE SET role=EXCLUDED.role, first_name=EXCLUDED.first_name,
           last_name=EXCLUDED.last_name, name_editable=EXCLUDED.name_editable, optional=EXCLUDED.optional`,
        [
          invitationId,
          person.role,
          person.first_name,
          person.last_name,
          person.name_editable,
          person.optional,
          person.position,
        ],
      );
    }
    await client.query(
      `INSERT INTO rsvp_audit_log (invitation_id, action, actor) VALUES ($1, 'invitation.imported', 'importer')`,
      [invitationId],
    );
    if (token) manifest.push({ externalId: invitation.external_id, token });
  }
  for (const claim of workbook.claimCodes) {
    const existing = await client.query(
      'SELECT id, token_hash FROM generic_claim_codes WHERE external_id = $1 FOR UPDATE',
      [claim.external_id],
    );
    let token = null;
    let tokenHash = existing.rows[0]?.token_hash ?? null;
    if (!tokenHash) {
      token = createAccessToken();
      tokenHash = hashAccessToken(token, pepper);
    }
    await client.query(
      `INSERT INTO generic_claim_codes (external_id, token_hash, locale, max_companions, max_claims, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (external_id) DO UPDATE SET locale=EXCLUDED.locale,
         max_companions=EXCLUDED.max_companions, max_claims=EXCLUDED.max_claims,
         expires_at=EXCLUDED.expires_at`,
      [
        claim.external_id,
        tokenHash,
        claim.locale,
        claim.max_companions,
        claim.max_claims,
        claim.expires_at,
      ],
    );
    if (token) claimManifest.push({ externalId: claim.external_id, token, kind: 'claim' });
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
console.log(`✅ Imported ${invitations.length} invitations.`);
manifest.push(...claimManifest);
if (manifest.length) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600 });
  console.log(`⚠️ ${manifest.length} new private tokens were written to the private manifest.`);
}
