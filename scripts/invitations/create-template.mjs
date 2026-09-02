#!/usr/bin/env node
import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const output = resolve(process.argv[2] ?? 'private/invitations-template.xlsx');
await mkdir(dirname(output), { recursive: true });
const workbook = new ExcelJS.Workbook();
workbook.creator = 'Bodorrio RSVP';

addSheet(workbook, 'Invitations', [
  [
    'external_id',
    'kind',
    'locale',
    'primary_first_name',
    'primary_last_name',
    'primary_name_editable',
    'max_companions',
    'companion_policy',
    'rsvp_deadline',
  ],
  ['INV-001', 'named', 'es', 'Ana', 'García', false, 1, 'open', '2027-04-08T23:59:59Z'],
  ['GEN-S-001', 'anonymous', 'es', '', '', true, 0, 'none', '2027-04-08T23:59:59Z'],
]);
addSheet(workbook, 'People', [
  ['external_id', 'position', 'role', 'first_name', 'last_name', 'name_editable', 'optional'],
  ['INV-001', 1, 'named_companion', 'Alex', 'Ejemplo', true, true],
]);
addSheet(workbook, 'GenericBatches', [
  ['template', 'quantity', 'locale', 'max_companions'],
  ['GENERIC-SINGLE', 10, 'es', 0],
  ['GENERIC-PLUS-ONE', 10, 'es', 1],
]);
addSheet(workbook, 'SharedClaimCodes', [
  ['external_id', 'locale', 'max_companions', 'max_claims', 'expires_at'],
  ['SHARED-SINGLE', 'es', 0, 100, '2027-04-08T23:59:59Z'],
  ['SHARED-PLUS-ONE', 'es', 1, 100, '2027-04-08T23:59:59Z'],
]);
await workbook.xlsx.writeFile(output);
console.log(`✅ Created ${output}`);

function addSheet(book, name, rows) {
  const sheet = book.addWorksheet(name);
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = 24;
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}
