// Generates friendly short links (tinyurl.com/<name>-aqs) for every visa letter
// and saves the slug -> link map to content/data/visa-shortlinks.json (which the
// master page + letters use). Also writes a copy-paste list to the Desktop.
//
//   npm run visa:links           # create links for any member missing one
//   npm run visa:links -- --force  # (re)generate for everyone
//
// Uses TinyURL's no-key create API. The letter's data rides inside the target
// URL, so it passes through TinyURL — links are "anyone with the link can view".

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const visaDir = join(root, 'content', 'visa');
const dataDir = join(root, 'content', 'data');
const jsonPath = join(dataDir, 'visa-shortlinks.json');
const SITE_URL = 'https://africanqueenssummit.com';
const force = process.argv.includes('--force');

const b64url = (s) => Buffer.from(s, 'utf8').toString('base64url');

function parseFm(txt) {
  const m = txt.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const d = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) d[kv[1].trim().toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return d;
}

function cardUrl(v) {
  const data = {
    name: v.name || '', role: v.role || '', address: v.address || '', dob: v.dob || '',
    passport: v.passport || '', date: v.date || '', from: v.from || '', to: v.to || '',
    kind: v.kind === 'guest' ? 'guest' : 'staff',
  };
  return `${SITE_URL}/visa/card/?d=${b64url(JSON.stringify(data))}`;
}

async function tinyurl(url, alias) {
  const api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}&alias=${encodeURIComponent(alias)}`;
  try {
    const r = await fetch(api);
    const t = (await r.text()).trim();
    return t.startsWith('http') ? t : null; // TinyURL returns the URL, or "Error" if the alias is taken by a different target
  } catch (e) {
    return null;
  }
}

if (!existsSync(visaDir)) { console.error('No content/visa directory.'); process.exit(1); }
mkdirSync(dataDir, { recursive: true });

let map = {};
if (existsSync(jsonPath)) { try { map = JSON.parse(readFileSync(jsonPath, 'utf8')); } catch (e) { map = {}; } }

const files = readdirSync(visaDir).filter((f) => f.endsWith('.md') && f !== '_template.md').sort();
let created = 0, kept = 0, failed = 0;
const rows = [];

for (const f of files) {
  const slug = f.slice(0, -3);
  const v = parseFm(readFileSync(join(visaDir, f), 'utf8'));
  if (!v.name) continue;
  if (map[slug] && !force) { kept++; rows.push([v.name, map[slug]]); console.log(`  = ${v.name}  ->  ${map[slug]}`); continue; }
  const url = cardUrl(v);
  let short = null;
  for (const alias of [`${slug}-aqs`, `${slug}-aqs2`, `${slug}-aqs3`, `${slug}-a${Date.now().toString(36).slice(-3)}`]) {
    short = await tinyurl(url, alias);
    if (short) break;
  }
  if (short) { map[slug] = short; created++; rows.push([v.name, short]); console.log(`  + ${v.name}  ->  ${short}`); }
  else { failed++; console.warn(`  ✗ ${v.name}  — could not create a short link`); }
}

writeFileSync(jsonPath, JSON.stringify(map, null, 2) + '\n');

// Copy-paste list on the Desktop.
try {
  const dir = join(homedir(), 'Desktop', 'Visa-Letters');
  mkdirSync(dir, { recursive: true });
  const txt = 'AFRICAN QUEENS SUMMIT — VISA LETTER LINKS\n' + '='.repeat(42) + '\n\n' +
    rows.map(([n, l]) => `${n}\n${l}\n`).join('\n');
  writeFileSync(join(dir, 'Visa-Links.txt'), txt);
} catch (e) { /* Desktop optional */ }

console.log(`\n${created} created, ${kept} kept${failed ? ', ' + failed + ' failed' : ''} -> ${jsonPath}`);
console.log('Run `npm run visa` (or restart the dev server) so the pages pick up the links.');
