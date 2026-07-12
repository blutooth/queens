// Builds formal UK Standard Visitor visa invitation/sponsorship letters from
// per-visitor markdown files, ready to print or "Save as PDF" and submit.
//
//   content/visa/<slug>.md          -> one file per visitor (frontmatter below)
//   public/visa/<slug>/index.html   -> the A4 print-ready letter
//   public/visa/index.html          -> a simple index of all letters
//
// Frontmatter fields (only `name` is required — every other visitor detail is
// optional and only appears in the Re: line when you fill it in):
//   name:     Mr Samuel Iso
//   role:     Traditional, cultural administrator and orator of 5 Nnettah Community
//   address:  Esuk Otu, Calabar, Cross River State, Nigeria
//   dob:      5th July 1999
//   passport: (optional) passport number, e.g. B05181252
//   date:     (optional) letter date, e.g. 12 July 2026 — blank if omitted
//   from:     (optional) visit start — defaults below
//   to:       (optional) visit end   — defaults below
//
// Zero dependencies — run with `node scripts/build-visa.mjs`.

import {
  readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const visaDir = join(root, 'content', 'visa');
const outDir = join(root, 'public', 'visa');

// ---------- shared / configurable details ----------
const SIGNATORY = {
  name: 'Obonganwan Marie Erete',
  line1: 'Queen Aruk II',
  line2: 'Traditional Ruler of Eniong Abatim',
};
const QUEENDOM = 'Eniong Abatim in Efik Land, Nigeria';
const SUMMIT = 'African Global Queens Summit';
// Letterhead: the summit branding + the sender's address block.
const SENDER = {
  name: 'Obonganwan Marie Erete',
  line1: 'Queen Aruk II',
  address: ['Hawkhill Place, Stanton St John', 'Oxford OX33 1HS, United Kingdom'],
  contact: 'africanqueenssummit@gmail.com · +44 7932 506 556',
};
const ACCOMMODATION = 'Hawkhill Place, Stanton St John, Oxford OX33 1HS';
const DEFAULT_FROM = '25 July 2026';
const DEFAULT_TO = '20 September 2026';

// Images inlined so the letter is fully self-contained (opens/prints anywhere,
// no external requests).
function dataUri(file) {
  const p = join(root, 'public', 'images', file);
  if (!existsSync(p)) return '';
  return 'data:image/png;base64,' + readFileSync(p).toString('base64');
}
const signatureDataUri = () => dataUri('queen-aruk-signature.png');
const emblemDataUri = () => dataUri('summit-emblem.png');

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function parseFrontmatter(txt) {
  const m = txt.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (kv) data[kv[1].trim().toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return data;
}

function letterHtml(v, sig, emblem) {
  const from = v.from || DEFAULT_FROM;
  const to = v.to || DEFAULT_TO;
  const dateLine = v.date ? esc(v.date) : '';
  // The Re: line is the per-visitor part. Each detail is labelled; a filled
  // field shows its value, a blank field leaves an underlined space to write in
  // — so the same file works as a ready-to-fill blank template or a completed letter.
  const blank = (w) => `<span class="fill" style="min-width:${w}"></span>`;
  let nameBit = esc(v.name || '');
  if (v.role) nameBit = nameBit ? `${nameBit} — ${esc(v.role)}` : esc(v.role);
  const reLine =
    `${nameBit || blank('240px')}` +
    `; Address: ${v.address ? esc(v.address) : blank('220px')}` +
    `; Date of Birth: ${v.dob ? esc(v.dob) : blank('140px')}` +
    `; Passport Number: ${v.passport ? esc(v.passport) : blank('150px')}.`;
  const senderAddr = SENDER.address.map((l) => esc(l)).join('<br />');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Visa Invitation Letter — ${esc(v.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Marcellus&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>
  :root {
    --emerald: #0d6b4f; --emerald-deep: #094b38; --terracotta: #c0532b;
    --ochre: #d98e2b; --gold: #d4af37; --gold-deep: #b8860b;
    --brown: #3c2415; --ink: #24170d; --muted: #555;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; background: #e9e9ea; }
  body { font-family: 'Spectral', Georgia, 'Times New Roman', serif; color: var(--ink); line-height: 1.55; font-size: 11.5pt; }
  .sheet {
    background: #fff; width: 210mm; min-height: 297mm; margin: 18px auto;
    box-shadow: 0 6px 30px rgba(0,0,0,0.18); overflow: hidden;
  }
  .body-pad { padding: 16mm 20mm 20mm; }

  /* ---- branded summit letterhead (matches the invitation design) ---- */
  .kente-band {
    height: 16px; width: 100%;
    background-image:
      repeating-linear-gradient(90deg, var(--emerald) 0 26px, var(--gold) 26px 34px, var(--terracotta) 34px 60px, var(--brown) 60px 68px, var(--ochre) 68px 94px, var(--gold) 94px 102px),
      repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 6px, rgba(255,255,255,0.06) 6px 12px);
    background-blend-mode: multiply;
  }
  .hero {
    position: relative; text-align: center; color: #fdf6e3; padding: 24px 26px 22px;
    background-color: var(--emerald-deep);
    background-image:
      conic-gradient(from 0deg at 50% 0%, rgba(212,175,55,0.18), rgba(13,107,79,0) 40%, rgba(192,83,43,0.16) 70%, rgba(13,107,79,0)),
      radial-gradient(circle at 50% -10%, rgba(217,142,43,0.35), transparent 55%);
  }
  .medallion { position: relative; width: 120px; height: 120px; margin: 0 auto 12px; }
  .medallion .rays {
    position: absolute; inset: 0; border-radius: 50%;
    background: repeating-conic-gradient(from 0deg, rgba(212,175,55,0) 0deg, rgba(212,175,55,0) 4deg, rgba(212,175,55,0.6) 5deg, rgba(212,175,55,0) 6deg, rgba(212,175,55,0) 10deg);
    -webkit-mask: radial-gradient(circle, transparent 44%, #000 45%, #000 74%, transparent 75%);
    mask: radial-gradient(circle, transparent 44%, #000 45%, #000 74%, transparent 75%);
  }
  .emblem {
    position: relative; z-index: 2; width: 94px; height: 94px; object-fit: contain;
    margin: 13px; border-radius: 50%; background: rgba(251,245,233,0.95); padding: 3px;
    border: 3px solid var(--gold); box-shadow: 0 0 0 5px rgba(13,107,79,0.6), 0 8px 20px rgba(0,0,0,0.4);
  }
  .eyebrow { font-family: 'Marcellus', serif; letter-spacing: 0.32em; text-transform: uppercase; font-size: 10px; color: var(--gold); margin: 0 0 8px; }
  .title { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 34px; line-height: 1.04; margin: 0 0 8px; color: #fdf6e3; text-shadow: 0 2px 10px rgba(0,0,0,0.45); }
  .subtitle { font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.08em; color: #f1dca0; margin: 0; }

  .sender { text-align: right; font-size: 10.5pt; color: #33291c; margin: 14px 0 20px; line-height: 1.45; }
  .sender .nm { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 13pt; color: var(--emerald-deep); }
  .sender .role { font-style: italic; }
  .sender .ct { color: var(--muted); font-size: 9.5pt; margin-top: 3px; }

  .meta { margin-bottom: 16px; }
  .meta .to { margin-top: 6px; white-space: pre-line; }
  .subject { font-weight: 600; margin: 14px 0 6px; }
  .re { font-weight: 600; margin: 0 0 16px; }
  .re .fill { display: inline-block; border-bottom: 1px solid #333; height: 0.95em; vertical-align: text-bottom; }
  p { margin: 0 0 11px; text-align: justify; }
  ul { margin: 4px 0 12px; padding-left: 22px; }
  li { margin: 2px 0; }
  h3 { font-family: 'Marcellus', serif; font-size: 11.5pt; color: var(--emerald-deep); margin: 16px 0 6px; }
  .sign { margin-top: 22px; }
  .sign img { display: block; height: 62px; width: auto; margin: 4px 0; }
  .sign .nm { font-weight: 600; }
  .toolbar { text-align: center; margin: 14px; }
  .toolbar button { font-family: system-ui, sans-serif; font-size: 13px; padding: 8px 18px; border: 1px solid #999; border-radius: 6px; background: #fff; cursor: pointer; }
  .toolbar button:hover { background: #f2f2f2; }
  @media print {
    html, body { background: #fff; }
    .toolbar { display: none; }
    .sheet { width: auto; min-height: auto; margin: 0; box-shadow: none; }
    .body-pad { padding: 10mm 16mm 14mm; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
<div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button></div>
<div class="sheet">
  <div class="kente-band"></div>
  <header class="hero">
    <div class="medallion"><span class="rays" aria-hidden="true"></span>${emblem ? `<img class="emblem" src="${emblem}" alt="Summit emblem" />` : ''}</div>
    <p class="eyebrow">Office of the Convener</p>
    <h1 class="title">${esc(SUMMIT)}</h1>
    <p class="subtitle">United Kingdom &middot; 14&ndash;31 August 2026</p>
  </header>
  <div class="kente-band"></div>

  <div class="body-pad">
  <div class="sender">
    <div class="nm">${esc(SENDER.name)}</div>
    <div class="role">${esc(SENDER.line1)}</div>
    <div>${senderAddr}</div>
    <div class="ct">${esc(SENDER.contact)}</div>
  </div>

  <div class="meta">
    <div>Date: ${dateLine}</div>
    <div class="to">To:
The Entry Clearance Officer
UK Visas and Immigration</div>
  </div>

  <p class="subject">Subject: Official Invitation in Support of Standard Visitor Visa Applications</p>
  <p class="re">Re: ${reLine}</p>

  <p>Dear Sir/Madam,</p>

  <p>I write in my capacity as Obonganwan Marie Erete, ${esc(SIGNATORY.line1)}, the Traditional Ruler of ${esc(QUEENDOM)}, to formally invite my customary, traditional, and cultural palace staff to visit the United Kingdom as members of my official delegation.</p>

  <p>The purpose of their visit is to accompany me and participate in the <strong>${esc(SUMMIT)}</strong>, an international cultural and leadership forum convened under my leadership. The Summit brings together traditional rulers, women leaders, policymakers, academics, and members of the African diaspora to promote African cultural heritage, women's leadership, intercultural dialogue, and sustainable community development.</p>

  <p>The individuals named in their respective visa applications are longstanding members of my palace establishment and perform recognised customary, ceremonial, cultural, and administrative duties in support of my traditional institution. Their participation forms an important part of the official cultural representation of my Queendom and will enable them to assist in the ceremonial, protocol, and cultural aspects of the Summit.</p>

  <p>The proposed visit will take place from <strong>${esc(from)}</strong> (for preparation in advance of the summit) to on or before <strong>${esc(to)}</strong> (to take into account clearance and consolidation prior to departure), following which they will return to Nigeria to resume their official responsibilities in and outside the palace and their personal, family, and community obligations. Their visit is strictly temporary and is solely for cultural, ceremonial, and Summit-related activities permitted under the UK Standard Visitor route. They have no intention of seeking employment, remaining beyond the authorised period of stay, or accessing public funds in the United Kingdom.</p>

  <p>During their stay, they will be accommodated at my residence:</p>
  <p style="margin-left:22px"><strong>${esc(ACCOMMODATION)}</strong></p>

  <p>I confirm that I shall be financially responsible for the visitors throughout their stay in the United Kingdom. This includes:</p>
  <ul>
    <li>Accommodation</li>
    <li>Meals</li>
    <li>Local transportation</li>
    <li>General living expenses</li>
    <li>Emergency support, where necessary</li>
  </ul>
  <p>I will provide pastoral support throughout their visit.</p>

  <h3>Assurance of Compliance</h3>
  <p>I respectfully confirm that the invited visitors have substantial and compelling ties to Nigeria, including:</p>
  <ul>
    <li>Permanent residence in Nigeria.</li>
    <li>Family responsibilities.</li>
    <li>Official appointments within my palace establishment.</li>
    <li>Ongoing traditional and cultural duties.</li>
    <li>Community obligations requiring their return (e.g. paid employment, business or pastoral duties).</li>
  </ul>
  <p>These commitments provide strong assurance that they will depart the United Kingdom at the conclusion of their authorised visit.</p>
  <p>Neither I nor the visitors have any intention of breaching UK immigration laws or visa conditions. They fully understand that the Standard Visitor Visa does not permit employment, access to public funds, or long-term residence in the United Kingdom.</p>

  <h3>Supporting Documentation</h3>
  <p>To support this invitation, I will provide copies of the following documents:</p>
  <ul>
    <li>My passport.</li>
    <li>Recent bank statements.</li>
  </ul>
  <p>Each visitor will also submit:</p>
  <ul>
    <li>A valid passport.</li>
    <li>Bank statements (where applicable).</li>
    <li>Any other supporting documents required by UKVI.</li>
  </ul>

  <p>I respectfully confirm that each member of my delegation maintains strong and enduring ties to Nigeria through their official appointments within my traditional institution, family commitments, and continuing cultural responsibilities, all of which require their return upon completion of the visit.</p>

  <p>I respectfully request that UK Visas and Immigration give favourable consideration to their applications. I am available to provide any further information or supporting documentation that may assist in the assessment of these applications.</p>

  <p>Thank you for your time and consideration.</p>

  <div class="sign">
    <p style="margin-bottom:2px">Yours faithfully,</p>
    ${sig ? `<img src="${sig}" alt="Signature" />` : '<div style="height:56px"></div>'}
    <div class="nm">${esc(SIGNATORY.name)}</div>
    <div>${esc(SIGNATORY.line1)}</div>
    <div>${esc(SIGNATORY.line2)}</div>
  </div>
  </div>
</div>
</body>
</html>`;
}

// ---------- build ----------
mkdirSync(visaDir, { recursive: true });
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const sig = signatureDataUri();
const emblem = emblemDataUri();
const files = readdirSync(visaDir).filter((f) => f.endsWith('.md')).sort();
const built = [];

for (const f of files) {
  const v = parseFrontmatter(readFileSync(join(visaDir, f), 'utf8'));
  const slug = f.replace(/\.md$/, '');
  const label = v.name || '(blank template — details to be inserted)';
  mkdirSync(join(outDir, slug), { recursive: true });
  writeFileSync(join(outDir, slug, 'index.html'), letterHtml(v, sig, emblem));
  built.push({ slug, name: label });
  console.log(`  ✓ /visa/${slug}/  —  ${label}`);
}

// index of all letters
const rows = built
  .map((b) => `<li><a href="/visa/${b.slug}/">${esc(b.name)}</a></li>`)
  .join('\n      ');
writeFileSync(join(outDir, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<title>Visa Invitation Letters</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;color:#1a1a1a}
h1{font-size:1.3rem}li{margin:6px 0}a{color:#2d4a37}</style></head>
<body><h1>UK Visa Invitation Letters</h1><ul>
      ${rows || '<li>(no letters yet — add content/visa/&lt;name&gt;.md)</li>'}
    </ul></body></html>`);

console.log(`\nBuilt ${built.length} visa letter(s) → public/visa/`);
