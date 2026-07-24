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
  contact: 'www.africanqueenssummit.com · africanqueenssummit@gmail.com · +44 7932 506 556',
};
const ACCOMMODATION = 'Hawkhill Place, Stanton St John, Oxford OX33 1HS';
const DEFAULT_FROM = '25 July 2026';
const DEFAULT_TO = '20 September 2026';
// Queens & Kings attend the summit itself, 14–31 August 2026.
const GUEST_FROM = '14 August 2026';
const GUEST_TO = '31 August 2026';
// Base for shareable web links (the deployed /visa/card/ viewer).
const SITE_URL = 'https://africanqueenssummit.com';

// TEMPORARY BLOCK — controls which shared /visa/card/ letters refuse to
// render (no view / print / copy / download). Redeploy after changing.
//   ''      = nothing blocked (fully unblocked)
//   'guest' = Queens & Kings blocked, Palace Staff available
//   'staff' = Palace Staff blocked, Queens & Kings available
//   'all'   = everyone blocked
// Only affects shared web links, not local pages.
const VISA_BLOCK_SCOPE = '';
const VISA_BLOCK_COND = VISA_BLOCK_SCOPE === 'all' ? 'true'
  : VISA_BLOCK_SCOPE === 'guest' ? 'guest'
  : VISA_BLOCK_SCOPE === 'staff' ? '!guest' : '';
// Individual names exempt from the block — their shared card link renders even
// if their kind is otherwise blocked. Names must match the letter's name field.
const VISA_UNBLOCK = [
  'Bisola Najite Olaosegbe',
  'Bisola NagiteOlaosegbe', // older forwarded links carry the pre-correction spelling
  'Samuel Adesina Adenle',
  'Dr. Yeye Folashade Shona Aluko',
  'Chisola Getrude Sakapazhi',
  'Chisola Gertrude Sakapazhi', // pre-correction spelling, in case an older link was sent
  // Royal Delegation of Mansa Bamba (Mali) — temporarily unblocked
  'H.R.H. Princess Loda Coulibaly',
  'H.R.H. Prince Moussa Badian',
  'H.E. Mrs Haïdara Aïchata Alassane Cissé',
  'H.E. Mrs Aichata Alassane Cissé Haïdara',
  'H.E. Hamadoun Kassogué',
  'H.E. Yao Raymond Lezin Djè',
  'Dr Paul Kodio',
  'Dr Paul Kodjo',
  'Mr Djibrila Diallo',
  'Mr Youba Cissé',
  'Mrs Aïssata Coulibaly',
  'Mr Mahamane Touré',
  'Mrs Binta Nango',
  'Abdoulaye Touré',
  'Abdoulaye Traoré',
  'Mahamed Bamba',
  'Mahamed Baba',
  'Selina Tweneboah',
  'Prince Awulosu',
  'Arnold Tetteh Mensah',
  'Michael Austin Quarshie',
  'Isaac Agyapong',
  'Christian Nana Arkorful Godsent',
];

// Images inlined so the letter is fully self-contained (opens/prints anywhere,
// no external requests).
function dataUri(file) {
  const p = join(root, 'public', 'images', file);
  if (!existsSync(p)) return '';
  return 'data:image/png;base64,' + readFileSync(p).toString('base64');
}
const signatureDataUri = () => dataUri('queen-aruk-signature.png');
const emblemDataUri = () => dataUri('summit-emblem.png');

// Encode a visitor's data for the web card link (matches the browser decoder).
const b64url = (s) => Buffer.from(s, 'utf8').toString('base64url');
const cardLinkFor = (v) => `${SITE_URL}/visa/card/?d=${b64url(JSON.stringify({
  name: v.name || '', role: v.role || '', address: v.address || '', dob: v.dob || '',
  passport: v.passport || '', date: v.date || '', from: v.from || '', to: v.to || '',
  kind: v.kind === 'guest' ? 'guest' : 'staff',
}))}`;

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

