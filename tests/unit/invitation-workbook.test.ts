import { describe, expect, it } from 'vitest';
import {
  expandBatches,
  invitationRowSchema,
  personRowSchema,
} from '../../scripts/invitations/shared.mjs';

describe('invitation workbook schemas', () => {
  it('expands generic batches into unique anonymous invitation records', () => {
    const rows = expandBatches([
      { template: 'PLUS', quantity: 2, locale: 'es', max_companions: 1 },
    ]);
    expect(rows.map((row: { external_id: string }) => row.external_id)).toEqual([
      'PLUS-001',
      'PLUS-002',
    ]);
    expect(rows.every((row: { companion_policy: string }) => row.companion_policy === 'open')).toBe(
      true,
    );
  });
  it('validates invitation and person rows', () => {
    expect(
      invitationRowSchema.safeParse({
        external_id: 'INV-1',
        kind: 'named',
        locale: 'es',
        primary_first_name: 'Ada',
        primary_last_name: 'Lovelace',
        primary_name_editable: false,
        max_companions: 0,
        companion_policy: 'none',
        rsvp_deadline: '',
      }).success,
    ).toBe(true);
    expect(
      personRowSchema.safeParse({
        external_id: 'INV-1',
        position: 1,
        role: 'named_companion',
        first_name: 'Alan',
        last_name: 'Turing',
        name_editable: false,
        optional: true,
      }).success,
    ).toBe(true);
  });
});
