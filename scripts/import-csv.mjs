// Imports a (wide-format) Google-Sheet CSV of names into per-person invitee
// markdown files, with old/new CSV caching so re-imports only create NEW links.
//
//   content/data/contacts.current.csv   -> last-imported CSV (cache)
//   content/data/contacts.previous.csv  -> the CSV before this import (for diff)
//   content/invitees/<slug>.md          -> one file per NEW contact
//   content/data/invitees.json          -> manifest for the sender tool
//
// Zero dependencies — run with `node scripts/import-csv.mjs [path/to.csv]`.

import {
  readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const inviteesDir = join(root, 'content', 'invitees');
const dataDir = join(root, 'content', 'data');
const currentCsv = join(dataDir, 'contacts.current.csv');
const previousCsv = join(dataDir, 'contacts.previous.csv');
const manifestPath = join(dataDir, 'invitees.json');

const PROD_BASE = 'https://africanqueenssummit.com';
const DEFAULT_CSV = '/Users/marieerete/Downloads/queens summit 2026 - Sheet1.csv';
const csvPath = process.argv[2] || DEFAULT_CSV;

// Header category (lowercased) -> audience used by build-invites.mjs
const CATEGORY_AUDIENCE = {
  'special guest': 'guests',
  king: 'kings',
  queen: 'queens',
  politician: 'politicians',
  custom: 'guests', // routed to guests, but flagged for bespoke letters later
  princess: 'princesses',
};
const CUSTOM_CATEGORIES = new Set(['custom']);

// ---------- tiny CSV parser (quotes, embedded commas, CRLF) ----------

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\r') {
      // ignore — newline handled by \n
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

// ---------- slug rule (mirrors build-invites.mjs master page) ----------

function slugify(s) {
  const honor = /^(hrm|hrh|hm|her|his|royal|majesty|highness|queen|king|chief|obong|obonganwan|princess|prince|dr|sir|lady|the)\b/i;
  let t = String(s).trim();
  for (let i = 0; i < 4; i++) { const n = t.replace(honor, '').trim(); if (n === t) break; t = n; }
  if (!t) t = String(s);
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function makeUnique(base, used) {
  let b = base || 'invitee';
  if (!used.has(b)) { used.add(b); return b; }
  let n = 2;
  while (used.has(`${b}-${n}`)) n++;
  const u = `${b}-${n}`;
  used.add(u);
  return u;
}

// ---------- flatten a wide CSV into {name, audience, email, category} ----------

function flatten(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((h) => clean(h).toLowerCase());
  const cats = [];
  for (let i = 0; i < header.length; i++) {
    if (CATEGORY_AUDIENCE[header[i]]) {
      cats.push({ col: i, addrCol: i + 1, category: header[i], audience: CATEGORY_AUDIENCE[header[i]] });
    }
  }
  const seen = new Map(); // key -> contact (dedupe by name+audience)
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    for (const cat of cats) {
      const name = clean(row[cat.col]);
      if (!name) continue;
      const addr = clean(row[cat.addrCol]);
      const email = addr.includes('@') ? addr : '';
      const key = `${cat.audience}|${name.toLowerCase()}`;
      if (seen.has(key)) {
        // fill in an email if the first occurrence lacked one
        const prev = seen.get(key);
        if (!prev.email && email) prev.email = email;
        continue;
      }
      seen.set(key, { name, audience: cat.audience, email, category: cat.category });
    }
  }
  return [...seen.values()];
}

const contactKey = (c) => `${c.audience}|${c.name.toLowerCase()}`;

// ---------- read existing invitee frontmatter ----------

function readFrontmatter(file) {
  const txt = readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  const data = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (kv) data[kv[1]] = kv[2].trim();
    }
  }
  return data;
}

// ====================================================================
// IMPORT
// ====================================================================

if (!existsSync(csvPath)) {
  console.error(`✗ CSV not found: ${csvPath}`);
  process.exit(1);
}
mkdirSync(dataDir, { recursive: true });
mkdirSync(inviteesDir, { recursive: true });

const newText = readFileSync(csvPath, 'utf8');
const newContacts = flatten(parseCSV(newText));