function letterHtml(v, sig, emblem, opts = {}) {
  const card = !!opts.card; // web card viewer — fields come from the URL at runtime
  const isGuestV = v.kind === 'guest';
  const from = v.from || (isGuestV ? GUEST_FROM : DEFAULT_FROM);
  const to = v.to || (isGuestV ? GUEST_TO : DEFAULT_TO);
  const dateLine = card ? '<span class="c-date"></span>' : (v.date ? esc(v.date) : '');
  const fromHtml = card ? '<strong class="c-from"></strong>' : `<strong>${esc(from)}</strong>`;
  const toHtml = card ? '<strong class="c-to"></strong>' : `<strong>${esc(to)}</strong>`;
  const emblemSrc = card ? '/images/summit-emblem.png' : (emblem || '');
  const sigSrc = card ? '/images/queen-aruk-signature.png' : (sig || '');
  // The Re: line is the per-visitor part. Each detail is labelled; a filled
  // field shows its value, a blank field leaves an underlined space to write in
  // — so the same file works as a ready-to-fill blank template or a completed letter.
  const kind = v.kind === 'guest' ? 'guest' : 'staff';
  // Re section fills from the details entered; any field left empty stays blank to fill by hand.
  let nameBit = esc(v.name || '');
  if (kind === 'staff' && v.role) nameBit = nameBit ? `${nameBit} — ${esc(v.role)}` : esc(v.role);
  const item = (label, valu) => `<li><span class="lbl">${label}:</span> ${valu ? esc(valu) : ''}</li>`;
  const reBlock = card ? '<div class="c-re"></div>' : `<p class="re">Re: ${nameBit}</p>
  <ul class="re-list">
    ${item('Address', v.address)}
    ${item('Date of Birth', v.dob)}
    ${item('Passport Number', v.passport)}
  </ul>`;
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
    animation: raysSpin 50s linear infinite;
  }
  @keyframes raysSpin { to { transform: rotate(360deg); } }
  @media print { .medallion .rays { animation: none; } }
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
  .re { font-weight: 600; margin: 0 0 4px; }
  .re-list { list-style: disc; margin: 0 0 16px; padding-left: 26px; }
  .re-list li { margin: 3px 0; }
  .re-list .lbl { font-weight: 600; }
  /* Queens & Kings (guest) vs palace staff wording */
  .only-guest { display: none; }
  .kind-guest .only-staff { display: none; }
  .kind-guest .only-guest { display: block; }
  p { margin: 0 0 11px; text-align: justify; }
  ul { margin: 4px 0 12px; padding-left: 22px; }
  li { margin: 2px 0; }
  h3 { font-family: 'Marcellus', serif; font-size: 11.5pt; color: var(--emerald-deep); margin: 16px 0 6px; }
  .sign { margin-top: 22px; }
  .sign img { display: block; height: 84px; width: auto; margin: 6px 0 2px; }
  .sign .nm { font-weight: 600; }
  .toolbar { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 14px; }
  .toolbar button, .toolbar a { font-family: system-ui, sans-serif; font-size: 13px; padding: 8px 16px; border: 1px solid #999; border-radius: 6px; background: #fff; cursor: pointer; color: #1a1a1a; text-decoration: none; }
  .toolbar button:hover, .toolbar a:hover { background: #f2f2f2; }
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
<div class="toolbar">
  <button onclick="window.print()">🖨 Save as PDF</button>
  <button onclick="copyLetter()">📋 Copy text</button>
  <button onclick="copyLink()">🔗 Copy link</button>
  <a id="emailBtn" href="#">✉️ Email</a>
  <a id="waBtn" target="_blank" rel="noopener" href="#">💬 WhatsApp</a>
</div>
<div class="sheet">
  <div class="kente-band"></div>
  <header class="hero">
    <div class="medallion"><span class="rays" aria-hidden="true"></span>${emblemSrc ? `<img class="emblem" src="${emblemSrc}" alt="Summit emblem" />` : ''}</div>
    <p class="eyebrow">Office of the Convener</p>
    <h1 class="title">${esc(SUMMIT)}</h1>
    <p class="subtitle">United Kingdom &middot; 14&ndash;31 August 2026</p>
  </header>
  <div class="kente-band"></div>

  <div class="body-pad ${card ? '' : (kind === 'guest' ? 'kind-guest' : '')}">
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
  ${reBlock}

  <p>Dear Sir/Madam,</p>

  <p class="only-staff">I write in my capacity as Obonganwan Marie Erete, ${esc(SIGNATORY.line1)}, the Traditional Ruler of ${esc(QUEENDOM)}, to formally invite my customary, traditional, and cultural palace staff to visit the United Kingdom as members of my official delegation.</p>
  <p class="only-guest">I write in my capacity as Obonganwan Marie Erete, ${esc(SIGNATORY.line1)}, the Traditional Ruler of ${esc(QUEENDOM)}, to formally invite and support the visa application of the individual named above to attend the ${esc(SUMMIT)} in the United Kingdom as my invited guest.</p>

  <p class="only-staff">The purpose of their visit is to accompany me and participate in the <strong>${esc(SUMMIT)}</strong>, an international cultural and leadership forum convened under my leadership. The Summit brings together traditional rulers, women leaders, policymakers, academics, and members of the African diaspora to promote African cultural heritage, women's leadership, intercultural dialogue, and sustainable community development.</p>
  <p class="only-guest">The purpose of the visit is to attend and participate in the <strong>${esc(SUMMIT)}</strong>, an international cultural and leadership forum convened under my leadership. The Summit brings together traditional rulers, women leaders, policymakers, academics, and members of the African diaspora to promote African cultural heritage, women's leadership, intercultural dialogue, and sustainable community development.</p>

  <p class="only-staff">The individuals named in their respective visa applications are longstanding members of my palace establishment and perform recognised customary, ceremonial, cultural, and administrative duties in support of my traditional institution. Their participation forms an important part of the official cultural representation of my Queendom and will enable them to assist in the ceremonial, protocol, and cultural aspects of the Summit.</p>
  <p class="only-guest">The individual named above is an invited guest of the Summit. Their participation forms an important part of this international cultural and diplomatic gathering of traditional rulers, dignitaries, and members of the African diaspora.</p>

  <p class="only-staff">The proposed visit will take place from ${fromHtml} (for preparation in advance of the summit) to on or before ${toHtml} (to take into account clearance and consolidation prior to departure), following which they will return to Nigeria to resume their official responsibilities in and outside the palace and their personal, family, and community obligations. Their visit is strictly temporary and is solely for cultural, ceremonial, and Summit-related activities permitted under the UK Standard Visitor route. They have no intention of seeking employment, remaining beyond the authorised period of stay, or accessing public funds in the United Kingdom.</p>
  <p class="only-guest">The proposed visit will take place from ${fromHtml} to on or before ${toHtml}, following which the visitor will return to their home country to resume their personal, professional, family, and community obligations. The visit is strictly temporary and is solely for attendance at the Summit and related cultural activities permitted under the UK Standard Visitor route. The visitor has no intention of seeking employment, remaining beyond the authorised period of stay, or accessing public funds in the United Kingdom.</p>

  <p class="only-staff">During their stay, they will be accommodated at my residence:</p>
  <p class="only-staff" style="margin-left:22px"><strong>${esc(ACCOMMODATION)}</strong></p>

  <p class="only-staff">I confirm that I shall be financially responsible for the visitor throughout their stay in the United Kingdom. This includes:</p>
  <ul class="only-staff">
    <li>Accommodation</li>
    <li>Meals</li>
    <li>Local transportation</li>
    <li>General living expenses</li>
    <li>Emergency support, where necessary</li>
  </ul>
  <p class="only-staff">I will provide pastoral support throughout their visit.</p>

  <p class="only-guest">Provision has been made for accommodation at ${esc(ACCOMMODATION)} for the above named individual. I will also provide meals, local transportation and emergency support, where necessary.</p>

  <h3>Assurance of Compliance</h3>
  <p class="only-staff">I respectfully confirm that the invited visitors have substantial and compelling ties to Nigeria, including:</p>
  <ul class="only-staff">
    <li>Permanent residence in Nigeria.</li>
    <li>Family responsibilities.</li>
    <li>Official appointments within my palace establishment.</li>
    <li>Ongoing traditional and cultural duties.</li>
    <li>Community obligations requiring their return (e.g. paid employment, business or pastoral duties).</li>
  </ul>
  <p class="only-guest">I respectfully confirm that the invited visitor has substantial and compelling ties to their home country, including:</p>
  <ul class="only-guest">
    <li>Permanent residence in their home country.</li>
    <li>Family responsibilities.</li>
    <li>Professional, business or community commitments.</li>
    <li>Obligations requiring their return upon completion of the visit.</li>
  </ul>
  <p>These commitments provide strong assurance that they will depart the United Kingdom at the conclusion of their authorised visit.</p>
  <p>Neither I nor the visitor has any intention of breaching UK immigration laws or visa conditions. The visitor fully understands that the Standard Visitor Visa does not permit employment, access to public funds, or long-term residence in the United Kingdom.</p>

  <h3 class="only-staff">Supporting Documentation</h3>
  <p class="only-staff">To support this invitation, I will provide copies of the following documents:</p>
  <ul class="only-staff">
    <li>My passport.</li>
    <li>Recent bank statements.</li>
  </ul>
  <p class="only-staff">The visitor will also submit:</p>
  <ul class="only-staff">
    <li>A valid passport.</li>
    <li>Bank statements (where applicable).</li>
    <li>Any other supporting documents required by UKVI.</li>
  </ul>

  <p class="only-staff">I respectfully confirm that each member of my delegation maintains strong and enduring ties to Nigeria through their official appointments within my traditional institution, family commitments, and continuing cultural responsibilities, all of which require their return upon completion of the visit.</p>
  <p class="only-guest">I respectfully confirm that the visitor maintains strong and enduring ties to their home country through their professional, family, and community commitments, all of which require their return upon completion of the visit.</p>

  <p>I respectfully request that UK Visas and Immigration give favourable consideration to their applications. I am available to provide any further information or supporting documentation that may assist in the assessment of these applications.</p>

  <p>Thank you for your time and consideration.</p>

  <div class="sign">
    <p style="margin-bottom:2px">Yours faithfully,</p>
    ${sigSrc ? `<img src="${sigSrc}" alt="Signature" />` : '<div style="height:56px"></div>'}
    <div class="nm">${esc(SIGNATORY.name)}</div>
    <div>${esc(SIGNATORY.line1)}</div>
    <div>${esc(SIGNATORY.line2)}</div>
  </div>
  </div>
</div>
<script>
  var NAME = ${JSON.stringify(v.name || 'Visitor')};
  var CARD_URL = ${card ? 'location.href' : JSON.stringify(opts.short || cardLinkFor(v))};
  function copyLink() { copyToClipboard(CARD_URL, 'Shareable web link copied \\u2014 it opens this letter on any device. It carries the passport/DOB, so send only to the intended recipient.'); }
  function letterText() {
    return document.querySelector('.body-pad').innerText.replace(/\\n{3,}/g, '\\n\\n').trim();
  }
  function copyToClipboard(text, okMsg) {
    var ok = function () { alert(okMsg); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); }
      catch (e) { alert('Copy not supported here — select and copy manually.'); }
      document.body.removeChild(ta);
    }
  }
  function copyLetter() {
    var pad = document.querySelector('.body-pad');
    var text = letterText();
    var msg = 'Letter copied. Pasted into email or a document it keeps the signature; in a plain-text box (e.g. WhatsApp) the signature can\\u2019t show \\u2014 attach the PDF for the signed version.';
    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem && window.isSecureContext) {
      try {
        var item = new ClipboardItem({
          'text/html': new Blob([pad.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        });
        navigator.clipboard.write([item]).then(function () { alert(msg); }, function () { copyToClipboard(text, msg); });
        return;
      } catch (e) { /* fall through to plain text */ }
    }
    copyToClipboard(text, msg);
  }
  ${card ? `(function () {
    var p = new URLSearchParams(location.search), raw = p.get('d') || '';
    var data = {};
    try { data = JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) {}
    var guest = data.kind === 'guest';
    ${VISA_BLOCK_COND ? `var ALLOW = ${JSON.stringify(VISA_UNBLOCK)};
    if ((${VISA_BLOCK_COND}) && ALLOW.indexOf((data.name || '').trim()) < 0) {
    document.title = 'Temporarily Unavailable';
    document.body.innerHTML = '<div style="min-height:100vh;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:32px;text-align:center;font-family:Georgia,\\'Times New Roman\\',serif;background:#241a10;">' +
      '<div style="max-width:480px;">' +
      '<div style="font-size:46px;margin-bottom:16px;">&#128274;</div>' +
      '<h1 style="font-weight:600;font-size:27px;margin:0 0 14px;color:#e8c66a;">Temporarily Unavailable</h1>' +
      '<p style="font-size:16px;line-height:1.65;color:#e9dec6;margin:0 0 12px;">This visa invitation letter is temporarily unavailable while under review. It cannot be viewed, printed or downloaded at this time.</p>' +
      '<p style="font-size:15px;line-height:1.6;color:#c9b688;margin:0;">Please try again later or contact the Office of the Convener.</p>' +
      '<p style="font-size:13px;color:#9c855a;margin-top:22px;">African Queens Summit &middot; africanqueenssummit@gmail.com</p>' +
      '</div></div>';
    try { window.print = function () {}; } catch (e) {}
    return;
    }` : ''}
    NAME = data.name || 'Visitor';
    function esch(s){ var d=document.createElement('div'); d.textContent = s==null?'':s; return d.innerHTML; }
    function setAll(cls, val){ var e=document.querySelectorAll('.'+cls); for(var i=0;i<e.length;i++) e[i].textContent = val || ''; }
    setAll('c-date', data.date);
    setAll('c-from', data.from || (guest ? ${JSON.stringify(GUEST_FROM)} : ${JSON.stringify(DEFAULT_FROM)}));
    setAll('c-to', data.to || (guest ? ${JSON.stringify(GUEST_TO)} : ${JSON.stringify(DEFAULT_TO)}));
    var nameBit = esch(data.name || '');
    if (!guest && data.role) nameBit = nameBit ? nameBit + ' \\u2014 ' + esch(data.role) : esch(data.role);
    var li = function (l, val) { return '<li><span class="lbl">' + l + ':</span> ' + (val ? esch(val) : '') + '</li>'; };
    var reHtml = '<p class="re">Re: ' + nameBit + '</p><ul class="re-list">' + li('Address', data.address) + li('Date of Birth', data.dob) + li('Passport Number', data.passport) + '</ul>';
    var res = document.querySelectorAll('.c-re'); for (var j=0;j<res.length;j++) res[j].innerHTML = reHtml;
    if (guest) { var bp = document.querySelector('.body-pad'); if (bp) bp.classList.add('kind-guest'); }
    document.title = 'Visa Invitation Letter \\u2014 ' + (data.name || '');
  })();` : ''}
  (function () {
    var emailBtn = document.getElementById('emailBtn'), waBtn = document.getElementById('waBtn');
    if (!emailBtn || !waBtn) return; // letter not rendered (e.g. temporarily blocked)
    var subj = encodeURIComponent('Visa Invitation Letter — ' + NAME);
    var body = encodeURIComponent(letterText());
    emailBtn.href = 'mailto:?subject=' + subj + '&body=' + body;
    waBtn.href = 'https://wa.me/?text=' + body;
  })();
</script>
</body>
</html>`;
}

// ---------- build ----------
mkdirSync(visaDir, { recursive: true });
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const sig = signatureDataUri();
const emblem = emblemDataUri();

// Friendly short links (slug -> tinyurl), if generated. Letters + master page prefer these.
let SHORTLINKS = {};
const shortlinksPath = join(root, 'content', 'data', 'visa-shortlinks.json');
if (existsSync(shortlinksPath)) {
  try { SHORTLINKS = JSON.parse(readFileSync(shortlinksPath, 'utf8')); } catch (e) { SHORTLINKS = {}; }
}

const files = readdirSync(visaDir).filter((f) => f.endsWith('.md')).sort();
const built = [];

const vDir = join(root, 'public', 'v'); // short-code pages: /v/<code>/ (stays short in the address bar)
for (const f of files) {
  const v = parseFrontmatter(readFileSync(join(visaDir, f), 'utf8'));
  const slug = f.replace(/\.md$/, '');
  const label = v.name || '(blank template — details to be inserted)';
  mkdirSync(join(outDir, slug), { recursive: true });
  const html = letterHtml(v, sig, emblem, { short: SHORTLINKS[slug] });
  writeFileSync(join(outDir, slug, 'index.html'), html);
  // Optional short-code route(s) — e.g. `code: bamba, baba` -> /v/bamba/ and /v/baba/
  // (same baked-in letter; multiple codes keep older shared links from breaking).
  const codes = (v.code || '').toLowerCase().split(/[,\s]+/).map((c) => c.replace(/[^a-z0-9-]/g, '')).filter(Boolean);
  for (const code of codes) {
    mkdirSync(join(vDir, code), { recursive: true });
    writeFileSync(join(vDir, code, 'index.html'), html);
    console.log(`  ✓ /v/${code}/  —  ${label}`);
  }
  built.push({ slug, name: label, v });
  console.log(`  ✓ /visa/${slug}/  —  ${label}`);
}

// Web card viewer — one deployed page that renders any letter from an encoded
// ?d= param (the visitor's data travels in the URL, so it works on the web).
mkdirSync(join(outDir, 'card'), { recursive: true });
writeFileSync(join(outDir, 'card', 'index.html'), letterHtml({}, null, null, { card: true }));

// Per-member data for the master page's "Get link" button.
const VISA_DATA = {};
for (const b of built) {
  if (b.slug === '_template') continue;
  const d = b.v || {};
  VISA_DATA[b.slug] = {
    name: d.name || '', role: d.role || '', address: d.address || '',
    dob: d.dob || '', passport: d.passport || '', date: d.date || '',
    from: d.from || '', to: d.to || '', kind: d.kind === 'guest' ? 'guest' : 'staff',
  };
}

// Two separate master pages — Palace Staff (/visa/) and Queens & Kings (/visa/royals/).
const memberKind = (b) => (b.v && b.v.kind === 'guest') ? 'guest' : 'staff';

const MASTER_CSS = `
  :root{--emerald:#0d6b4f;--emerald-deep:#094b38;--gold:#d4af37;--gold-deep:#b8860b;--brown:#3c2415;}
  *{box-sizing:border-box;}
  body{font-family:system-ui,sans-serif;margin:0;color:#eae2d0;line-height:1.55;
    background:radial-gradient(circle at 50% 0,#12503b,#0a2e22 60%,#071f18);min-height:100vh;}
  .wrap{max-width:760px;margin:0 auto;padding:36px 20px 60px;}
  h1{font-family:'Cormorant Garamond',serif;font-size:2rem;color:#fdf6e3;margin:0 0 2px;}
  .sub{font-family:'Marcellus',serif;letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:var(--gold);margin:0 0 14px;}
  .nav{margin:0 0 22px;font-size:13px;}.nav a{color:#f4d98a;text-decoration:none;}.nav a:hover{text-decoration:underline;}
  .card{background:rgba(255,255,255,0.05);border:1px solid rgba(212,175,55,0.35);border-radius:16px;padding:22px 22px 24px;margin-bottom:26px;}
  h2{font-family:'Cormorant Garamond',serif;font-size:1.35rem;color:#fdf6e3;margin:0 0 14px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;}
  .field{display:flex;flex-direction:column;gap:4px;}
  .field.wide{grid-column:1 / -1;}
  label{font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#c9b98f;}
  input,select{font:inherit;font-size:14px;padding:9px 11px;border-radius:8px;border:1px solid rgba(212,175,55,0.4);background:rgba(0,0,0,0.25);color:#fdf6e3;}
  select option{color:#111;}
  input::placeholder{color:#7f9084;}
  .btn{font-family:'Marcellus',serif;font-size:14px;cursor:pointer;border:none;border-radius:999px;padding:11px 26px;margin-top:16px;
    background:linear-gradient(180deg,#f4d97a,var(--gold));color:var(--brown);}
  .btn:hover{filter:brightness(1.05);}
  .msg{margin-top:12px;font-size:13px;min-height:18px;}
  .msg a{color:#f4d98a;}
  table{width:100%;border-collapse:collapse;}
  td{padding:11px 8px;border-bottom:1px solid rgba(212,175,55,0.18);vertical-align:middle;}
  .num{color:#8fae9f;width:30px;}
  .nm{font-weight:600;color:#fdf6e3;}
  .nm a{color:inherit;text-decoration:none;}.nm a:hover{text-decoration:underline;color:#f4d98a;}
  .cat{font-weight:400;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#0a2e22;background:var(--gold);border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:middle;}
  .act{text-align:right;white-space:nowrap;}
  .act a{color:#f4d98a;font-weight:600;text-decoration:none;margin-right:12px;}
  .act a:hover{text-decoration:underline;}
  .inv{white-space:nowrap;}
  .inv-btn{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:12.5px;cursor:pointer;background:none;border:1px solid rgba(212,175,55,0.4);color:#c9b98f;border-radius:999px;padding:5px 14px;}
  .inv-btn:hover{background:rgba(212,175,55,0.1);}
  .inv-btn .tickbox{width:14px;height:14px;border:1.5px solid currentColor;border-radius:3px;position:relative;flex:none;}
  tr.done .nm{color:#8fdcae;}
  tr.done .inv-btn{background:rgba(143,220,174,0.14);border-color:#8fdcae;color:#8fdcae;}
  tr.done .inv-btn .tickbox{background:#8fdcae;}
  tr.done .inv-btn .tickbox::after{content:'✓';position:absolute;top:-4px;left:0;color:#0a2e22;font-size:13px;font-weight:700;line-height:1;}
  .del{font:inherit;font-size:12px;cursor:pointer;background:none;border:1px solid rgba(224,119,77,0.6);color:#e0987d;border-radius:6px;padding:4px 10px;}
  .del:hover{background:rgba(224,119,77,0.15);}
  .linkbtn{font:inherit;font-size:12px;cursor:pointer;background:none;border:1px solid rgba(143,220,174,0.6);color:#8fdcae;border-radius:6px;padding:4px 10px;margin-right:8px;}
  .linkbtn:hover{background:rgba(143,220,174,0.15);}
  .note{background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:11px 14px;font-size:12.5px;color:#e7d9b0;margin-top:18px;}
  .empty{color:#9db3a6;font-style:italic;}`;

const MASTER_SCRIPT = `
  function copyToClipboard(text, okMsg){
    var ok=function(){ alert(okMsg); };
    if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(text).then(ok, fb); } else { fb(); }
    function fb(){ var ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); ok(); }catch(e){ prompt('Copy this link:', text); } document.body.removeChild(ta); }
  }
  function b64url(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,''); }
  function getLink(slug){
    if (SHORTLINKS[slug]) {
      copyToClipboard(SHORTLINKS[slug], 'Friendly link copied:\\n' + SHORTLINKS[slug] + '\\n\\nIt opens the letter on any device. Carries this person\\u2019s details incl. passport, so share only with the intended recipient.');
      return;
    }
    var d = VISA_DATA[slug]; if(!d) return;
    var url = SITE_URL + '/visa/card/?d=' + b64url(JSON.stringify(d));
    copyToClipboard(url, 'Long web link copied (no short link yet for this member).\\n\\nFor a friendly short link, run npm run visa:links.');
  }
  function val(id){ var el=document.getElementById(id); return el ? el.value.trim() : ''; }
  function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  function createLetter(){
    var name = val('v-name');
    var msg = document.getElementById('msg');
    if(!name){ msg.style.color='#e0987d'; msg.textContent='Please enter a name.'; return; }
    var slug = slugify(name);
    var md = ['---','name: '+name,'kind: '+KIND,'category: '+val('v-category'),'role: '+val('v-role'),'address: '+val('v-address'),
      'dob: '+val('v-dob'),'passport: '+val('v-passport'),'date: '+val('v-date'),
      'from: '+val('v-from'),'to: '+val('v-to'),'---',''].join('\\n');
    msg.style.color='#c9b98f'; msg.textContent='Creating…';
    fetch('/api/create-visa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:slug,markdown:md})})
      .then(function(r){return r.json();}).then(function(res){
        if(!res.ok) throw new Error(res.error||'failed');
        msg.style.color='#8fdcae'; msg.innerHTML='Created — <a href="'+res.url+'index.html" target="_blank">open '+name+'\\u2019s letter \\u2197</a>';
        setTimeout(function(){ location.reload(); }, 900);
      }).catch(function(e){ msg.style.color='#e0987d'; msg.textContent='Error: '+e.message; });
  }
  var INV_KEY = 'visaInvited';
  function getInv(){ try { return JSON.parse(localStorage.getItem(INV_KEY)) || {}; } catch(e){ return {}; } }
  function markRow(slug,on){ var row=document.querySelector('[data-slug="'+slug+'"]'); if(row) row.classList.toggle('done',on); }
  function toggleInvited(slug){ var m=getInv(); var on=!m[slug]; if(on) m[slug]=true; else delete m[slug]; localStorage.setItem(INV_KEY, JSON.stringify(m)); markRow(slug,on); }
  (function(){ var m=getInv(); Object.keys(m).forEach(function(s){ markRow(s,true); }); })();
  (function(){ var d=new Date(),M=['January','February','March','April','May','June','July','August','September','October','November','December'];var el=document.getElementById('v-date');if(el&&!el.value)el.value=d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear(); })();
  function del(slug){
    if(!confirm('Delete this letter?')) return;
    fetch('/api/delete-visa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:slug})})
      .then(function(r){return r.json();}).then(function(res){
        if(!res.ok) throw new Error(res.error||'failed');
        var row=document.querySelector('[data-slug="'+slug+'"]'); if(row) row.remove();
        var c=document.getElementById('count'); c.textContent=Math.max(0,parseInt(c.textContent,10)-1);
      }).catch(function(e){ alert('Error: '+e.message); });
  }`;

function masterPage(pageKind) {
  const isGuest = pageKind === 'guest';
  const members = built.filter((b) => b.slug !== '_template' && memberKind(b) === pageKind);
  const rows = members
    .map((b, i) => `<tr data-slug="${b.slug}"><td class="num">${i + 1}</td><td class="nm"><a href="/visa/${b.slug}/index.html" target="_blank">${esc(b.name)}</a>${b.v && b.v.category ? ` <span class="cat">${esc(b.v.category)}</span>` : ''}</td><td class="inv"><button class="inv-btn" onclick="toggleInvited('${b.slug}')"><span class="tickbox"></span>Invited</button></td><td class="act"><a href="/visa/${b.slug}/index.html" target="_blank">Open ↗</a><button class="linkbtn" onclick="getLink('${b.slug}')">🔗 Get link</button><button class="del" onclick="del('${b.slug}')">Delete</button></td></tr>`)
    .join('\n      ');
  const title = isGuest ? 'Queens & Kings · Visa Letters' : 'Palace Staff · Visa Letters';
  const sub = isGuest
    ? 'African Global Queens Summit — invited Queens, Kings, princes, princesses &amp; public'
    : 'African Global Queens Summit — UK Standard Visitor delegation';
  const addHeading = isGuest ? 'Add a Queen / King / invited guest' : 'Add a palace-staff member';
  const listHeading = isGuest ? 'Invited Queens &amp; Kings' : 'Delegation';
  const responsibility = 'The standard invitation-support letter — only the name, address, date of birth &amp; passport change per person.';
  const rolePh = isGuest ? 'Paramount Queen and custodian of heritage' : 'Traditional, cultural administrator and orator';
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Marcellus&display=swap" rel="stylesheet" />
<style>${MASTER_CSS}</style></head>
<body>
  <div class="wrap">
    <h1>${title}</h1>
    <p class="sub">${sub}</p>

    <div class="card">
      <h2>${addHeading}</h2>
      <p style="font-size:12.5px;color:#e7d9b0;margin:-6px 0 14px">${responsibility}</p>
      <div class="grid">
        <div class="field wide"><label>Full name (with title)</label><input id="v-name" placeholder="${isGuest ? 'HRM Queen Josephine Munmavwili' : 'Mr Samuel Iso'}" /></div>
        ${isGuest ? `<div class="field wide"><label>Category</label><select id="v-category">
          <option>Queen</option><option>King</option><option>Prince</option><option>Princess</option><option>Special Guest</option><option>Politician</option><option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option>
        </select></div>` : `<div class="field wide"><label>Role / title</label><input id="v-role" placeholder="${rolePh}" /></div>`}
        <div class="field wide"><label>Address</label><input id="v-address" placeholder="Calabar, Cross River State, Nigeria" /></div>
        <div class="field"><label>Date of birth</label><input id="v-dob" placeholder="5th July 1999" /></div>
        <div class="field"><label>Passport number</label><input id="v-passport" placeholder="B05181252" /></div>
        <div class="field"><label>Letter date (defaults to today)</label><input id="v-date" placeholder="e.g. 14 July 2026" /></div>
        ${isGuest ? '' : `<div class="field"><label>Visit from</label><input id="v-from" value="${esc(DEFAULT_FROM)}" /></div>
        <div class="field"><label>Visit to</label><input id="v-to" value="${esc(DEFAULT_TO)}" /></div>`}
      </div>
      <button class="btn" onclick="createLetter()">Create letter</button>
      <div class="msg" id="msg"></div>
    </div>

    <h2 style="margin:0 0 8px">${listHeading} (<span id="count">${members.length}</span>)</h2>
    <table id="list">
      ${rows || '<tr class="none"><td class="empty">No one yet — add someone above.</td></tr>'}
    </table>
    <div class="note">⚠️ These letters carry personal data (date of birth, passport). <strong>Get link</strong> copies a web link that opens the letter on any device — but the details (incl. passport) travel inside that link, so share it <strong>only with the intended recipient</strong>. For anything official, the <strong>PDF</strong> (Open → Save as PDF) is safest.</div>
  </div>

<script>
  var KIND = ${JSON.stringify(pageKind)};
  var VISA_DATA = ${JSON.stringify(VISA_DATA)};
  var SHORTLINKS = ${JSON.stringify(SHORTLINKS)};
  var SITE_URL = ${JSON.stringify(SITE_URL)};${MASTER_SCRIPT}
</script>
</body></html>`;
}

// The management pages are dev-only; on deploy (VISA_CARD_ONLY) only the card
// viewer is published so the internal create/manage UI never goes public.
if (!process.env.VISA_CARD_ONLY) {
  mkdirSync(join(outDir, 'royals'), { recursive: true });
  writeFileSync(join(outDir, 'index.html'), masterPage('staff'));
  writeFileSync(join(outDir, 'royals', 'index.html'), masterPage('guest'));
}

console.log(`\nBuilt ${built.length} visa letter(s) → public/visa/ (staff: /visa/, Queens & Kings: /visa/royals/)`);
