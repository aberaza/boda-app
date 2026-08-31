#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import QRCode from 'qrcode';

const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
};
const manifestPath = value('--manifest');
const outputPath = resolve(value('--output') ?? 'private/generated-qr');
const baseUrl = value('--base-url') ?? process.env.SITE_URL;
if (!manifestPath || !baseUrl) {
  console.error(
    'Usage: npm run invites:qr -- --manifest private/manifest.json --base-url https://site.example [--output path]',
  );
  process.exit(1);
}
const manifest = JSON.parse(await readFile(resolve(manifestPath), 'utf8'));
if (!Array.isArray(manifest)) throw new Error('Manifest must be an array');
await mkdir(outputPath, { recursive: true });
const rows = ['external_id,url,svg,png'];
for (const item of manifest) {
  if (typeof item.externalId !== 'string' || typeof item.token !== 'string')
    throw new Error('Invalid manifest item');
  const url = new URL(
    item.kind === 'claim'
      ? `/rsvp/claim?code=${encodeURIComponent(item.token)}`
      : `/rsvp/access/${item.token}`,
    baseUrl,
  ).toString();
  const safeName = item.externalId.replace(/[^A-Za-z0-9_-]/g, '_');
  const svg = `${safeName}.svg`;
  const png = `${safeName}.png`;
  await QRCode.toFile(resolve(outputPath, svg), url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
  });
  await QRCode.toFile(resolve(outputPath, png), url, {
    type: 'png',
    errorCorrectionLevel: 'H',
    width: 1000,
    margin: 2,
  });
  rows.push([item.externalId, url, svg, png].map(csv).join(','));
}
await writeFile(resolve(outputPath, 'manifest.csv'), rows.join('\n') + '\n');
console.log(`✅ Generated ${manifest.length} QR pairs in ${outputPath}`);
function csv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
