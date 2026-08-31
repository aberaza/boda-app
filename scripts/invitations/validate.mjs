#!/usr/bin/env node
import { expandBatches, parseWorkbook } from './shared.mjs';

const input = process.argv[2];
if (!input) {
  console.error('Usage: npm run invites:validate -- path/to/invitations.xlsx');
  process.exit(1);
}
try {
  const workbook = await parseWorkbook(input);
  const generated = expandBatches(workbook.batches);
  console.log(`✅ Valid workbook: ${workbook.inputPath}`);
  console.log(`   Named/anonymous rows: ${workbook.invitations.length}`);
  console.log(`   Preassigned people: ${workbook.people.length}`);
  console.log(`   Generated anonymous invitations: ${generated.length}`);
  console.log(`   Shared claim QR codes: ${workbook.claimCodes.length}`);
} catch (error) {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