// --- diff against the cached "current" CSV ---
let oldContacts = [];
if (existsSync(currentCsv)) {
  oldContacts = flatten(parseCSV(readFileSync(currentCsv, 'utf8')));
  copyFileSync(currentCsv, previousCsv); // keep BOTH old and new for comparison
}
writeFileSync(currentCsv, newText); // cache the new CSV as current

const oldKeys = new Set(oldContacts.map(contactKey));
const newKeys = new Set(newContacts.map(contactKey));
const added = newContacts.filter((c) => !oldKeys.has(contactKey(c)));
const removed = oldContacts.filter((c) => !newKeys.has(contactKey(c)));
const unchanged = newContacts.filter((c) => oldKeys.has(contactKey(c)));

// --- seed used slugs from existing invitee files (never clobber) ---
const used = new Set();
const existingFiles = readdirSync(inviteesDir).filter((f) => f.endsWith('.md'));
for (const f of existingFiles) {
  used.add(f.replace(/\.md$/, ''));
  const fm = readFrontmatter(join(inviteesDir, f));
  if (fm.slug) used.add(fm.slug);
}

// --- write md files for ADDED contacts only ---
const createdSlugs = [];
const skipped = [];
for (const c of added) {
  const slug = makeUnique(slugify(c.name), used);
  const file = join(inviteesDir, `${slug}.md`);
  if (existsSync(file)) { skipped.push({ name: c.name, slug, reason: 'file exists' }); continue; }
  const lines = [
    '---',
    `slug: ${slug}`,
    `name: ${c.name}`,
    `audience: ${c.audience}`,
    `email: ${c.email}`,
    'date: 25th June 2026',
    'template: heritage',
  ];
  if (CUSTOM_CATEGORIES.has(c.category)) lines.push('custom: true');
  lines.push('---', '');
  writeFileSync(file, lines.join('\n') + '\n');
  createdSlugs.push({ name: c.name, slug, audience: c.audience });
}

// ====================================================================
// MANIFEST — every invitee on disk (hand-authored + generated)
// ====================================================================

const manifest = [];
for (const f of readdirSync(inviteesDir).filter((x) => x.endsWith('.md'))) {
  const fm = readFrontmatter(join(inviteesDir, f));
  const slug = fm.slug || f.replace(/\.md$/, '');
  manifest.push({
    slug,
    name: fm.name || slug,
    audience: fm.audience || '',
    email: fm.email || '',
    url: `/invite/${slug}/`,
  });
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// ====================================================================
// SUMMARY
// ====================================================================

const byAud = {};
for (const c of newContacts) byAud[c.audience] = (byAud[c.audience] || 0) + 1;

console.log(`\nImported ${csvPath}`);
console.log(`Contacts parsed: ${newContacts.length} (after dedupe by name+audience)`);
console.log('Per audience:');
for (const a of Object.keys(byAud).sort()) console.log(`  ${a.padEnd(12)} ${byAud[a]}`);

console.log(`\nDiff vs previous import:`);
console.log(`  added:     ${added.length}`);
console.log(`  removed:   ${removed.length}`);
console.log(`  unchanged: ${unchanged.length}`);

if (createdSlugs.length) {
  console.log(`\nNew invitee files created (${createdSlugs.length}):`);
  for (const c of createdSlugs) console.log(`  + ${c.name}  ->  /invite/${c.slug}/  [${c.audience}]`);
}
if (skipped.length) {
  console.log(`\nSkipped (would clobber an existing file):`);
  for (const s of skipped) console.log(`  ~ ${s.name}  (${s.slug}) — ${s.reason}`);
}
if (removed.length) {
  console.log(`\nRemoved since last import (files left untouched):`);
  for (const c of removed) console.log(`  - ${c.name}  [${c.audience}]`);
}

console.log(`\nManifest: ${manifestPath} (${manifest.length} invitees)`);
console.log(`Cached:   ${currentCsv}${existsSync(previousCsv) ? `\n          ${previousCsv}` : ''}`);
console.log(`\nNext: run \`node scripts/build-invites.mjs\` to generate the pages.\n`);
