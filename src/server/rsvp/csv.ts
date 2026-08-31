import type { RsvpExportRow } from './repository';

const columns: Array<[keyof RsvpExportRow, string]> = [
  ['externalId', 'invitation_id'],
  ['locale', 'locale'],
  ['revision', 'revision'],
  ['guestRole', 'guest_role'],
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['attendance', 'attendance'],
  ['dietaryNeeds', 'dietary_needs'],
  ['transportNeeded', 'transport_needed'],
  ['message', 'message'],
  ['contactEmail', 'contact_email'],
  ['contactPhone', 'contact_phone'],
  ['updatedAt', 'updated_at'],
];

export function renderRsvpCsv(rows: RsvpExportRow[]): string {
  return (
    [
      columns.map(([, heading]) => csvCell(heading)).join(','),
      ...rows.map((row) => columns.map(([key]) => csvCell(row[key])).join(',')),
    ].join('\r\n') + '\r\n'
  );
}

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
