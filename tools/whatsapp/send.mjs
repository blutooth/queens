#!/usr/bin/env node
/**
 * send.mjs — Local WhatsApp invitation sender for the African Global Queens Summit.
 *
 * Connects to the USER'S OWN WhatsApp (via WhatsApp Web), matches invitees from
 * a manifest to the user's saved contacts, drafts a personalised invitation, and
 * — only on explicit confirmation — sends each contact their personal link.
 *
 * SAFETY: default mode is a DRY RUN that sends NOTHING. Sending requires --send
 * plus a typed confirmation. Throttled, capped, and de-duplicated via sent.json.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ WARNING: Automating WhatsApp Web is against WhatsApp's Terms of Service   │
 * │ and may lead to temporary or permanent account suspension. Use small      │
 * │ batches, message only real known contacts, keep it personal. At your own  │
 * │ risk.                                                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   node send.mjs                 # dry run (default) — prints matches + messages, sends nothing
 *   node send.mjs --report        # summarise matched / unmatched / sent / pending
 *   node send.mjs --send          # actually send (asks for typed confirmation)
 *   node send.mjs --max 10        # cap this run at 10 sends (default 20)
 *   node send.mjs --manifest <path>
 *   node send.mjs --selftest      # offline matcher test on fake contacts (no WhatsApp)
 *   node send.mjs --to 447700900123          # REAL single-number test send (one message,
 *                                            # ignores manifest; asks for typed confirmation)
 *   node send.mjs --to <num> --link <url> --name <name>   # override link / greeting name
 *   node send.mjs --match                    # READ-ONLY: look up invitee phone numbers from
 *                                            # your contacts and write a CSV (sends nothing)
 *   node send.mjs --match --out <path.csv>   # choose the CSV output path
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import buildMessage, { salutationFor } from './message.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SITE_BASE = 'https://africanqueenssummit.com';
const DEFAULT_MANIFEST = path.resolve(__dirname, '../../content/data/invitees.json');
const SAMPLE_MANIFEST = path.resolve(__dirname, '../../content/data/invitees.sample.json');
const SENT_LOG = path.resolve(__dirname, 'sent.json');

// --match (read-only) reads invitee names from the markdown source of truth and
// writes the matched phone numbers here by default.
const INVITEES_DIR = path.resolve(__dirname, '../../content/invitees');
const DEFAULT_MATCH_OUT = path.resolve(__dirname, '../../content/data/contacts-matched.csv');

const DEFAULT_MAX = 20;
const DELAY_MIN_MS = 20_000; // 20s
const DELAY_MAX_MS = 45_000; // 45s

// Fallback link used by the single-number test send (--to) when no manifest
// entry and no --link override is available.
const SAMPLE_TEST_LINK = `${SITE_BASE}/invite/naano-dumaaley/`;

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    send: false, report: false, selftest: false, max: DEFAULT_MAX,
    manifest: null, mockContacts: null, to: null, link: null, name: null,
    match: false, out: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--send') args.send = true;
    else if (a === '--report') args.report = true;
    else if (a === '--selftest') args.selftest = true;
    else if (a === '--max') args.max = parseInt(argv[++i], 10);
    else if (a === '--manifest') args.manifest = argv[++i];
    // Offline testing only: load contacts from a JSON file instead of WhatsApp.
    // Never permitted with --send.
    else if (a === '--mock-contacts') args.mockContacts = argv[++i];
    // Single-number real test send. Ignores manifest/matching entirely.
    else if (a === '--to') args.to = argv[++i];
    else if (a === '--link') args.link = argv[++i];
    else if (a === '--name') args.name = argv[++i];
    // Read-only match & export of invitee names -> contact phone numbers (CSV).
    else if (a === '--match' || a === '--export') args.match = true;
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else console.warn(`(ignoring unknown argument: ${a})`);
  }
  if (!Number.isFinite(args.max) || args.max <= 0) args.max = DEFAULT_MAX;
  return args;
}

// ---------------------------------------------------------------------------
// Name normalisation + matching
// ---------------------------------------------------------------------------

// Honorifics / titles stripped before comparison (lowercase, no trailing dot).
const HONORIFICS = new Set([
  'mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'professor',
  'sir', 'madam', 'madame', 'lady', 'lord',
  'hon', 'honourable', 'honorable',
  'rev', 'reverend', 'pastor', 'bishop', 'imam', 'sheikh', 'sheik',
  'chief', 'nana', 'nii', 'naa', 'togbe', 'mama', 'papa',
  'queen', 'king', 'prince', 'princess', 'royal', 'highness',
  'majesty', 'excellency', 'amb', 'ambassador', 'eng', 'engr',
  'capt', 'captain', 'gen', 'general', 'col', 'maj', 'sgt',
  'hrh', 'hrm', 'hm', 'he',
]);

/** Lowercase, strip accents, remove punctuation, collapse whitespace. */
function normalize(str) {
  return String(str || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[._]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenise a name and drop honorifics/titles and 1-char tokens. */
function nameTokens(str) {
  return normalize(str)
    .split(' ')
    .filter((t) => t && !HONORIFICS.has(t) && t.length > 1);
}

/** Canonical comparable string (sorted unique tokens). */
function canonical(str) {
  return [...new Set(nameTokens(str))].sort().join(' ');
}

/**
 * Score how well an invitee name matches a contact label.
 * Returns one of: 'exact' | 'token' | null
 *   - 'exact': identical canonical token sets (after stripping titles)
 *   - 'token': strong overlap — every invitee token present in contact (or vice
 *     versa) with at least 2 shared tokens, OR a shared surname + given name.
 */
function matchScore(inviteeName, contactLabel) {
  const a = nameTokens(inviteeName);
  const b = nameTokens(contactLabel);
  if (a.length === 0 || b.length === 0) return null;

  const setA = new Set(a);
  const setB = new Set(b);
  if (canonical(inviteeName) === canonical(contactLabel)) return 'exact';

  const shared = [...setA].filter((t) => setB.has(t));
  if (shared.length === 0) return null;

  // Single-token invitee (e.g. "Abbie"): require that single token to be present
  // AND be the contact's only meaningful token, to avoid over-matching.
  if (setA.size === 1) {
    return setB.size === 1 && setB.has([...setA][0]) ? 'exact' : null;
  }
  if (setB.size === 1) {
    return setA.size === 1 && setA.has([...setB][0]) ? 'exact' : null;
  }

  // Multi-token: subset match (handles "Abigail Ama Oforiwaa" vs "Abigail Oforiwaa")
  const aSubsetOfB = [...setA].every((t) => setB.has(t));
  const bSubsetOfA = [...setB].every((t) => setA.has(t));
  if ((aSubsetOfB || bSubsetOfA) && shared.length >= 2) return 'token';

  // First-name + last-name overlap (order-independent): require >=2 shared tokens
  // including both the first and last token of the shorter name.
  const shorter = a.length <= b.length ? a : b;
  const longerSet = a.length <= b.length ? setB : setA;
  if (shared.length >= 2 && longerSet.has(shorter[0]) && longerSet.has(shorter[shorter.length - 1])) {
    return 'token';
  }

  return null;
}

/**
 * Find the confident match for an invitee among contacts.
 * @returns { status: 'matched'|'unmatched', contact?, reason? }
 */
export function matchInvitee(invitee, contacts) {
  const candidates = [];
  for (const c of contacts) {
    // Compare against name, pushname and verifiedName.
    const labels = [c.name, c.pushname, c.verifiedName].filter(Boolean);
    let best = null;
    for (const label of labels) {
      const s = matchScore(invitee.name, label);
      if (s === 'exact') { best = 'exact'; break; }
      if (s === 'token') best = best || 'token';
    }
    if (best) candidates.push({ contact: c, score: best });
  }

  if (candidates.length === 0) {
    return { status: 'unmatched', reason: 'no contact matched' };
  }

  // Prefer exact matches. If exactly one strongest candidate → matched.
  const exacts = candidates.filter((c) => c.score === 'exact');
  const pool = exacts.length > 0 ? exacts : candidates;

  // De-duplicate by contact id (same contact may match on multiple labels).
  const byId = new Map();
  for (const c of pool) byId.set(c.contact.id?._serialized || c.contact.id || c.contact.name, c);
  const unique = [...byId.values()];

  if (unique.length === 1) {
    return { status: 'matched', contact: unique[0].contact, score: unique[0].score };
  }
  return {
    status: 'unmatched',
    reason: `${unique.length} possible matches (ambiguous) — review manually`,
    candidates: unique.map((c) => c.contact.name || c.contact.pushname),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `${'•'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function fullLink(invitee) {
  const url = invitee.url || '';
  return SITE_BASE + (url.startsWith('/') ? url : `/${url}`);
}

function loadManifest(explicitPath) {
  let p = explicitPath ? path.resolve(explicitPath) : DEFAULT_MANIFEST;
  if (!fs.existsSync(p)) {
    if (!explicitPath && fs.existsSync(SAMPLE_MANIFEST)) {
      console.warn(`Manifest not found at ${p}\nFalling back to sample: ${SAMPLE_MANIFEST}\n`);
      p = SAMPLE_MANIFEST;
    } else {
      throw new Error(`Manifest not found: ${p}`);
    }
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`Manifest is not an array: ${p}`);
  return { path: p, invitees: data };
}

/**
 * Read invitee names from the markdown source of truth (content/invitees/*.md).
 * This is authoritative — invitees.json may be stale. Parses the simple
 * `--- ... ---` YAML-ish frontmatter for slug / name / audience. Skips .gitkeep
 * and any file lacking a name.
 * @returns Array<{ slug, name, audience, file }>
 */
export function loadInviteesFromMarkdown(dir = INVITEES_DIR) {
  if (!fs.existsSync(dir)) throw new Error(`Invitees directory not found: ${dir}`);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const out = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    const fm = {};
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (!kv) continue;
      let val = kv[2].trim();
      // strip surrounding quotes if present
      val = val.replace(/^["']|["']$/g, '');
      fm[kv[1].trim().toLowerCase()] = val;
    }
    const name = (fm.name || '').trim();
    if (!name) continue;
    out.push({
      slug: (fm.slug || path.basename(file, '.md')).trim(),
      name,
      audience: (fm.audience || '').trim(),
      file,
    });
  }
  return out;
}

/** Quote a CSV cell if it contains comma, quote, or newline. */
function csvCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const CSV_HEADER = 'slug,name,audience,status,phone,contact_name';

/**
 * Match a list of invitees (from markdown) against a contacts array.
 * Pure/offline — no network. Returns rows + counts for the CSV export.
 */
export function buildMatchRows(invitees, contacts) {
  const rows = [];
  const counts = { matched: 0, ambiguous: 0, unmatched: 0 };
  for (const inv of invitees) {
    const res = matchInvitee(inv, contacts);
    let status, phone = '', contactName = '';
    if (res.status === 'matched') {
      status = 'matched';
      phone = contactPhone(res.contact);
      contactName = res.contact.name || res.contact.pushname || res.contact.verifiedName || '';
    } else if (res.candidates) {
      status = 'ambiguous';
      contactName = res.candidates.join(' | ');
    } else {
      status = 'unmatched';
    }
    counts[status]++;
    rows.push({
      slug: inv.slug, name: inv.name, audience: inv.audience,
      status, phone, contact_name: contactName,
    });
  }
  return { rows, counts };
}

function rowsToCsv(rows) {
  const lines = [CSV_HEADER];
  for (const r of rows) {
    lines.push([r.slug, r.name, r.audience, r.status, r.phone, r.contact_name].map(csvCell).join(','));
  }
  return lines.join('\n') + '\n';
}

function loadSentLog() {
  if (!fs.existsSync(SENT_LOG)) return [];
  try {
    const d = JSON.parse(fs.readFileSync(SENT_LOG, 'utf8'));
    return Array.isArray(d) ? d : [];
  } catch {
    console.warn(`Could not parse ${SENT_LOG}; treating as empty.`);
    return [];
  }
}

function appendSentLog(entry) {
  const log = loadSentLog();
  log.push(entry);
  fs.writeFileSync(SENT_LOG, JSON.stringify(log, null, 2) + '\n');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randDelay() {
  return Math.floor(DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS));
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
}

// ---------------------------------------------------------------------------
// Self-test (offline, no WhatsApp connection)
// ---------------------------------------------------------------------------
function runSelfTest() {
  console.log('=== Matcher self-test (offline, fake contacts) ===\n');

  const contacts = [
    { id: { _serialized: '1@c.us' }, name: 'Naano Dumaaley', pushname: 'Naano', number: '233241111111' },
    { id: { _serialized: '2@c.us' }, name: 'Kwame Asante', pushname: 'KA', number: '233242222222' },
    { id: { _serialized: '3@c.us' }, name: 'Abbie', pushname: 'Abbie B', number: '233243333333' },
    { id: { _serialized: '4@c.us' }, name: 'Abigail Oforiwaa', pushname: '', number: '233244444444' },
    { id: { _serialized: '5@c.us' }, name: 'John Abbie Mensah', pushname: '', number: '233245555555' },
    { id: { _serialized: '6@c.us' }, name: 'Theresa Acheampong', pushname: '', number: '233246666666' },
    { id: { _serialized: '7@c.us' }, name: 'Mr Aliko Dangote', pushname: 'Aliko', verifiedName: 'Aliko Dangote', number: '234801111111' },
    // Two distinct contacts that both legitimately match "Mary Mensah" -> ambiguous.
    { id: { _serialized: '8@c.us' }, name: 'Mary Mensah', pushname: '', number: '233247777777' },
    { id: { _serialized: '9@c.us' }, name: 'Mary Mensah Boateng', pushname: 'Mary Mensah', number: '233248888888' },
  ];

  const cases = [
    { invitee: { name: 'Naano Dumaaley', audience: 'queens' }, expect: 'matched' },
    { invitee: { name: 'Hon. Kwame Asante', audience: 'politicians' }, expect: 'matched' }, // honorific stripped
    { invitee: { name: 'Abigail Ama Oforiwaa', audience: 'guests' }, expect: 'matched' }, // subset of tokens
    { invitee: { name: 'Acheampong Theresa', audience: 'princesses' }, expect: 'matched' }, // reversed order
    { invitee: { name: 'Aliko Dangote', audience: 'kings' }, expect: 'matched' }, // matches verifiedName, honorific in contact
    { invitee: { name: 'Abbie', audience: 'guests' }, expect: 'matched' }, // single-token, one exact contact only (NOT "John Abbie Mensah")
    { invitee: { name: 'Mary Mensah', audience: 'guests' }, expect: 'unmatched' }, // ambiguous: two contacts both match
    { invitee: { name: 'Nonexistent Person', audience: 'guests' }, expect: 'unmatched' },
  ];

  let pass = 0;
  for (const tc of cases) {
    const res = matchInvitee(tc.invitee, contacts);
    const ok = res.status === tc.expect;
    pass += ok ? 1 : 0;
    const detail = res.status === 'matched'
      ? `-> ${res.contact.name} [${res.score}]`
      : `-> ${res.reason}${res.candidates ? ` (${res.candidates.join(', ')})` : ''}`;
    console.log(`${ok ? 'PASS' : 'FAIL'}  "${tc.invitee.name}" (expected ${tc.expect}, got ${res.status}) ${detail}`);
  }
  console.log(`\n${pass}/${cases.length} cases passed.\n`);

  console.log('=== Message template render check ===\n');
  for (const audience of ['queens', 'kings', 'politicians', 'princesses', 'guests', '']) {
    const invitee = { slug: 'demo', name: 'Demo Name', audience, url: '/invite/demo/' };
    const link = fullLink(invitee);
    console.log(`--- audience: "${audience}" (salutation: "${salutationFor(audience)}") ---`);
    console.log(buildMessage(invitee, link));
    console.log('');
  }

  return pass === cases.length;
}

// ---------------------------------------------------------------------------
// Build the plan (matches), shared by dry-run / report / send
// ---------------------------------------------------------------------------
function buildPlan(invitees, contacts, sentSlugs) {
  const matched = [];
  const unmatched = [];
  const alreadySent = [];

  for (const inv of invitees) {
    if (sentSlugs.has(inv.slug)) { alreadySent.push(inv); continue; }
    const res = matchInvitee(inv, contacts);
    if (res.status === 'matched') {
      matched.push({ invitee: inv, contact: res.contact, score: res.score });
    } else {
      unmatched.push({ invitee: inv, reason: res.reason, candidates: res.candidates });
    }
  }
  return { matched, unmatched, alreadySent };
}

function contactPhone(contact) {
  // whatsapp-web.js contacts expose .number and id._serialized like "2332xx@c.us".
  return contact.number || (contact.id?.user) || '';
}

// ---------------------------------------------------------------------------
// WhatsApp client (lazy import so --selftest/--help never need the dependency)
// ---------------------------------------------------------------------------
async function makeClient() {
  const { Client, LocalAuth } = await import('whatsapp-web.js');
  const qrcode = (await import('qrcode-terminal')).default;

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.resolve(__dirname, '.wwebjs_auth') }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  client.on('qr', (qr) => {
    console.log('\nScan this QR code with WhatsApp on your phone (Linked Devices):\n');
    qrcode.generate(qr, { small: true });
  });
  client.on('authenticated', () => console.log('Authenticated. Session saved locally.'));
  client.on('auth_failure', (m) => console.error('Auth failure:', m));

  return client;
}

function ready(client) {
  return new Promise((resolve, reject) => {
    client.on('ready', resolve);
    client.on('auth_failure', reject);
    client.initialize().catch(reject);
  });
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------
async function getContacts(client) {
  const all = await client.getContacts();
  // Keep only real personal contacts (saved contacts, not groups/broadcast).
  return all.filter((c) => c.isMyContact && !c.isGroup && c.id?.server === 'c.us');
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(fs.readFileSync(path.resolve(__dirname, 'README.md'), 'utf8'));
    return;
  }

  if (args.selftest) {
    const ok = runSelfTest();
    process.exit(ok ? 0 : 1);
  }

  // Read-only match & export. Mutually exclusive with sends.
  if (args.match) {
    if (args.send || args.to) {
      console.error('Refusing: --match is read-only and cannot be combined with --send or --to.');
      process.exit(1);
    }
    await matchExport(args);
    return;
  }

  // Single-number REAL test send. Mutually exclusive with bulk send / mock.
  if (args.to) {
    if (args.send) {
      console.error('Refusing: --to (single test send) cannot be combined with --send (bulk manifest send).');
      process.exit(1);
    }
    if (args.mockContacts) {
      console.error('Refusing: --to cannot be combined with --mock-contacts (--to is a real send).');
      process.exit(1);
    }
    await testSend(args);
    return;
  }

  const { path: manifestPath, invitees } = loadManifest(args.manifest);
  const sentLog = loadSentLog();
  const sentSlugs = new Set(sentLog.map((e) => e.slug));

  console.log(`Manifest: ${manifestPath} (${invitees.length} invitees)`);
  console.log(`Sent log: ${SENT_LOG} (${sentLog.length} already sent)\n`);

  // Offline testing path: load contacts from a JSON file, no WhatsApp connection.
  if (args.mockContacts) {
    if (args.send) {
      console.error('Refusing: --mock-contacts cannot be combined with --send.');
      process.exit(1);
    }
    const contacts = JSON.parse(fs.readFileSync(path.resolve(args.mockContacts), 'utf8'));
    console.log(`[MOCK] Loaded ${contacts.length} fake contacts from ${args.mockContacts} (no WhatsApp connection).\n`);
    const plan = buildPlan(invitees, contacts, sentSlugs);
    if (args.report) printReport(plan, sentLog);
    else await dryRun(plan);
    return;
  }

  // --report needs contacts to compute matched/unmatched; so does dry-run & send.
  // Connect to WhatsApp for all real modes.
  const client = await makeClient();
  console.log('Connecting to WhatsApp Web...');
  await ready(client);
  console.log('WhatsApp ready.\n');

  let contacts;
  try {
    contacts = await getContacts(client);
    console.log(`Loaded ${contacts.length} personal contacts.\n`);

    const plan = buildPlan(invitees, contacts, sentSlugs);

    if (args.report) {
      printReport(plan, sentLog);
      return;
    }

    if (!args.send) {
      await dryRun(plan);
      return;
    }

    await doSend(client, plan, args.max);
  } finally {
    try { await client.destroy(); } catch { /* ignore */ }
  }
}

function printReport(plan, sentLog) {
  console.log('================ REPORT ================');
  console.log(`Matched (pending send): ${plan.matched.length}`);
  console.log(`Unmatched (need manual review): ${plan.unmatched.length}`);
  console.log(`Already sent: ${plan.alreadySent.length} (sent.json: ${sentLog.length})`);
  console.log('---------------------------------------');
  if (plan.unmatched.length) {
    console.log('\nUNMATCHED — fix these names (or save the contact) so they can be matched:');
    for (const u of plan.unmatched) {
      const extra = u.candidates ? `  [candidates: ${u.candidates.join(', ')}]` : '';
      console.log(`  - ${u.invitee.name} (${u.invitee.audience || 'no audience'}) — ${u.reason}${extra}`);
    }
  }
  console.log('========================================');
}

async function dryRun(plan) {
  console.log('================ DRY RUN (no messages will be sent) ================\n');
  for (const m of plan.matched) {
    const link = fullLink(m.invitee);
    const msg = buildMessage(m.invitee, link);
    console.log(`MATCHED  ${m.invitee.name}  ->  ${m.contact.name || m.contact.pushname}  (${maskPhone(contactPhone(m.contact))})  [${m.score}]`);
    console.log(indent(msg));
    console.log('');
  }
  for (const u of plan.unmatched) {
    const extra = u.candidates ? ` [candidates: ${u.candidates.join(', ')}]` : '';
    console.log(`UNMATCHED  ${u.invitee.name}  —  ${u.reason}${extra}  (will NOT be messaged)`);
  }
  console.log('\n-------------------------------------------------------------------');
  console.log(`Matched: ${plan.matched.length} | Unmatched: ${plan.unmatched.length} | Already sent: ${plan.alreadySent.length}`);
  console.log('This was a DRY RUN. Re-run with --send to actually send (you will be asked to confirm).');
}

function indent(s) {
  return s.split('\n').map((l) => `    | ${l}`).join('\n');
}

async function doSend(client, plan, max) {
  console.log('================ SEND MODE ================\n');
  if (plan.matched.length === 0) {
    console.log('Nothing to send (no matched, unsent invitees).');
    return;
  }
  const toSend = plan.matched.slice(0, max);
  console.log(`Matched & pending: ${plan.matched.length}`);
  console.log(`Unmatched (skipped): ${plan.unmatched.length}`);
  console.log(`This run will send to the first ${toSend.length} (cap --max ${max}):\n`);
  for (const m of toSend) {
    console.log(`  - ${m.invitee.name} -> ${m.contact.name || m.contact.pushname} (${maskPhone(contactPhone(m.contact))})`);
  }
  console.log(`\nThrottle: randomised ${DELAY_MIN_MS / 1000}-${DELAY_MAX_MS / 1000}s between sends.`);

  const answer = await ask(`\nType exactly "SEND ${toSend.length}" to confirm, anything else to abort: `);
  if (answer.trim() !== `SEND ${toSend.length}`) {
    console.log('Aborted. Nothing was sent.');
    return;
  }

  let sent = 0;
  for (const m of toSend) {
    const link = fullLink(m.invitee);
    const msg = buildMessage(m.invitee, link);
    const chatId = m.contact.id?._serialized;
    try {
      await client.sendMessage(chatId, msg);
      const entry = {
        slug: m.invitee.slug,
        name: m.invitee.name,
        phone: contactPhone(m.contact),
        audience: m.invitee.audience,
        sentAt: new Date().toISOString(),
      };
      appendSentLog(entry);
      sent++;
      console.log(`  [${sent}/${toSend.length}] Sent to ${m.invitee.name} (${maskPhone(entry.phone)})`);
    } catch (err) {
      console.error(`  FAILED for ${m.invitee.name}: ${err.message}`);
    }
    if (sent < toSend.length) {
      const d = randDelay();
      console.log(`    ...waiting ${Math.round(d / 1000)}s before next send`);
      await sleep(d);
    }
  }
  console.log(`\nDone. Sent ${sent} message(s). Recorded in ${SENT_LOG}.`);
}

/**
 * Single-number REAL test send (--to). Ignores the manifest and matching;
 * prepares ONE message to an exact number so the user can confirm end-to-end
 * delivery before any bulk run. Still requires typed confirmation. Does NOT
 * write to sent.json (this is a test, not a real invitee).
 */
async function testSend(args) {
  const digits = String(args.to).replace(/\D/g, '');
  if (digits.length < 7) {
    console.error(`Invalid --to number: "${args.to}". Use international format, digits only (e.g. 447700900123).`);
    process.exit(1);
  }

  // Resolve the link: --link override, else first manifest invitee, else sample.
  let link = args.link;
  if (!link) {
    try {
      const { invitees } = loadManifest(args.manifest);
      if (invitees.length > 0) link = fullLink(invitees[0]);
    } catch { /* manifest optional for a test send */ }
  }
  if (!link) link = SAMPLE_TEST_LINK;

  // Build the message with the real template (neutral/guest tone for a test).
  const invitee = { slug: '__test__', name: args.name || '', audience: 'guests', url: '' };
  const message = `[TEST] ${buildMessage(invitee, link)}`;

  console.log('================ SINGLE-NUMBER TEST SEND ================');
  console.log('This sends ONE real message and ignores the manifest entirely.\n');
  console.log(`To number : +${digits}`);
  console.log(`Greeting  : ${args.name ? `Dear ${args.name.split(/\s+/)[0]},` : 'Dear friend,'}`);
  console.log(`Link      : ${link}`);
  console.log('\nMessage:');
  console.log(indent(message));
  console.log('\nNote: this test is NOT recorded in sent.json.');

  const client = await makeClient();
  console.log('\nConnecting to WhatsApp Web...');
  await ready(client);
  console.log('WhatsApp ready.');

  try {
    // Resolve number -> chat id; errors out if not on WhatsApp.
    const numberId = await client.getNumberId(digits);
    if (!numberId) {
      console.error(`\nThe number +${digits} is not registered on WhatsApp. Nothing sent.`);
      process.exit(1);
    }
    const chatId = numberId._serialized;

    const answer = await ask(`\nType exactly "SEND" to send this test to +${digits}, anything else to abort: `);
    if (answer.trim() !== 'SEND') {
      console.log('Aborted. Nothing was sent.');
      return;
    }

    await client.sendMessage(chatId, message);
    console.log(`\nTest message sent to +${digits}. (Not recorded in sent.json.)`);
  } finally {
    try { await client.destroy(); } catch { /* ignore */ }
  }
}

/**
 * READ-ONLY match & export. Reads invitee names from content/invitees/*.md,
 * matches each to a WhatsApp contact (existing matcher), and writes a CSV of
 * slug,name,audience,status,phone,contact_name. Never sends a message.
 *
 * Offline testing: pass --mock-contacts <json> to skip the WhatsApp connection
 * and match against a fake contact array (prints would-be CSV rows).
 */
async function matchExport(args) {
  const invitees = loadInviteesFromMarkdown();
  const outPath = args.out ? path.resolve(args.out) : DEFAULT_MATCH_OUT;

  console.log('================ MATCH & EXPORT (read-only) ================');
  console.log(`Invitee source: ${INVITEES_DIR} (${invitees.length} markdown invitees)`);
  console.log('Note: WhatsApp provides phone numbers only — never email addresses.\n');

  let contacts;
  let client = null;
  if (args.mockContacts) {
    contacts = JSON.parse(fs.readFileSync(path.resolve(args.mockContacts), 'utf8'));
    console.log(`[MOCK] Loaded ${contacts.length} fake contacts from ${args.mockContacts} (no WhatsApp connection).\n`);
  } else {
    client = await makeClient();
    console.log('Connecting to WhatsApp Web...');
    await ready(client);
    console.log('WhatsApp ready.');
    contacts = await getContacts(client);
    console.log(`Loaded ${contacts.length} personal contacts.\n`);
  }

  try {
    const { rows, counts } = buildMatchRows(invitees, contacts);
    const csv = rowsToCsv(rows);

    if (args.mockContacts) {
      // Offline test: print the would-be CSV instead of (also) writing nothing.
      console.log('--- would-be CSV ---');
      process.stdout.write(csv);
      console.log('--------------------\n');
    } else {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, csv);
    }

    console.log('================ SUMMARY ================');
    console.log(`Total invitees : ${rows.length}`);
    console.log(`Matched        : ${counts.matched}`);
    console.log(`Ambiguous      : ${counts.ambiguous}`);
    console.log(`Unmatched      : ${counts.unmatched}`);
    if (!args.mockContacts) console.log(`\nCSV written to : ${outPath}`);
    console.log('Columns        : slug,name,audience,status,phone,contact_name');

    const ambiguous = rows.filter((r) => r.status === 'ambiguous');
    const unmatched = rows.filter((r) => r.status === 'unmatched');
    if (ambiguous.length) {
      console.log('\nAMBIGUOUS (multiple contacts matched — disambiguate the contact or the name):');
      for (const r of ambiguous) console.log(`  - ${r.name} (${r.audience || 'no audience'})  [${r.contact_name}]`);
    }
    if (unmatched.length) {
      console.log('\nUNMATCHED (save the contact or correct the name, then re-run):');
      for (const r of unmatched) console.log(`  - ${r.name} (${r.audience || 'no audience'})`);
    }
    console.log('\nThis was READ-ONLY: no messages were sent.');
  } finally {
    if (client) { try { await client.destroy(); } catch { /* ignore */ } }
  }
}

// ---------------------------------------------------------------------------
run().catch((err) => {
  console.error('\nError:', err?.message || err);
  process.exit(1);
});
