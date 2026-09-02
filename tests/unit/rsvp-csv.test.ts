import { describe, expect, it } from 'vitest';
import { csvCell, renderRsvpCsv } from '../../src/server/rsvp/csv';

describe('RSVP CSV', () => {
  it('escapes quotes, commas and line breaks', () => {
    expect(csvCell('one, "two"\nthree')).toBe('"one, ""two""\nthree"');
  });
  it('neutralizes spreadsheet formula prefixes', () => {
    expect(csvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"');
  });
  it('renders invitation rows and a header', () => {
    const csv = renderRsvpCsv([
      {
        externalId: 'INV-1',
        locale: 'es',
        revision: null,
        guestRole: null,
        firstName: null,
        lastName: null,
        attendance: null,
        dietaryNeeds: null,
        transportNeeded: null,
        message: null,
        contactEmail: null,
        contactPhone: null,
        updatedAt: null,
      },
    ]);
    expect(csv).toContain('"invitation_id"');
    expect(csv).toContain('"INV-1"');
  });
});
