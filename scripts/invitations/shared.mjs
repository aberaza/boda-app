import { createHash, randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import readXlsxFile from 'read-excel-file/node';
import { z } from 'zod';

const nullableText = z.preprocess(
  (value) =>
    value === undefined || value === null || String(value).trim() === ''
      ? null
      : String(value).trim(),
  z.string().max(100).nullable(),
);
const booleanCell = z.preprocess(
  (value) =>
    value === true ||
    value === 1 ||
    String(value).toLowerCase() === 'true' ||
    String(value).toLowerCase() === 'yes' ||
    String(value).toLowerCase() === 'sí',
  z.boolean(),
);
const integerCell = z.coerce.number().int().min(0).max(10);

export const invitationRowSchema = z.strictObject({
  external_id: z.string().trim().min(1).max(100),
  kind: z.enum(['named', 'anonymous']),
  locale: z.enum(['es', 'fr', 'en']).default('es'),
  primary_first_name: nullableText,
  primary_last_name: nullableText,
  primary_name_editable: booleanCell.default(false),
  max_companions: integerCell,
  companion_policy: z.enum(['none', 'open', 'fixed', 'mixed']),
  rsvp_deadline: z.preprocess(
    (value) =>
      value === undefined || value === null || String(value).trim() === '' ? null : new Date(value),
    z.date().nullable(),
  ),
});

export const personRowSchema = z.strictObject({
  external_id: z.string().trim().min(1).max(100),
  position: z.coerce.number().int().min(0).max(10),
  role: z.enum(['primary', 'named_companion']),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  name_editable: booleanCell.default(false),
  optional: booleanCell.default(false),
});

export const batchRowSchema = z.strictObject({
  template: z.string().trim().min(1).max(60),
  quantity: z.coerce.number().int().min(1).max(500),
  locale: z.enum(['es', 'fr', 'en']).default('es'),
  max_companions: integerCell,
});

export const claimCodeRowSchema = z.strictObject({
  external_id: z.string().trim().min(1).max(100),
  locale: z.enum(['es', 'fr', 'en']).default('es'),
  max_companions: integerCell,
  max_claims: z.coerce.number().int().min(1).max(1000),
  expires_at: z.preprocess(
    (value) =>
      value === undefined || value === null || String(value).trim() === '' ? null : new Date(value),
    z.date().nullable(),
  ),
});

export async function parseWorkbook(inputPath) {
  const absolute = resolve(inputPath);
  const sheets = await readXlsxFile(absolute);
  const invitations = parseSheet(sheets, 'Invitations', invitationRowSchema);
  const people = parseSheet(sheets, 'People', personRowSchema, true);
  const batches = parseSheet(sheets, 'GenericBatches', batchRowSchema, true);
  const claimCodes = parseSheet(sheets, 'SharedClaimCodes', claimCodeRowSchema, true);
  validateRelationships(invitations, people);
  return { invitations, people, batches, claimCodes, inputPath: absolute };
}

export function expandBatches(batches) {
  return batches.flatMap((batch) =>
    Array.from({ length: batch.quantity }, (_, index) => ({
      external_id: `${batch.template}-${String(index + 1).padStart(3, '0')}`,
      kind: 'anonymous',
      locale: batch.locale,
      primary_first_name: null,
      primary_last_name: null,
      primary_name_editable: true,
      max_companions: batch.max_companions,
      companion_policy: batch.max_companions > 0 ? 'open' : 'none',
      rsvp_deadline: null,
    })),
  );
}

export function createAccessToken() {
  return randomBytes(24).toString('base64url');
}
export function hashAccessToken(token, pepper) {
  if (!pepper) throw new Error('RSVP_TOKEN_PEPPER is required');
  return createHash('sha256').update(pepper).update('\0').update(token).digest('hex');
}

function parseSheet(sheets, name, schema, optional = false) {
  const sheet = sheets.find((candidate) => candidate.sheet === name);
  if (!sheet) {
    if (optional) return [];
    throw new Error(`Missing required worksheet: ${name}`);
  }
  const [rawHeaders = [], ...dataRows] = sheet.data;
  const headers = rawHeaders.map((header) => String(header ?? '').trim());
  return dataRows
    .filter((values) => values.some((value) => value !== null && value !== ''))
    .map((values, index) => {
      const row = Object.fromEntries(
        headers.map((header, column) => [header, values[column] ?? '']),
      );
      const result = schema.safeParse(row);
      if (!result.success) {
        throw new Error(
          `${name} row ${index + 2}: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
        );
      }
      return result.data;
    });
}
function validateRelationships(invitations, people) {
  const ids = new Set();
  for (const invitation of invitations) {
    if (ids.has(invitation.external_id))
      throw new Error(`Duplicate invitation external_id: ${invitation.external_id}`);
    ids.add(invitation.external_id);
    if (
      invitation.kind === 'named' &&
      (!invitation.primary_first_name || !invitation.primary_last_name)
    ) {
      throw new Error(`${invitation.external_id}: named invitations require a primary name`);
    }
    if (invitation.max_companions === 0 && invitation.companion_policy !== 'none') {
      throw new Error(
        `${invitation.external_id}: invitations without companions must use policy none`,
      );
    }
  }
  const positions = new Set();
  for (const person of people) {
    if (!ids.has(person.external_id))
      throw new Error(`People references unknown invitation: ${person.external_id}`);
    const key = `${person.external_id}:${person.position}`;
    if (positions.has(key)) throw new Error(`Duplicate People position: ${key}`);
    positions.add(key);
  }
}
