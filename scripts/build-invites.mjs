// Generates one personalised invitation page per invitee markdown file,
// plus a master dashboard for creating/sending invitations.
//
//   content/letter.md            -> shared letter body (markdown)
//   content/invitees/<slug>.md   -> per-Queen frontmatter + optional note
//
// Output:
//   public/invite/<slug>/index.html   (deploys to /invite/<slug>/)
//   public/invite/index.html          (master page — list + create)
//
// Zero dependencies — run with `node scripts/build-invites.mjs`.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const inviteesDir = join(root, 'content', 'invitees');
const outRoot = join(root, 'public', 'invite');

const PHONE = '447932506556'; // WhatsApp — international, no +, matches the site

// ---------- tiny markdown helpers ----------

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

function md(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null;
  // A line ending with a backslash forces a hard line break (e.g. a stacked address).
  const flushPara = () => {
    if (!para.length) return;
    const raw = para.join(' ').trim();
    // A line that is entirely bold (**…**) becomes a prominent subject line.
    const subj = raw.match(/^\*\*((?:(?!\*\*)[\s\S])+)\*\*$/);
    const cls = subj ? ' class="subject"' : '';
    const inner = subj ? subj[1] : raw;
    out.push(`<p${cls}>${inline(inner).replace(/@@BR@@\s*/g, '<br>')}</p>`);
    para = [];
  };
  const closeList = () => { if (list) { out.push('</ul>'); list = null; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim() === '---') { flushPara(); closeList(); continue; }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { flushPara(); closeList(); out.push(`<h2>${inline(h[2])}</h2>`); continue; }
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) { flushPara(); if (!list) { out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(li[1])}</li>`); continue; }
    closeList();
    let t = line.trim();
    if (t.endsWith('\\')) t = t.slice(0, -1).replace(/\s+$/, '') + '@@BR@@';
    para.push(t);
  }
  flushPara(); closeList();
  return out.join('\n        ');
}

// ---------- frontmatter ----------

function parse(file) {
  const txt = readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const data = {};
  let body = txt;
  if (m) {
    body = m[2];
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (kv) data[kv[1]] = kv[2].trim();
    }
  }
  return { data, body: body.trim() };
}

// Split an invitee body into a personal note and an optional custom letter.
// Everything after a `<!-- letter -->` (or `=== letter ===`) marker is that
// invitee's own letter, overriding the shared audience letter — for them only.
function splitBody(body) {
  const m = body.match(/^[ \t]*(?:<!--\s*letter\s*-->|={3,}\s*letter\s*={3,})[ \t]*$/im);
  if (m) {
    return { note: body.slice(0, m.index).trim(), letter: body.slice(m.index + m[0].length).trim() };
  }
  return { note: body.trim(), letter: '' };
}

// ---------- shared programme ----------

const programme = [
  ['14–15 Aug', 'Royal Arrival & Protocol Reception', '👑'],
  ['16 Aug', 'Opening of the Summit', '📜'],
  ['17–18 Aug', 'Oxford University Leadership Course & Seminar', '🎓'],
  ['19 Aug', 'Visit to Blenheim Palace', '🏰'],
  ['20 Aug', 'Courtesy visit to the Lord Mayor of Oxford · Art Exhibition', '🎨'],
  ['21 Aug', 'Bicester Designer Village', '🛍️'],
  ['22 Aug', "Day of Rest · Queen's Strategic Roundtables (closed-door)", '🫖'],
  ['23 Aug', 'Buckingham State Rooms & Royal Mews', '🏛️'],
  ['24 Aug', 'London bus tour — Big Ben, London Eye', '🎡'],
  ['25 Aug', 'Gala Night — Fashion, Art & Entertainment · Porchester Hall', '🥂'],
  ['26 Aug', 'Kew Gardens', '🌿'],
  ["27 Aug", "St Paul's Cathedral & Tower of London", '🗼'],
  ['28 Aug', 'Westminster Abbey', '⛪'],
  ['29–30 Aug', 'Free', '🕊️'],
  ['31 Aug', 'Notting Hill Carnival — End of Summit', '🥳'],
];

// Per-audience defaults
const AUD_SALUTATION = { queens: 'Your Majesty', kings: 'Your Majesty', morocco: 'Your Excellencies', politicians: 'Your Excellency', guests: '', princesses: 'Your Highness', excellency: 'Your Excellency' };

// Letter body per audience (content/letters/<audience>.md), falling back to base letter.md
const letterCache = {};
function getLetter(audience) {
  if (audience) {
    const p = join(root, 'content', 'letters', `${audience}.md`);
    if (existsSync(p)) {
      if (!letterCache[audience]) letterCache[audience] = md(readFileSync(p, 'utf8'));
      return letterCache[audience];
    }
  }
  if (!letterCache._base) letterCache._base = md(readFileSync(join(root, 'content', 'letter.md'), 'utf8'));
  return letterCache._base;
}

// Personalised WhatsApp acceptance message, tuned by audience.
function waAccept(name, audience) {
  const openers = {
    queens: `Your Majesty, this is ${name} 👑`,
    kings: `Your Majesty, this is ${name} 👑`,
    morocco: `Your Majesty, this is ${name} 👑`,
    politicians: `Your Excellency, this is ${name}`,
    guests: `Hello, this is ${name}`,
    princesses: `Your Highness, this is ${name} 👑`,
    excellency: `Your Excellency, this is ${name}`,
  };
  const opener = openers[audience] || openers.queens;
  const msg = `${opener} — I am honoured to accept your gracious invitation and confirm my attendance at the African Queens Summit (14–31 August 2026, London & Oxford).`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

// Add/subtract sections per invitation. Default order below.
const DEFAULT_SECTIONS = ['hero', 'recipient', 'letter', 'programme', 'signature', 'rsvp', 'footer'];
function resolveSections(data) {
  const valid = new Set(DEFAULT_SECTIONS);
  if (data.sections) {
    return data.sections.split(',').map((s) => s.trim().toLowerCase()).filter((s) => valid.has(s));
  }
  let order = DEFAULT_SECTIONS.slice();
  if (data.remove) {
    const rm = new Set(data.remove.split(',').map((s) => s.trim().toLowerCase()));
    order = order.filter((s) => !rm.has(s));
  }
  if (data.add) {
    for (const s of data.add.split(',').map((x) => x.trim().toLowerCase())) {
      if (valid.has(s) && !order.includes(s)) order.push(s);
    }
  }
  return order;
}

// ====================================================================
// TEMPLATE: heritage (African heritage pattern)
// ====================================================================

function heritage({ data, noteHtml, letterHtml }) {
  const name = data.name || 'Your Majesty';
  const audience = data.audience || 'queens';
  const salutation = data.salutation !== undefined && data.salutation !== ''
    ? data.salutation
    : (AUD_SALUTATION[audience] !== undefined ? AUD_SALUTATION[audience] : 'Your Majesty');
  const kingdom = data.kingdom || '';
  const date = data.date || '';
  // Orange-box honorific line: defaults to the audience salutation, but can be
  // overridden per person (honorific: ...) or hidden (honorific: none).
  const honorificText = data.honorific === undefined
    ? salutation
    : (String(data.honorific).toLowerCase() === 'none' ? '' : data.honorific);
  const custom = !!data.custom; // a per-person custom letter is self-contained
  const waLink = waAccept(name, audience);

  const progRows = programme
    .map(([d, t, ic], i) =>
      `<div class="prog-row${i === programme.length - 1 ? ' finale' : ''}"><span class="prog-ico" aria-hidden="true">${ic}</span><span class="when">${esc(d)}</span><span class="what">${esc(t)}</span></div>`)
    .join('\n        ');

  const noteBlock = noteHtml ? `<div class="note">${noteHtml}</div>\n` : '';
  const kingdomBlock = kingdom ? `<span class="ribbon-kingdom">${esc(kingdom)}</span>` : '';
  const saluteLine = salutation ? `${esc(salutation)},` : `Dear ${esc(name)},`;

  // ----- composable sections (add/subtract via frontmatter) -----
  const SECTIONS = {
    hero: () => `<div class="kente-band tall"></div>
    <header class="hero">
      <div class="hero-inner">
        <div class="medallion"><span class="rays" aria-hidden="true"></span><img class="emblem" src="/images/summit-emblem.png" alt="Summit emblem" /></div>
        <p class="eyebrow fade fd1">By Royal Invitation</p>
        <h1 class="title fade fd2">African Global Queens Summit</h1>
        <p class="subtitle fade fd3">United Kingdom &middot; 14&ndash;31 August 2026</p>
        <div class="glyph-row fade fd4"><span>&#10022;</span><span>&#9670;</span><span>&#10022;</span><span>&#9670;</span></div>
      </div>
    </header>
    <div class="kente-band"></div>`,
    recipient: () => `<div class="ribbon-wrap">
      <div class="ribbon fade fd5">
        <span class="ribbon-label">A Personal Invitation To</span>
        ${honorificText ? `<span class="ribbon-honorific">${esc(honorificText)}</span>` : ''}
        <span class="ribbon-name">${esc(name)}</span>
        ${kingdomBlock}
      </div>
    </div>`,
    letter: () => `<section class="content">
      ${date ? `<p class="dateline">${esc(date)}</p>` : ''}
      ${(custom || audience === 'morocco') ? '' : `<p class="salutation">${saluteLine}</p>`}
      ${noteBlock}${letterHtml}
    </section>`,
    programme: () => `<div class="mud-divider"></div>
    <section class="programme">
      <h2>Programme Highlights</h2>
      <div class="prog-list">
        ${progRows}
      </div>
    </section>`,
    signature: () => `<div class="kente-band"></div>
    <section class="signoff">
      <p class="regard">With Highest Royal Regard,</p>
      <img class="sig-img" src="/images/queen-aruk-signature.png" alt="Signature of Queen Aruk II" />
      <p class="name">Obonganwan Marie Erete, Queen Aruk II</p>
      <p class="role">Summit Convener &middot; African and Diaspora Queens Summit</p>
      <p class="motto">Leadership Rooted in Service, Royalty Defined by Impact.</p>
    </section>`,
    rsvp: () => `<section class="rsvp">
      <h2>The Honour of Your Reply Is Requested</h2>
      <a class="btn" href="/rsvp/">RSVP &amp; Reserve Your Place</a>
      <p class="alt">or confirm on <a href="${waLink}" target="_blank" rel="noopener">WhatsApp</a> &middot; email <a href="mailto:africanqueenssummit@gmail.com">africanqueenssummit@gmail.com</a></p>
    </section>`,
    footer: () => `<footer class="footer">
      <div class="kente-band tall"></div>
      <div class="footer-pad">
        <div class="partners-row">
          <div class="letterhead-box"><img src="/images/partners-letterhead.png" alt="Partners and letterhead" /></div>
          <img class="partner-logo" src="/images/foundation-african-royals.jpg" alt="Foundation of African Royals" />
        </div>
        <p class="org">ARUK II Humanitarian Services (UK) C.I.C</p>
        <p>Hawkhill Place, Stanton St John, Oxford, OX33 1HS, United Kingdom &middot; Tel: +44 793 250 6556</p>
        <p><a href="mailto:obonganwan.aruk@yahoo.com">obonganwan.aruk@yahoo.com</a> &middot; <a href="mailto:africanqueenssummit@gmail.com">africanqueenssummit@gmail.com</a> &middot; Company Reg. No. 17110628</p>
      </div>
    </footer>`,
  };
  const bodyHtml = resolveSections(data).map((k) => (SECTIONS[k] ? SECTIONS[k]() : '')).join('\n\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>A Royal Invitation · ${esc(name)} · African Queens Summit 2026</title>
<meta name="description" content="A formal royal invitation to ${esc(name)} to attend the African Global Queens Summit, United Kingdom, 14–31 August 2026." />
<meta name="robots" content="noindex" />
<meta property="og:title" content="A Royal Invitation · African Queens Summit 2026" />
<meta property="og:description" content="${esc(name)} — you are cordially invited to the African Global Queens Summit, England, 14–31 August 2026." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Marcellus&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>
  :root {
    --sand: #f6ecd8; --paper: #fbf5e9; --paper-soft: #fdf9f0;
    --emerald: #0d6b4f; --emerald-deep: #094b38;
    --terracotta: #c0532b; --ochre: #d98e2b;
    --gold: #d4af37; --gold-deep: #b8860b;
    --brown: #3c2415; --brown-soft: #5a3a24; --ink: #2a1c10; --line: #c9a85f;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; font-family: 'Spectral', Georgia, serif; color: var(--ink);
    line-height: 1.72; font-size: 17px;
    background-color: #2b1810;
    background-image:
      repeating-linear-gradient(135deg, rgba(0,0,0,0.16) 0 14px, rgba(0,0,0,0) 14px 28px),
      conic-gradient(from 45deg at 50% 50%, #3c2415, #5a3a24, #3c2415);
    background-attachment: fixed;
  }

  /* floating RSVP button */
  .pill {
    position: fixed; bottom: 16px; right: 16px; z-index: 9999;
    text-decoration: none; color: var(--brown);
    background: linear-gradient(180deg, #f4d97a, var(--gold));
    border: 1px solid var(--gold-deep);
    font-family: 'Marcellus', serif; padding: 9px 22px; border-radius: 18px;
    box-shadow: 0 8px 22px rgba(0,0,0,0.35); white-space: nowrap;
    text-align: center; line-height: 1.2;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .pill .pill-main { display: block; font-size: 13px; letter-spacing: 0.1em; }
  .pill .pill-sub { display: block; font-size: 10px; letter-spacing: 0.12em; opacity: 0.82; margin-top: 2px; }
  .pill:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.45); }

  .kente-band {
    height: 22px; width: 100%;
    background-image:
      repeating-linear-gradient(90deg, var(--emerald) 0 26px, var(--gold) 26px 34px, var(--terracotta) 34px 60px, var(--brown) 60px 68px, var(--ochre) 68px 94px, var(--gold) 94px 102px),
      repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 6px, rgba(255,255,255,0.06) 6px 12px);
    background-blend-mode: multiply;
  }
  .kente-band.tall { height: 34px; }
  .mud-divider {
    height: 40px; background-color: var(--brown);
    background-image:
      repeating-linear-gradient(90deg, transparent 0 18px, rgba(244,226,181,0.85) 18px 20px, transparent 20px 38px),
      radial-gradient(circle at 10px 20px, rgba(244,226,181,0.85) 2px, transparent 3px),
      radial-gradient(circle at 30px 8px, rgba(217,142,43,0.9) 2px, transparent 3px),
      radial-gradient(circle at 30px 32px, rgba(217,142,43,0.9) 2px, transparent 3px);
    background-size: 38px 40px, 40px 40px, 40px 40px, 40px 40px;
  }

  .frame {
    max-width: 760px; margin: 26px auto; background: var(--sand);
    box-shadow: 0 24px 64px rgba(0,0,0,0.5); border: 2px solid var(--gold-deep);
    border-radius: 22px; overflow: hidden; position: relative;
  }

  .hero {
    position: relative; text-align: center; padding: 0; color: #fdf6e3;
    background-color: var(--emerald-deep);
    background-image:
      conic-gradient(from 0deg at 50% 0%, rgba(212,175,55,0.18), rgba(13,107,79,0) 40%, rgba(192,83,43,0.16) 70%, rgba(13,107,79,0)),
      radial-gradient(circle at 50% -10%, rgba(217,142,43,0.35), transparent 55%);
  }
  .hero-inner { padding: 38px 26px 34px; position: relative; z-index: 2; }
  .medallion { position: relative; width: 184px; height: 184px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; }
  .medallion .rays {
    position: absolute; inset: 0; border-radius: 50%;
    background: repeating-conic-gradient(from 0deg, rgba(212,175,55,0) 0deg, rgba(212,175,55,0) 4deg, rgba(212,175,55,0.6) 5deg, rgba(212,175,55,0) 6deg, rgba(212,175,55,0) 10deg);
    -webkit-mask: radial-gradient(circle, transparent 44%, #000 45%, #000 74%, transparent 75%);
    mask: radial-gradient(circle, transparent 44%, #000 45%, #000 74%, transparent 75%);
    animation: raysSpin 50s linear infinite;
  }
  @keyframes raysSpin { to { transform: rotate(360deg); } }
  .emblem {
    position: relative; z-index: 2; width: 142px; height: 142px; object-fit: contain;
    border-radius: 50%; background: rgba(251,245,233,0.95); padding: 4px;
    border: 3px solid var(--gold); box-shadow: 0 0 0 6px rgba(13,107,79,0.6), 0 8px 24px rgba(0,0,0,0.4);
    animation: emblemFade 1.1s ease both;
  }
  @keyframes emblemFade { from { opacity: 0; } to { opacity: 1; } }
  .eyebrow { font-family: 'Marcellus', serif; letter-spacing: 0.34em; text-transform: uppercase; font-size: 12px; color: var(--gold); margin: 0 0 12px; }
  .title { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: clamp(30px, 7vw, 50px); line-height: 1.04; margin: 0 0 14px; color: #fdf6e3; text-shadow: 0 2px 10px rgba(0,0,0,0.45); }
  .subtitle { font-family: 'Marcellus', serif; font-size: 15px; letter-spacing: 0.06em; color: #f1dca0; margin: 0; }
  .glyph-row { display: flex; justify-content: center; gap: 18px; margin: 18px 0 4px; }
  .glyph-row span { color: var(--gold); font-size: 18px; opacity: 0.9; }

  .ribbon-wrap { padding: 28px 22px 8px; text-align: center; background: var(--sand); }
  .ribbon {
    display: inline-block; position: relative; max-width: 600px; width: 100%; color: #fdf6e3;
    padding: 22px 30px; background: var(--terracotta); border: 1px solid var(--gold);
    border-radius: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.22);
  }
  .ribbon .ribbon-label { font-family: 'Marcellus', serif; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: var(--gold); display: block; margin-bottom: 8px; }
  .ribbon .ribbon-honorific { display: block; font-family: 'Cormorant Garamond', serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; font-size: clamp(20px, 4.6vw, 28px); color: #f4d98a; margin-bottom: 6px; text-shadow: 0 1px 6px rgba(0,0,0,0.3); }
  .ribbon .ribbon-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: clamp(23px, 5.6vw, 34px);
    line-height: 1.1; display: block; opacity: 0;
    animation: nameReveal 2.8s cubic-bezier(0.2,0.7,0.2,1) 1.5s both;
  }
  .ribbon .ribbon-kingdom { display: block; font-family: 'Spectral', serif; font-size: 14px; color: #fdf6e3; opacity: 0.85; margin-top: 8px; }
  @keyframes nameReveal {
    0% { opacity: 0; transform: translateY(12px); letter-spacing: 0.22em; filter: blur(6px); }
    60% { opacity: 1; }
    100% { opacity: 1; transform: translateY(0); letter-spacing: 0.01em; filter: blur(0); }
  }

  .content { background: var(--paper-soft); margin: 18px 18px 0; padding: 30px clamp(20px, 5vw, 46px) 36px; border: 1px solid rgba(184,134,11,0.35); border-radius: 16px; box-shadow: inset 0 0 0 6px var(--paper); }
  .dateline { font-family: 'Marcellus', serif; text-align: right; color: var(--brown-soft); letter-spacing: 0.05em; margin: 0 0 18px; font-size: 14px; }
  .salutation {
    font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 600; color: var(--emerald-deep);
    margin: 0 0 16px; opacity: 0; animation: nameReveal 2.8s cubic-bezier(0.2,0.7,0.2,1) 0.4s both;
  }
  .note { position: relative; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; line-height: 1.5; color: var(--emerald-deep); background: #fbf2dd; border: 1px solid rgba(184,134,11,0.3); border-left: 4px solid var(--gold); border-radius: 12px; padding: 16px 22px; margin: 0 0 28px; }
  .content p { margin: 0 0 18px; }
  .content p.subject { font-weight: 800; color: var(--emerald-deep); text-align: center; text-transform: uppercase; letter-spacing: 0.01em; line-height: 1.4; font-size: 1.06em; margin: 8px 0 26px; }

  /* title boxes (from markdown headings) */
  .content h2, .programme h2 {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: clamp(21px, 4.4vw, 28px);
    color: #fdf6e3; margin: 34px 0 18px; padding: 10px 22px;
    background-color: var(--emerald);
    background-image:
      repeating-linear-gradient(90deg, transparent 0 30px, rgba(212,175,55,0.10) 30px 32px, transparent 32px 62px),
      linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.10));
    border-radius: 10px; letter-spacing: 0;
  }
  .programme h2 { margin-top: 0; }
  .content h2::before, .programme h2::before { content: "\\25C6"; color: var(--gold); margin-right: 11px; font-size: 0.55em; vertical-align: middle; }

  .content ul { list-style: none; padding: 0; margin: 0 0 22px; }
  .content li { position: relative; padding: 8px 6px 8px 40px; border-bottom: 1px dashed rgba(184,134,11,0.4); }
  .content li:last-child { border-bottom: none; }
  .content li::before {
    content: ""; position: absolute; left: 6px; top: 13px; width: 18px; height: 18px;
    background:
      radial-gradient(circle at 50% 50%, var(--gold) 0 3px, transparent 4px),
      conic-gradient(from 0deg, var(--terracotta) 0 25%, var(--emerald) 25% 50%, var(--ochre) 50% 75%, var(--brown) 75% 100%);
    border-radius: 50%; border: 1px solid var(--brown);
  }

  .programme { background: var(--paper); margin: 22px 18px 0; padding: 26px clamp(18px, 4vw, 38px) 32px; border: 1px solid rgba(184,134,11,0.4); border-radius: 16px; }
  .prog-list { display: grid; gap: 4px; }
  .prog-row { display: grid; grid-template-columns: 46px 116px 1fr; gap: 12px 14px; align-items: center; padding: 9px 8px; border-radius: 12px; transition: background 0.25s ease, transform 0.25s ease; }
  .prog-row + .prog-row { border-top: 1px solid rgba(184,134,11,0.22); }
  .prog-row:hover { background: rgba(212,175,55,0.12); transform: translateX(3px); }
  .prog-ico {
    width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 20px; line-height: 1;
    background: radial-gradient(circle at 50% 32%, #fff7e0, #f1dda6);
    border: 1px solid var(--gold-deep); box-shadow: 0 3px 9px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .prog-row .when {
    font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.03em; color: #fff;
    background: linear-gradient(180deg, var(--emerald), var(--emerald-deep));
    padding: 7px 12px; border-radius: 999px; text-align: center; white-space: nowrap;
    border: 1px solid var(--gold); box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }
  .prog-row .what { color: var(--brown); font-size: 15.5px; }
  .prog-row.finale .when { background: linear-gradient(180deg, var(--terracotta), #9a3f1f); }
  .prog-row.finale .prog-ico { background: radial-gradient(circle at 50% 32%, #ffe6cf, #f2bf95); border-color: var(--terracotta); }
  .prog-row.finale .what { font-weight: 600; color: var(--emerald-deep); }

  .signoff { background: transparent; margin: 22px 18px 0; padding: 30px clamp(20px, 5vw, 46px) 34px; text-align: center; }
  .signoff .regard { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; color: var(--brown); margin: 0 0 4px; }
  .sig-img { width: 230px; max-width: 70%; height: auto; display: block; margin: 6px auto 8px; mix-blend-mode: multiply; }
  .signoff .name { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 24px; color: var(--emerald-deep); margin: 0; }
  .signoff .role { font-family: 'Marcellus', serif; font-size: 13px; letter-spacing: 0.06em; color: var(--brown-soft); margin: 4px 0 10px; }
  .signoff .motto { font-style: italic; font-family: 'Spectral', serif; color: var(--terracotta); font-size: 16px; margin: 0; }

  .rsvp { margin: 22px 18px 0; padding: 36px 24px 38px; text-align: center; color: #fdf6e3; background: linear-gradient(180deg, var(--emerald), var(--emerald-deep)); border: 1px solid var(--gold); border-radius: 16px; }
  .rsvp h2 { font-family: 'Cormorant Garamond', serif; font-size: 26px; margin: 0 0 18px; color: #fdf6e3; }
  .btn { display: inline-block; font-family: 'Marcellus', serif; letter-spacing: 0.08em; text-decoration: none; color: var(--brown); background: linear-gradient(180deg, #f4d97a, var(--gold)); padding: 15px 34px; border-radius: 6px; border: 2px solid var(--gold-deep); box-shadow: 0 8px 20px rgba(0,0,0,0.35); transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,0.45); }
  .rsvp .alt { margin: 18px 0 0; font-size: 14px; color: #f1dca0; }
  .rsvp .alt a { color: var(--gold); }

  .footer { background: var(--brown); color: #ecd9b8; text-align: center; padding: 0 0 28px; }
  .footer-pad { padding: 26px 22px 6px; }
  .partners-row { display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap; margin-bottom: 18px; }
  .letterhead-box { background: #ffffff; display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 10px; border: 1px solid var(--gold); height: 92px; }
  .letterhead-box img { height: 74px; width: auto; max-width: 56vw; display: block; }
  .partner-logo { height: 92px; width: auto; max-width: 56vw; border-radius: 10px; border: 1px solid var(--gold); box-shadow: 0 6px 18px rgba(0,0,0,0.4); }
  .footer .org { font-family: 'Marcellus', serif; font-size: 15px; color: var(--gold); margin: 0 0 8px; letter-spacing: 0.04em; }
  .footer p { margin: 4px auto; font-size: 13px; max-width: 540px; line-height: 1.6; color: #ddc89f; }
  .footer a { color: #f1dca0; }

  .hero .glyph-row span { animation: glyphPulse 3.6s ease-in-out infinite; }
  .glyph-row span:nth-child(2) { animation-delay: 0.4s; }
  .glyph-row span:nth-child(3) { animation-delay: 0.8s; }
  .glyph-row span:nth-child(4) { animation-delay: 1.2s; }
  @keyframes glyphPulse { 0%, 100% { opacity: 0.55; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }

  .fade { opacity: 0; animation: fadeUp 0.9s ease forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .fd1 { animation-delay: 0.25s; } .fd2 { animation-delay: 0.5s; } .fd3 { animation-delay: 0.75s; } .fd4 { animation-delay: 1s; } .fd5 { animation-delay: 1.25s; }

  .sr { opacity: 0; transform: translateY(24px); transition: opacity 0.85s ease, transform 0.85s ease; }
  .sr.in { opacity: 1; transform: none; }

  @media (prefers-reduced-motion: reduce) {
    .fade { animation: none; opacity: 1; transform: none; }
    .hero .glyph-row span { animation: none; }
    .emblem { animation: none; opacity: 1; }
    .medallion .rays { animation: none; }
    .ribbon-name, .salutation { animation: none; opacity: 1; filter: none; letter-spacing: normal; transform: none; }
    .sr { opacity: 1; transform: none; }
    html { scroll-behavior: auto; }
    .btn { transition: none; }
  }
  @media (max-width: 560px) {
    body { font-size: 16px; }
    .content, .signoff, .programme, .rsvp { margin-left: 10px; margin-right: 10px; }
    .prog-row { grid-template-columns: 42px 1fr; gap: 6px 12px; }
    .prog-ico { grid-row: 1 / span 2; align-self: start; }
    .prog-row .when { justify-self: start; }
    .frame { margin: 12px 8px; }
  }
  @media print {
    /* margin:0 suppresses the browser's URL/date header & footer */
    @page { margin: 0; }
    /* darker, crisper reading text for print */
    :root { --ink: #120d07; --ink-soft: #1d160b; --muted: #3a2d18; --brown: #1b1207; --brown-soft: #2a1c0d; }
    .pill { display: none !important; }
    body { background: #fff !important; background-image: none !important; padding: 0 !important; }
    .frame { box-shadow: none !important; border: none !important; border-radius: 0 !important; margin: 0 auto !important; max-width: 100% !important; }
    .rays { display: none !important; }
    .sr, .fade, .ribbon-name, .salutation, .emblem { opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important; }
    /* keep these coloured boxes' backgrounds so their light text stays legible */
    .hero, .ribbon, .content h2, .programme h2, .signoff, .btn,
    .kente-band, .mud-divider, .prog-row .when, .prog-ico, .letterhead-box, .partner-logo {
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    /* the dark RSVP band + footer print as a heavy black block — flip to white */
    .rsvp, .footer { background: #fff !important; background-image: none !important; border: none !important; }
    .footer { border-top: 1px solid #b8860b !important; }
    .rsvp h2, .footer .org { color: #1b1207 !important; }
    .rsvp p, .rsvp .alt, .rsvp .alt a, .footer p, .footer a { color: #2a1c0d !important; }
  }
</style>
</head>
<body>
  <a class="pill" href="/rsvp/" aria-label="RSVP and reserve your place">
    <span class="pill-main">RSVP &amp; Reserve &#10095;</span>
    <span class="pill-sub">14&ndash;31 August 2026</span>
  </a>

  <div class="frame">
    ${bodyHtml}
  </div>

  <script>
  (function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      var sel = '.content p:not(.dateline):not(.salutation), .content h2, .content ul, .note, .programme h2, .prog-row, .signoff > *, .footer-pad > *';
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) { el.classList.add('sr'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { io.observe(el); });
    }
  })();
  </script>
</body>
</html>
`;
}

const TEMPLATES = { heritage };

// ====================================================================
// MASTER PAGE — list existing invitations + create new ones
// ====================================================================

function masterPage(built, templateNames, rawLetters, invitedStore) {
  const data = JSON.stringify(built);
  const lettersJson = JSON.stringify(rawLetters || {});
  const invitedJson = JSON.stringify(invitedStore || {});
  const tplOptions = templateNames.map((t) => `<option value="${t}">${t}</option>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Invitations · Master Page</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Marcellus&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root { --emerald:#0d6b4f; --emerald-deep:#094b38; --gold:#d4af37; --gold-deep:#b8860b; --terracotta:#c0532b; --brown:#3c2415; --sand:#f6ecd8; --paper:#fdf9f0; --ink:#2a1c10; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Spectral', Georgia, serif; color: var(--ink);
    background: #2b1810 conic-gradient(from 45deg at 50% 50%, #3c2415, #5a3a24, #3c2415) fixed; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 40px 18px 80px; }
  h1 { font-family: 'Cormorant Garamond', serif; color: #fdf6e3; font-size: clamp(30px,6vw,46px); margin: 0 0 6px; text-align: center; }
  .sub { text-align: center; color: #e7c89a; font-family: 'Marcellus', serif; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; margin-bottom: 32px; }
  .card { background: var(--paper); border: 1px solid var(--gold-deep); border-radius: 16px; padding: 24px clamp(18px,4vw,32px); margin-bottom: 26px; box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
  .card h2 { font-family: 'Cormorant Garamond', serif; color: var(--emerald-deep); font-size: 24px; margin: 0 0 16px; }
  .tabs { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
  .tab { font-family: 'Marcellus', serif; font-size: 13px; letter-spacing: 0.05em; color: #e7c89a; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.4); padding: 10px 20px; border-radius: 999px; cursor: pointer; }
  .tab:hover { background: rgba(255,255,255,0.12); }
  .tab.active { background: linear-gradient(180deg,#f4d97a,var(--gold)); color: var(--brown); border-color: var(--gold-deep); }
  .visa-tab { text-decoration: none; background: var(--emerald); color: #f4d98a; border-color: var(--emerald); }
  .visa-tab:hover { background: var(--emerald-deep); }
  .panel[hidden] { display: none; }
  .big-toggle { display: block; width: 100%; text-align: center; font-size: 14.5px; padding: 15px 18px; margin: 8px 0 4px; background: transparent; color: var(--emerald-deep); border: 2px dashed var(--emerald); border-radius: 12px; }
  .big-toggle:hover { background: rgba(13,107,79,0.06); }
  .big-toggle.on { background: linear-gradient(180deg,#f4d97a,var(--gold)); color: var(--brown); border-style: solid; border-color: var(--gold-deep); }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 14px 0; border-bottom: 1px dashed rgba(184,134,11,0.4); }
  .row:last-child { border-bottom: none; }
  .row .nm { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 19px; color: var(--brown); flex: 1 1 220px; }
  .row .tag { font-family: 'Marcellus', serif; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #fff; background: var(--emerald); padding: 3px 9px; border-radius: 999px; }
  .row .path { font-family: 'Marcellus', serif; font-size: 12px; color: #8a7250; flex-basis: 100%; }
  a.act, button.act { font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.04em; text-decoration: none; cursor: pointer;
    color: var(--brown); background: linear-gradient(180deg,#f4d97a,var(--gold)); border: 1px solid var(--gold-deep);
    padding: 8px 14px; border-radius: 999px; }
  a.act.ghost, button.act.ghost { background: transparent; color: var(--emerald-deep); border-color: var(--emerald); }
  a.act.wa, button.act.wa { background: #25d366; border-color: #1da851; color: #053; }
  .field { margin-bottom: 14px; }
  label { display: block; font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--emerald-deep); margin-bottom: 5px; }
  input, select, textarea { width: 100%; font-family: 'Spectral', serif; font-size: 15px; padding: 10px 12px; border: 1px solid #cdbb8e; border-radius: 8px; background: #fff; color: var(--ink); }
  textarea { min-height: 70px; resize: vertical; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .sections { display: flex; flex-wrap: wrap; gap: 8px 18px; padding: 4px 2px; }
  .chk { display: flex; align-items: center; gap: 7px; font-family: 'Spectral', serif; font-size: 14px; text-transform: none; letter-spacing: normal; color: var(--ink); margin: 0; cursor: pointer; }
  .chk input { width: auto; }
  .row .tag.aud { background: var(--terracotta); }
  .out { margin-top: 16px; }
  .out textarea { min-height: 230px; font-family: ui-monospace, Menlo, monospace; font-size: 13px; background: #fbf5e9; }
  textarea.editor { min-height: 340px; font-family: ui-monospace, Menlo, monospace; font-size: 13px; background: #fbf5e9; line-height: 1.55; }
  .hint { font-size: 13px; color: #6f5a36; margin-top: 8px; line-height: 1.6; }
  code { background: #efe4c7; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
  .empty { color: #8a7250; font-style: italic; }
  .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
  .toolbar input { flex: 1 1 240px; }
  .toolbar select { flex: 0 0 auto; width: auto; }
  .count { font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.04em; color: #8a7250; margin-left: auto; }
  #list { max-height: 70vh; overflow-y: auto; padding-right: 6px; }
  .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--emerald-deep); color: #fdf6e3; border: 1px solid var(--gold); padding: 14px 22px; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.5); font-family: 'Marcellus', serif; font-size: 14px; opacity: 0; pointer-events: none; transition: opacity .3s ease, transform .3s ease; z-index: 99999; max-width: 92vw; text-align: center; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .sent-chk { display: flex; align-items: center; gap: 6px; font-family: 'Marcellus', serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #8a7250; margin: 0; cursor: pointer; }
  .sent-chk input { width: auto; }
  .row.sent { opacity: 0.72; }
  .row.sent .nm::after { content: ' ✓ invited'; color: var(--emerald); font-size: 12px; font-family: 'Marcellus', serif; letter-spacing: 0.04em; }
  @media (max-width: 560px) { .two { grid-template-columns: 1fr; } }
</style>
</head>
<body>
  <div class="wrap">
    <h1>African Queens Summit · Invitations</h1>
    <div class="sub">Master Page — Create &amp; Send Personal Invitations</div>

    <div class="tabs">
      <button class="tab active" data-tab="create">＋ Create</button>
      <button class="tab" data-tab="existing">Existing invitations</button>
      <button class="tab" data-tab="shared">Shared letters</button>
      <a class="tab visa-tab" href="/visa/" target="_blank" rel="noopener">🛂 Visa Letters ↗</a>
      <a class="tab visa-tab" href="/invite/morocco/" target="_blank" rel="noopener">🇲🇦 Morocco Letter ↗</a>
      <a class="tab visa-tab" href="/invite/invoices/" target="_blank" rel="noopener">🧾 Invoices ↗</a>
    </div>

    <div class="panel" id="tab-create">
    <div class="card">
      <h2>Create a new invitation</h2>
      <div class="two">
        <div class="field"><label>Recipient (full title &amp; name)</label><input id="f-name" placeholder="HRM Queen Naano Dumaaley" /></div>
        <div class="field"><label>Audience (sets letter &amp; salutation)</label><select id="f-audience">
          <option value="queens">Queen</option>
          <option value="kings">King</option>
          <option value="morocco">Kingdom of Morocco</option>
          <option value="politicians">Politician</option>
          <option value="excellency">Head of State / Excellency</option>
          <option value="guests">Special Guest</option>
          <option value="princesses">Princess</option>
        </select></div>
      </div>
      <div class="two">
        <div class="field"><label>Kingdom / Institution (optional)</label><input id="f-kingdom" placeholder="The Kingdom of …" /></div>
        <div class="field"><label>Salutation</label><input id="f-salutation" value="Your Majesty" /></div>
      </div>
      <div class="two">
        <div class="field"><label>Date</label><input id="f-date" value="25th June 2026" placeholder="25th June 2026" /></div>
        <div class="field"><label>Link slug (URL)</label><input id="f-slug" placeholder="naano-dumaaley" /></div>
      </div>
      <div class="field"><label>Design template</label><select id="f-template">${tplOptions}</select></div>
      <div class="field"><label>Sections — tick to include (add / subtract)</label>
        <div class="sections" id="f-sections">
          <label class="chk"><input type="checkbox" value="hero" checked /> Hero</label>
          <label class="chk"><input type="checkbox" value="recipient" checked /> Recipient</label>
          <label class="chk"><input type="checkbox" value="letter" checked /> Letter</label>
          <label class="chk"><input type="checkbox" value="programme" checked /> Programme</label>
          <label class="chk"><input type="checkbox" value="signature" checked /> Signature</label>
          <label class="chk"><input type="checkbox" value="rsvp" checked /> RSVP</label>
          <label class="chk"><input type="checkbox" value="footer" checked /> Footer</label>
        </div>
      </div>
      <div class="field"><label class="chk" style="text-transform:none;letter-spacing:normal;font-size:14px;color:var(--ink);"><input type="checkbox" id="f-nobody" style="width:auto;margin-right:8px;" /> Omit letter body — share letterhead, programme &amp; signature only</label></div>
      <div class="field"><label>Personal note (optional)</label><textarea id="f-note" placeholder="It would be a profound honour to welcome you…"></textarea></div>
      <button type="button" class="big-toggle" id="f-customletter">✎ Customise the whole letter for THIS person only</button>
      <p class="hint" style="margin:2px 0 10px;">Overrides the audience letter — for this person only, not the others.</p>
      <div class="field" id="f-letter-wrap" style="display:none;">
        <label>Letter for this person (markdown)</label>
        <textarea id="f-letter" class="editor"></textarea>
      </div>
      <button class="act" id="gen">Generate markdown</button>
      <div class="out" id="out" style="display:none">
        <label>Save this as <code id="fname">content/invitees/&lt;slug&gt;.md</code></label>
        <textarea id="md" readonly></textarea>
        <button class="act ghost" id="copymd">Copy markdown</button>
        <p class="hint">Then run <code>npm run build</code> (or commit &amp; push) and the invitation goes live at <code id="livelink"></code>. Re-run to refresh this list.</p>
      </div>
    </div>
    </div>

    <div class="panel" id="tab-existing" hidden>
    <div class="card">
      <h2>Existing invitations</h2>
      <div class="toolbar">
        <input id="search" type="text" placeholder="🔍 Search by name…" />
        <select id="filter-aud">
          <option value="">All audiences</option>
          <option value="queens">Queens</option>
          <option value="kings">Kings</option>
          <option value="morocco">Kingdom of Morocco</option>
          <option value="princesses">Princesses</option>
          <option value="politicians">Politicians</option>
          <option value="excellency">Heads of State</option>
          <option value="guests">Guests</option>
        </select>
        <select id="filter-sent">
          <option value="">All</option>
          <option value="unsent">Not invited</option>
          <option value="sent">Invited</option>
        </select>
        <span class="count" id="count"></span>
      </div>
      <div id="list"></div>
    </div>
    </div>

    <div class="panel" id="tab-shared" hidden>
    <div class="card">
      <h2>Edit the SHARED audience letter</h2>
      <p class="hint">⚠️ This is the default letter for a whole audience — editing it changes <strong>every</strong> invitation of that type. To change just one person's letter, use “Customise the whole letter for THIS person” in the Create tab.</p>
      <div class="field"><label>Audience letter</label><select id="ed-audience">
        <option value="queens">Queens</option>
        <option value="kings">Kings</option>
        <option value="morocco">Kingdom of Morocco</option>
        <option value="politicians">Politicians</option>
        <option value="excellency">Heads of State / Excellency</option>
        <option value="guests">Special Guests</option>
        <option value="princesses">Princesses</option>
      </select></div>
      <textarea id="ed-md" class="editor"></textarea>
      <div style="margin-top:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <button class="act ghost" id="ed-copy">Copy markdown</button>
        <span class="hint" style="margin:0;">Save as <code id="ed-fname">content/letters/queens.md</code></span>
      </div>
    </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>

  <script>
  var INVITES = ${data};
  var INVITED = ${invitedJson};
  var origin = location.origin;
  // Invitation links must point at the live site (names aren't stored there —
  // they travel only in the query params). On localhost, use the production host.
  var SITE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'https://africanqueenssummit.com' : origin;

  function slugify(s) {
    var honor = /^(hrm|hrh|hm|her|his|royal|majesty|highness|queen|king|chief|obong|obonganwan|princess|prince|dr|sir|lady|the)\\b/i;
    var t = String(s).trim();
    for (var i = 0; i < 4; i++) { var n = t.replace(honor, '').trim(); if (n === t) break; t = n; }
    if (!t) t = String(s);
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function inviteUrl(name, audience, noLetter) {
    var SHORT = { queens: 'q', kings: 'k', morocco: 'mo', princesses: 'pr', politicians: 'po', guests: 'g', excellency: 'ex' };
    var n = encodeURIComponent(String(name).trim().replace(/\\s+/g, '_'));
    return SITE + '/invite/card/?n=' + n + '&t=' + (SHORT[audience] || 'q') + (noLetter ? '&letter=0' : '');
  }
  function shareWa(name, slug, audience, noLetter) {
    var sal = SAL_DEFAULT[audience] || '';
    var greeting = sal ? (sal + ', ' + name) : ('Dear ' + name);
    var msg = greeting + ' \\u2014 on behalf of Her Majesty Obonganwan Marie Erete, Queen Aruk II, you are warmly invited to the African Global Queens Summit (United Kingdom, 14\\u201331 August 2026). Your personal invitation: ' + inviteUrl(name, audience, noLetter) + ' \\u2014 kindly RSVP via the page.';
    return 'https://wa.me/?text=' + encodeURIComponent(msg);
  }
  var SAL_DEFAULT = { queens: 'Your Majesty', kings: 'Your Majesty', morocco: 'Your Excellencies', politicians: 'Your Excellency', guests: '', princesses: 'Your Highness', excellency: 'Your Excellency' };
  var ALL_SECTIONS = ['hero', 'recipient', 'letter', 'programme', 'signature', 'rsvp', 'footer'];
  var LETTERS = ${lettersJson};
  var NOTES = {
    queens: 'It would be a profound honour to welcome you among the sovereign matriarchs gathered in England this August.',
    kings: 'It would be a profound honour to welcome you among the sovereigns gathered in England this August.',
    morocco: 'It would be a profound honour to welcome the Kingdom of Morocco among the sovereigns gathered in England this August.',
    politicians: 'It would be a distinct honour to receive you among the convocation in England this August.',
    guests: 'It would be a joy to welcome you as our honoured guest at the Summit in England this August.',
    princesses: 'It would be a profound honour to welcome you among the royal women gathered in England this August.',
    excellency: 'It would be a singular honour to welcome Your Excellency among the leaders gathered in England this August.'
  };

  // --- toast ---
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  // --- tabs ---
  function activateTab(id) {
    document.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-tab') === id); });
    document.querySelectorAll('.panel').forEach(function (p) { p.hidden = (p.id !== 'tab-' + id); });
  }
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      var id = t.getAttribute('data-tab');
      activateTab(id);
      history.replaceState(null, '', '#' + id);
    });
  });
  if (location.hash && document.getElementById('tab-' + location.hash.slice(1))) {
    activateTab(location.hash.slice(1));
  }

  // --- sent state (persisted locally in this browser) ---
  var SENT_KEY = 'aqs-sent';
  function loadSent() { try { return JSON.parse(localStorage.getItem(SENT_KEY)) || {}; } catch (e) { return {}; } }
  function saveSent(s) { try { localStorage.setItem(SENT_KEY, JSON.stringify(s)); } catch (e) {} }
  var sent = loadSent();
  // merge the durable file-backed invited store (survives across devices)
  Object.keys(INVITED).forEach(function (s) { sent[s] = true; });

  // --- existing list ---
  var list = document.getElementById('list');
  function renderRow(it) {
    var url = inviteUrl(it.name, it.audience, it.noLetter);
    var row = document.createElement('div');
    row.className = 'row' + (sent[it.slug] ? ' sent' : '');
    row.setAttribute('data-slug', it.slug);
    row.setAttribute('data-name', (it.name || '').toLowerCase());
    row.setAttribute('data-aud', it.audience || '');
    row.innerHTML =
      '<span class="nm">' + it.name + '</span>' +
      (it.audience ? '<span class="tag aud">' + it.audience + '</span>' : '') +
      '<span class="tag">' + it.template + '</span>' +
      '<a class="act" href="' + url + '" target="_blank">Open</a>' +
      '<button class="act ghost" data-copy="' + url + '">Copy link</button>' +
      '<a class="act wa" href="' + shareWa(it.name, it.slug, it.audience, it.noLetter) + '" target="_blank">Send on WhatsApp</a>' +
      '<span class="path">' + url + '</span>';
    var chk = document.createElement('label'); chk.className = 'sent-chk';
    var box = document.createElement('input'); box.type = 'checkbox'; box.checked = !!sent[it.slug];
    chk.appendChild(box); chk.appendChild(document.createTextNode(' Invited'));
    function setSent(v) {
      if (v) { sent[it.slug] = true; } else { delete sent[it.slug]; }
      saveSent(sent); box.checked = v; row.classList.toggle('sent', v);
      if (window.__applyFilter) window.__applyFilter();
      fetch('/api/set-invited', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: it.slug, invited: v }) }).catch(function () {});
    }
    box.addEventListener('change', function () { setSent(box.checked); });
    row.querySelector('a.wa').addEventListener('click', function () { setSent(true); });
    row.insertBefore(chk, row.querySelector('.path'));
    return row;
  }
  function refreshEmpty() {
    var has = list.querySelector('.row');
    var empty = list.querySelector('.empty');
    if (!has && !empty) { list.innerHTML = '<p class="empty">No invitations yet — create one in the Create tab.</p>'; }
    if (has && empty) { empty.remove(); }
  }
  INVITES.forEach(function (it) { list.appendChild(renderRow(it)); });
  refreshEmpty();

  // --- search / filter ---
  var searchEl = document.getElementById('search');
  var filterAud = document.getElementById('filter-aud');
  var filterSent = document.getElementById('filter-sent');
  var countEl = document.getElementById('count');
  function applyFilter() {
    var q = (searchEl.value || '').toLowerCase().trim();
    var aud = filterAud.value;
    var st = filterSent.value;
    var shown = 0, total = 0, sentN = 0;
    list.querySelectorAll('.row').forEach(function (r) {
      total++;
      var isSent = r.classList.contains('sent');
      if (isSent) sentN++;
      var okName = !q || (r.getAttribute('data-name') || '').indexOf(q) >= 0;
      var okAud = !aud || r.getAttribute('data-aud') === aud;
      var okSent = !st || (st === 'sent' ? isSent : !isSent);
      var vis = okName && okAud && okSent;
      r.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    countEl.textContent = shown + ' of ' + total + ' shown · ' + sentN + ' invited';
  }
  searchEl.addEventListener('input', applyFilter);
  filterAud.addEventListener('change', applyFilter);
  filterSent.addEventListener('change', applyFilter);
  window.__applyFilter = applyFilter;
  applyFilter();

  // --- create ---
  var nameEl = document.getElementById('f-name');
  var slugEl = document.getElementById('f-slug');
  var audEl = document.getElementById('f-audience');
  var salEl = document.getElementById('f-salutation');
  var noteEl = document.getElementById('f-note');
  var custBtn = document.getElementById('f-customletter');
  var letterWrap = document.getElementById('f-letter-wrap');
  var letterEl = document.getElementById('f-letter');
  var letterDirty = false;
  var customOn = false;
  letterEl.addEventListener('input', function () { letterDirty = true; });
  nameEl.addEventListener('input', function () { slugEl.value = slugify(nameEl.value); });
  function applyAudience() {
    salEl.value = SAL_DEFAULT[audEl.value] || '';
    noteEl.value = NOTES[audEl.value] || '';
    noteEl.placeholder = NOTES[audEl.value] || 'It would be a profound honour to welcome you…';
    if (customOn && !letterDirty) { letterEl.value = LETTERS[audEl.value] || ''; }
  }
  custBtn.addEventListener('click', function () {
    customOn = !customOn;
    custBtn.classList.toggle('on', customOn);
    if (customOn) {
      letterWrap.style.display = 'block';
      if (!letterDirty || !letterEl.value.trim()) { letterEl.value = LETTERS[audEl.value] || ''; letterDirty = false; }
    } else {
      letterWrap.style.display = 'none';
    }
  });
  audEl.addEventListener('change', applyAudience);
  applyAudience();

  // letter markdown editor
  var edAud = document.getElementById('ed-audience');
  var edMd = document.getElementById('ed-md');
  var edFname = document.getElementById('ed-fname');
  function loadLetter() {
    edMd.value = LETTERS[edAud.value] || '';
    edFname.textContent = 'content/letters/' + edAud.value + '.md';
  }
  edAud.addEventListener('change', loadLetter);
  loadLetter();
  document.getElementById('ed-copy').addEventListener('click', function () {
    edMd.select(); navigator.clipboard.writeText(edMd.value);
    var b = this; b.textContent = 'Copied!'; setTimeout(function () { b.textContent = 'Copy markdown'; }, 1500);
  });

  document.getElementById('gen').addEventListener('click', function () {
    var name = nameEl.value.trim() || 'Your Majesty';
    var slug = (slugEl.value.trim() || slugify(name));
    var audience = audEl.value;
    var kingdom = document.getElementById('f-kingdom').value.trim();
    var sal = salEl.value.trim();
    var date = document.getElementById('f-date').value.trim();
    var tpl = document.getElementById('f-template').value;
    var note = document.getElementById('f-note').value.trim();
    var noLetter = document.getElementById('f-nobody').checked;
    var secs = Array.prototype.map.call(document.querySelectorAll('#f-sections input:checked'), function (c) { return c.value; });
    // Keep the per-person page consistent with the shared card: drop the letter section too.
    if (noLetter) secs = secs.filter(function (s) { return s !== 'letter'; });

    var lines = ['---', 'slug: ' + slug, 'name: ' + name, 'audience: ' + audience, 'template: ' + tpl];
    if (sal) lines.push('salutation: ' + sal);
    if (kingdom) lines.push('kingdom: ' + kingdom);
    if (date) lines.push('date: ' + date);
    if (secs.length && secs.length !== ALL_SECTIONS.length) lines.push('sections: ' + secs.join(', '));
    lines.push('---');
    var custom = customOn ? letterEl.value.trim() : '';
    var out = lines.join('\\n') + '\\n';
    if (note) out += '\\n' + note + '\\n';
    if (custom) out += '\\n<!-- letter -->\\n' + custom + '\\n';

    document.getElementById('md').value = out;
    document.getElementById('fname').textContent = 'content/invitees/' + slug + '.md';
    var liveEl = document.getElementById('livelink');
    var vurl = inviteUrl(name, audience, noLetter);
    liveEl.innerHTML = '<a href="' + vurl + '" target="_blank">' + vurl + '</a>';
    document.getElementById('out').style.display = 'block';
    // the link works immediately (no generation needed — it's a query-param page)
    var existing = list.querySelector('[data-slug="' + slug + '"]');
    if (existing) existing.remove();
    list.insertBefore(renderRow({ slug: slug, name: name, audience: audience, template: tpl, noLetter: noLetter }), list.firstChild);
    refreshEmpty();
    if (window.__applyFilter) window.__applyFilter();
    toast('✓ ' + name + ' — invitation link ready.');

    // Also save the markdown locally for the WhatsApp tool / records (dev only).
    fetch('/api/create-invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug, markdown: out })
    }).then(function (r) { return r.json(); }).then(function () {}).catch(function () {});
  });

  document.getElementById('copymd').addEventListener('click', function () {
    var ta = document.getElementById('md'); ta.select();
    navigator.clipboard.writeText(ta.value); this.textContent = 'Copied!';
    var b = this; setTimeout(function () { b.textContent = 'Copy markdown'; }, 1500);
    toast('Markdown copied to clipboard');
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]'); if (!btn) return;
    navigator.clipboard.writeText(btn.getAttribute('data-copy'));
    var old = btn.textContent; btn.textContent = 'Copied!';
    setTimeout(function () { btn.textContent = old; }, 1500);
  });
  </script>
</body>
</html>
`;
}

// ====================================================================
// MOROCCO MASTER PAGE — build, preview and share the Kingdom of Morocco
// Government letter. It targets /invite/card/?t=mo, with optional recipient
// name / honorific and a full-vs-blank toggle.
// ====================================================================

function moroccoMasterPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Kingdom of Morocco · Letter Master Page</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Marcellus&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root { --emerald:#0d6b4f; --emerald-deep:#094b38; --gold:#d4af37; --gold-deep:#b8860b; --terracotta:#c0532b; --brown:#3c2415; --sand:#f6ecd8; --paper:#fdf9f0; --ink:#2a1c10; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Spectral', Georgia, serif; color: var(--ink);
    background: #2b1810 conic-gradient(from 45deg at 50% 50%, #3c2415, #5a3a24, #3c2415) fixed; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 40px 18px 80px; }
  h1 { font-family: 'Cormorant Garamond', serif; color: #fdf6e3; font-size: clamp(28px,6vw,44px); margin: 0 0 6px; text-align: center; }
  .sub { text-align: center; color: #e7c89a; font-family: 'Marcellus', serif; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; margin-bottom: 26px; }
  .back { display: inline-block; margin: 0 auto 18px; text-align: center; }
  .back a { color: #e7c89a; font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.05em; text-decoration: none; border: 1px solid rgba(212,175,55,0.4); padding: 8px 16px; border-radius: 999px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
  .card { background: var(--paper); border: 1px solid var(--gold-deep); border-radius: 16px; padding: 22px clamp(16px,3vw,26px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
  .card h2 { font-family: 'Cormorant Garamond', serif; color: var(--emerald-deep); font-size: 22px; margin: 0 0 14px; }
  .field { margin-bottom: 14px; }
  label { display: block; font-family: 'Marcellus', serif; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--emerald-deep); margin-bottom: 5px; }
  input, select { width: 100%; font-family: 'Spectral', serif; font-size: 15px; padding: 10px 12px; border: 1px solid #cdbb8e; border-radius: 8px; background: #fff; color: var(--ink); }
  .link-out { display: flex; gap: 8px; align-items: stretch; margin-top: 8px; }
  .link-out input { font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; background: #fbf5e9; }
  .btns { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .act { font-family: 'Marcellus', serif; font-size: 13px; letter-spacing: 0.04em; text-decoration: none; cursor: pointer; text-align: center;
    color: var(--brown); background: linear-gradient(180deg,#f4d97a,var(--gold)); border: 1px solid var(--gold-deep); padding: 11px 16px; border-radius: 999px; }
  .act:hover { filter: brightness(1.04); }
  .act.ghost { background: transparent; color: var(--emerald-deep); border-color: var(--emerald); }
  .act.wa { background: #25d366; border-color: #1da851; color: #053; }
  .act.small { padding: 10px 14px; font-size: 12px; }
  .hint { font-size: 13px; color: #6f5a36; margin-top: 12px; line-height: 1.6; }
  code { background: #efe4c7; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
  .preview-card { padding: 0; overflow: hidden; }
  .preview-head { display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; border-bottom: 1px solid rgba(184,134,11,0.4); }
  .preview-head h2 { margin: 0; font-size: 18px; }
  iframe { width: 100%; height: 760px; border: 0; background: #2b1810; display: block; }
  .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--emerald-deep); color: #fdf6e3; border: 1px solid var(--gold); padding: 13px 20px; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.5); font-family: 'Marcellus', serif; font-size: 14px; opacity: 0; pointer-events: none; transition: opacity .3s ease, transform .3s ease; z-index: 99999; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } iframe { height: 600px; } }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Kingdom of Morocco</h1>
    <div class="sub">Government Letter — Build, Preview &amp; Share</div>
    <div class="back" style="display:block;text-align:center;"><a href="/invite/">&#10094; Back to Invitations</a></div>

    <div class="grid">
      <div class="card">
        <h2>Build the letter link</h2>
        <div class="field">
          <label>Addressed to (optional)</label>
          <input id="m-name" placeholder="Leave blank for &ldquo;Your Excellencies&rdquo;" />
        </div>
        <div class="field">
          <label>Honorific line</label>
          <select id="m-hon">
            <option value="default">Your Excellencies (default)</option>
            <option value="Your Highness">Your Highness (Princess)</option>
            <option value="Madam">Madam</option>
            <option value="none">Hide honorific (no title)</option>
            <option value="custom">Custom&hellip;</option>
          </select>
        </div>
        <div class="field" id="m-hon-custom-wrap" style="display:none;">
          <label>Custom honorific</label>
          <input id="m-hon-custom" placeholder="e.g. Their Excellencies" />
        </div>
        <div class="field">
          <label>Content</label>
          <select id="m-body">
            <option value="full">Full letter</option>
            <option value="blank">Blank stationery (letterhead &amp; signature only)</option>
          </select>
        </div>
        <div class="field">
          <label>Shareable link</label>
          <div class="link-out">
            <input id="m-link" readonly />
            <button class="act ghost small" id="m-copy">Copy</button>
          </div>
        </div>
        <div class="btns">
          <a class="act" id="m-open" href="#" target="_blank" rel="noopener">Open letter &#10095;</a>
          <a class="act wa" id="m-wa" href="#" target="_blank" rel="noopener">Send on WhatsApp</a>
          <a class="act ghost" id="m-email" href="#">Email</a>
          <a class="act ghost" id="m-print" href="#" target="_blank" rel="noopener">Print / Save PDF</a>
        </div>
        <p class="hint">The letter body is edited in <code>content/letters/morocco.md</code>. This page only builds &amp; shares links — no personal data is stored on the site.</p>
      </div>

      <div class="card preview-card">
        <div class="preview-head"><h2>Live preview</h2><a class="act ghost small" id="m-refresh" href="#">Refresh</a></div>
        <iframe id="m-preview" title="Morocco letter preview"></iframe>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>

  <script>
  (function () {
    var origin = location.origin;
    var SITE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'https://africanqueenssummit.com' : origin;
    var nameEl = document.getElementById('m-name');
    var honEl = document.getElementById('m-hon');
    var honWrap = document.getElementById('m-hon-custom-wrap');
    var honCustom = document.getElementById('m-hon-custom');
    var bodyEl = document.getElementById('m-body');
    var linkEl = document.getElementById('m-link');
    var frame = document.getElementById('m-preview');
    var toastEl = document.getElementById('toast');
    var toastTimer;
    function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400); }

    function query() {
      var q = '/invite/card/?t=mo';
      var nm = (nameEl.value || '').trim().replace(/\\s+/g, '_');
      if (nm) q += '&n=' + encodeURIComponent(nm);
      var hon = honEl.value;
      if (hon === 'none') q += '&h=none';
      else if (hon === 'custom') { var c = (honCustom.value || '').trim().replace(/\\s+/g, '_'); if (c) q += '&h=' + encodeURIComponent(c); }
      else if (hon && hon !== 'default') q += '&h=' + encodeURIComponent(hon.replace(/\\s+/g, '_'));
      if (bodyEl.value === 'blank') q += '&letter=0';
      return q;
    }
    function refresh() {
      var rel = query();
      linkEl.value = SITE + rel;
      document.getElementById('m-open').href = SITE + rel;
      document.getElementById('m-print').href = SITE + rel;
      var waMsg = 'Your Excellencies \\u2014 on behalf of Her Majesty Obonganwan Marie Erete, Queen Aruk II, please find our letter regarding the African Queens Summit 2026: ' + SITE + rel;
      document.getElementById('m-wa').href = 'https://wa.me/?text=' + encodeURIComponent(waMsg);
      var subj = encodeURIComponent('African Queens Summit 2026 \\u2014 Letter to the Government of the Kingdom of Morocco');
      var mailBody = encodeURIComponent('Your Excellencies,\\n\\nPlease find our letter here: ' + SITE + rel + '\\n\\nWith highest consideration,\\nAfrican Queens Summit Secretariat');
      document.getElementById('m-email').href = 'mailto:?subject=' + subj + '&body=' + mailBody;
      if (frame.src !== location.origin + rel && frame.getAttribute('data-rel') !== rel) { frame.setAttribute('data-rel', rel); frame.src = rel; }
    }
    honEl.addEventListener('change', function () { honWrap.style.display = honEl.value === 'custom' ? '' : 'none'; refresh(); });
    [nameEl, honCustom].forEach(function (el) { el.addEventListener('input', refresh); });
    bodyEl.addEventListener('change', refresh);
    document.getElementById('m-copy').addEventListener('click', function () { linkEl.select(); navigator.clipboard.writeText(linkEl.value); toast('Link copied'); });
    document.getElementById('m-refresh').addEventListener('click', function (e) { e.preventDefault(); frame.setAttribute('data-rel', ''); refresh(); });
    document.getElementById('m-email').addEventListener('click', function () { toast('Opening your email app\\u2026'); });
    refresh();
  })();
  </script>
</body>
</html>
`;
}

// ====================================================================
// APPOINTMENT LETTER — Consultant appointment on the Aruk II Humanitarian
// Services (UK) C.I.C letterhead. Recipient personalised via ?n= (defaults
// to Amb. Hanane Ait-Toudghi); optional ?title= ?org= ?date= ?sal=.
// ====================================================================

function appointmentPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Letter of Appointment · African Queens Summit</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Marcellus&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>
  :root { --emerald:#0d6b4f; --emerald-deep:#094b38; --gold:#d4af37; --gold-deep:#b8860b; --brown:#3c2415; --brown-soft:#5a3a24; --ink:#241a10; --paper:#fdfaf2; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Spectral',Georgia,serif; color:var(--ink); line-height:1.62; font-size:16px; background:#6b5636; padding:24px 12px 60px; }
  .print { position:fixed; top:14px; right:14px; z-index:50; font-family:'Marcellus',serif; font-size:13px; letter-spacing:.05em; color:var(--brown); background:linear-gradient(180deg,#f4d97a,var(--gold)); border:1px solid var(--gold-deep); padding:9px 18px; border-radius:999px; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.35); text-decoration:none; }
  .sheet { max-width:820px; margin:0 auto; background:var(--paper); box-shadow:0 20px 60px rgba(0,0,0,.45); border-top:6px solid var(--emerald); }
  .pad { padding:40px clamp(22px,6vw,64px) 48px; }
  .lh { text-align:center; border-bottom:2px solid var(--gold); padding-bottom:18px; }
  .lh .motto { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:600; color:var(--emerald-deep); font-size:17px; margin:0 0 12px; }
  .lh .crest { width:72px; height:72px; object-fit:contain; margin:0 auto 8px; display:block; }
  .lh .org { font-family:'Marcellus',serif; font-weight:700; letter-spacing:.06em; color:var(--brown); font-size:clamp(16px,3.4vw,21px); margin:0 0 6px; }
  .lh .tag { font-family:'Spectral',serif; font-style:italic; color:var(--brown-soft); font-size:13px; margin:0 0 6px; }
  .lh .addr { font-family:'Marcellus',serif; font-size:12px; letter-spacing:.03em; color:var(--brown-soft); margin:0; }
  .date { text-align:right; margin:22px 0 18px; font-size:15px; color:var(--brown-soft); }
  .to .nm { font-weight:600; }
  .salute { margin:16px 0 10px; }
  .re { font-family:'Marcellus',serif; font-weight:700; text-transform:uppercase; letter-spacing:.02em; color:var(--emerald-deep); background:rgba(212,175,55,.14); border-left:4px solid var(--gold); padding:10px 14px; border-radius:0 8px 8px 0; margin:0 0 20px; line-height:1.4; }
  p { margin:0 0 14px; }
  ul { margin:0 0 16px; padding:0; list-style:none; }
  li { position:relative; padding:6px 0 6px 26px; }
  li::before { content:'\\2756'; position:absolute; left:2px; top:6px; color:var(--gold-deep); font-size:.8em; }
  .close { margin-top:22px; }
  .sig-img { width:210px; max-width:62%; display:block; margin:8px 0 4px; mix-blend-mode:multiply; }
  .sig-name { font-weight:700; font-family:'Cormorant Garamond',serif; font-size:19px; color:var(--emerald-deep); margin:0; }
  .sig-sub { font-size:13.5px; color:var(--brown-soft); margin:2px 0 0; }
  .foot { margin-top:30px; border-top:2px solid var(--gold); padding-top:14px; text-align:center; }
  .foot .org { font-family:'Marcellus',serif; font-weight:700; letter-spacing:.05em; color:var(--brown); font-size:14px; }
  .foot .tag { font-style:italic; color:var(--brown-soft); font-size:12px; margin:4px 0; }
  .foot .meta { font-size:11.5px; color:var(--brown-soft); line-height:1.7; }
  .accept { margin-top:28px; border:1px dashed var(--gold-deep); border-radius:10px; padding:18px 20px; background:rgba(212,175,55,.06); }
  .accept h3 { font-family:'Marcellus',serif; font-size:13px; letter-spacing:.08em; text-transform:uppercase; color:var(--emerald-deep); margin:0 0 10px; }
  .accept .line { margin-top:16px; font-size:15px; }
  @media print {
    @page { margin:14mm; }
    body { background:#fff; padding:0; }
    .print { display:none !important; }
    .sheet { box-shadow:none; max-width:100%; border-top:none; }
    .lh, .re, .foot, .accept, li::before { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
</style>
</head>
<body>
  <a class="print" href="#" onclick="window.print();return false;">&#128424; Print / Save PDF</a>
  <div class="sheet"><div class="pad">
    <div class="lh">
      <p class="motto">&ldquo;Leadership Rooted in Service, Royalty Defined by Impact.&rdquo;</p>
      <img class="crest" src="/images/summit-emblem.png" alt="Aruk II crest" />
      <p class="org">ARUK II HUMANITARIAN SERVICES (UK) C.I.C</p>
      <p class="tag">Promoting Cultural Heritage &bull; Empowering Communities &bull; Advancing Humanitarian Initiatives</p>
      <p class="addr">Hawkhill Place, Stanton St John, Oxford. OX33 1HS. United Kingdom</p>
    </div>

    <p class="date" id="a-date">17 July 2026</p>

    <div class="to">
      <div class="nm" id="a-name">Amb. Hanane Ait-Toudghi</div>
      <div id="a-title" style="display:none"></div>
      <div id="a-org" style="display:none"></div>
      <div id="a-addr" style="display:none"></div>
    </div>
    <p class="salute" id="a-salute">Your Excellency,</p>

    <p class="re">Re: Letter of Appointment as Consultant for the African Queens Summit</p>

    <p>We are pleased to formally appoint you, <strong id="a-name2">Amb. Hanane Ait-Toudghi</strong>, as a Consultant for the upcoming African Queens Summit.</p>

    <p>This appointment is in recognition of your distinguished standing, network, and capacity to contribute meaningfully to the success of the Summit. Your role will be instrumental in shaping the reach, impact, and overall execution of the event.</p>

    <p>In your capacity as Consultant, you are hereby entrusted with the authority and responsibility to:</p>
    <ul>
      <li>Coordinate invitations to distinguished guests and participants.</li>
      <li>Lead and support fundraising efforts for the Summit.</li>
      <li>Engage and attract investors and strategic partners.</li>
      <li>Facilitate the participation of kings, queens, and notable traditional leaders across North Africa, including the Kingdom of Morocco.</li>
      <li>Source funding and sponsorship opportunities to ensure the success of the Summit.</li>
      <li>Promote and advertise the event through appropriate channels.</li>
      <li>Identify, invite, and secure entertainers and performers for the Summit.</li>
      <li>Recommend and engage reputable artists of African extraction from the diaspora.</li>
      <li>Undertake all other activities deemed necessary, beneficial, and incidental to the successful planning and execution of the Summit.</li>
    </ul>

    <p>You are expected to carry out these responsibilities with professionalism, integrity, and in alignment with the vision and objectives of the African Queens Summit.</p>

    <p>This appointment takes effect from the date of this letter and will remain valid until the conclusion of the Summit or as otherwise determined by the organizing committee. We are confident that your involvement will greatly enhance the success and prestige of this event, and we look forward to a productive collaboration.</p>

    <p>Kindly signify your acceptance of this appointment by signing and returning a copy of this letter.</p>

    <p>Thank you for your commitment and anticipated contributions.</p>

    <div class="close">
      <p style="margin-bottom:2px;">Yours faithfully,</p>
      <img class="sig-img" src="/images/queen-aruk-signature.png" alt="Signature of Queen Aruk II" />
      <p class="sig-name">Obonganwan Marie Erete, Queen Aruk II</p>
      <p class="sig-sub">Summit Convener &middot; African and Diaspora Queens Summit</p>
      <p class="sig-sub">On behalf of Aruk II HS (UK) C.I.C, in collaboration with Ipada Initiatives, FATA and Maasai Tourism Festival</p>
    </div>

    <div class="foot">
      <div class="org">ARUK II HUMANITARIAN SERVICES (UK) C.I.C</div>
      <div class="tag">Promoting Cultural Heritage &bull; Empowering Communities &bull; Advancing Humanitarian Initiatives</div>
      <div class="meta">Hawkhill Place, Stanton St John, Oxford. OX33 1HS. United Kingdom &middot; Tel: +44 793 250 6556<br />obonganwan.aruk@yahoo.com &middot; africanqueenssummit@gmail.com &middot; Company Registration No: 17110628</div>
    </div>

    <div class="accept">
      <h3>Acceptance</h3>
      <p>I, <strong id="a-name3">Amb. Hanane Ait-Toudghi</strong>, hereby accept this appointment and agree to carry out the responsibilities outlined above.</p>
      <div class="line">Signature: ________________________________</div>
      <div class="line">Date: ________________________________</div>
    </div>
  </div></div>

  <script>
  (function () {
    var P = new URLSearchParams(location.search);
    function val(k) { return (P.get(k) || '').replace(/_/g, ' ').trim(); }
    var name = val('n') || val('name') || 'Amb. Hanane Ait-Toudghi';
    var title = val('title'), org = val('org'), date = val('date'), sal = val('sal');
    var ids = ['a-name', 'a-name2', 'a-name3'];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).textContent = name;
    if (title) { var t = document.getElementById('a-title'); t.textContent = title; t.style.display = ''; }
    if (org) { var o = document.getElementById('a-org'); o.textContent = org; o.style.display = ''; }
    var addr = val('addr'); if (addr) { var ad = document.getElementById('a-addr'); ad.textContent = addr; ad.style.display = ''; }
    if (date) document.getElementById('a-date').textContent = date;
    if (sal) document.getElementById('a-salute').textContent = sal.replace(/,+$/, '') + ',';
    document.title = 'Letter of Appointment \\u00b7 ' + name;
  })();
  </script>
</body>
</html>
`;
}

// ====================================================================
// INVOICE — an editable invoice on the Aruk II / Summit letterhead covering
// events, Hawkhill accommodation (Queen Aruk II Village gazebos + main
// residence), food, drinks and transport. Amounts fill in live; auto-totals.
// ====================================================================

function invoicePage() {
  const items = [
    ['Summit Events', 'Access to the full programme of engagements, 14&ndash;31 August 2026'],
    ['Accommodation &mdash; Queen Aruk II Village (Gazebos)', 'Gazebo lodging in the grounds of Hawkhill Place. Sleeps four.'],
    ['Accommodation &mdash; Hawkhill Main Residence', 'Rooms within the main residence, Hawkhill Place. Sleeps four.'],
    ['Food &amp; Catering', 'Meals and catering throughout the stay'],
    ['Drinks &amp; Refreshments', 'Beverages and refreshments'],
    ['Transportation', 'Airport transfers and local transport'],
  ];
  const rows = items.map(([d, sub]) => `<tr class="item">
        <td class="desc"><span class="d-main">${d}</span><span class="d-sub">${sub}</span></td>
        <td class="c"><input class="qty" type="number" min="0" step="1" value="1" /></td>
        <td class="c"><span class="cur">&pound;</span><input class="rate" type="number" min="0" step="0.01" placeholder="0.00" /></td>
        <td class="c amtcell"><span class="cur">&pound;</span><span class="amt">0.00</span></td>
      </tr>`).join('\n      ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Invoice · African Queens Summit</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Marcellus&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>
  :root { --emerald:#0d6b4f; --emerald-deep:#094b38; --gold:#d4af37; --gold-deep:#b8860b; --brown:#3c2415; --brown-soft:#5a3a24; --ink:#241a10; --paper:#fdfaf2; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:'Spectral',Georgia,serif; color:var(--ink); line-height:1.5; font-size:15px; background:#6b5636; padding:24px 12px 60px; }
  .print { position:fixed; top:14px; right:14px; z-index:50; font-family:'Marcellus',serif; font-size:13px; letter-spacing:.05em; color:var(--brown); background:linear-gradient(180deg,#f4d97a,var(--gold)); border:1px solid var(--gold-deep); padding:9px 18px; border-radius:999px; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.35); text-decoration:none; }
  .sheet { max-width:840px; margin:0 auto; background:var(--paper); box-shadow:0 20px 60px rgba(0,0,0,.45); border-top:6px solid var(--emerald); }
  .pad { padding:36px clamp(20px,5vw,56px) 44px; }
  .lh { text-align:center; border-bottom:2px solid var(--gold); padding-bottom:16px; }
  .lh .motto { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:600; color:var(--emerald-deep); font-size:16px; margin:0 0 10px; }
  .lh .crest { width:64px; height:64px; object-fit:contain; margin:0 auto 8px; display:block; }
  .lh .org { font-family:'Marcellus',serif; font-weight:700; letter-spacing:.06em; color:var(--brown); font-size:clamp(15px,3.2vw,20px); margin:0 0 5px; }
  .lh .tag { font-family:'Spectral',serif; font-style:italic; color:var(--brown-soft); font-size:12.5px; margin:0 0 5px; }
  .lh .addr { font-family:'Marcellus',serif; font-size:11.5px; letter-spacing:.03em; color:var(--brown-soft); margin:0; }
  .inv-title { text-align:center; font-family:'Cormorant Garamond',serif; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--emerald-deep); font-size:26px; margin:22px 0 4px; }
  .meta { display:flex; flex-wrap:wrap; justify-content:space-between; gap:18px; margin:14px 0 20px; }
  .meta .box { flex:1 1 220px; }
  .meta label { display:block; font-family:'Marcellus',serif; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--emerald-deep); margin-bottom:4px; }
  .fld { width:100%; font-family:'Spectral',serif; font-size:14px; color:var(--ink); border:none; border-bottom:1px solid var(--gold-deep); background:transparent; padding:4px 2px; }
  .billto { min-height:66px; white-space:pre-wrap; border:1px dashed var(--gold-deep); border-radius:8px; padding:8px 10px; font-size:14px; }
  .billto:empty:before { content:attr(data-ph); color:#a99; }
  table { width:100%; border-collapse:collapse; margin-top:6px; }
  thead th { font-family:'Marcellus',serif; font-size:10.5px; letter-spacing:.07em; text-transform:uppercase; color:#fff; background:var(--emerald); padding:9px 10px; text-align:left; }
  thead th.c { text-align:right; width:96px; }
  tbody td { padding:10px; border-bottom:1px solid rgba(184,134,11,.4); vertical-align:top; }
  td.c { text-align:right; white-space:nowrap; }
  .d-main { display:block; font-weight:600; }
  .d-sub { display:block; font-size:12px; color:var(--brown-soft); margin-top:2px; }
  input.qty, input.rate { width:70px; text-align:right; font-family:'Spectral',serif; font-size:14px; border:none; border-bottom:1px solid var(--gold-deep); background:#fff8ec; padding:4px 4px; border-radius:3px; }
  input.qty { width:52px; }
  .cur { color:var(--brown-soft); margin-right:1px; }
  .amtcell { font-weight:600; }
  .totals { margin-top:14px; margin-left:auto; width:min(340px,100%); }
  .totals .row { display:flex; justify-content:space-between; padding:7px 2px; font-size:14.5px; border-bottom:1px solid rgba(184,134,11,.3); }
  .totals .row.grand { border-top:2px solid var(--gold); border-bottom:none; margin-top:4px; padding-top:11px; font-family:'Cormorant Garamond',serif; font-weight:700; font-size:20px; color:var(--emerald-deep); }
  .totals input { width:110px; text-align:right; font-family:'Spectral',serif; font-size:14px; border:none; border-bottom:1px solid var(--gold-deep); background:#fff8ec; padding:3px 4px; border-radius:3px; }
  .bank { margin-top:18px; }
  .bank > label { display:block; font-family:'Marcellus',serif; font-size:9.5px; letter-spacing:.07em; text-transform:uppercase; color:var(--emerald-deep); margin-bottom:5px; }
  .bank-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 16px; border:1px dashed var(--gold-deep); border-radius:7px; padding:8px 12px; max-width:520px; }
  .bk { display:flex; flex-direction:column; }
  .bk.wide { grid-column:1 / -1; }
  .bl { font-size:8px; letter-spacing:.04em; text-transform:uppercase; color:var(--brown-soft); margin-bottom:0; }
  .bkf { border:none; border-bottom:1px solid var(--gold-deep); background:transparent; font-family:'Spectral',serif; font-size:11px; padding:1px 2px; color:var(--ink); }
  .notes { margin-top:22px; }
  .notes label { display:block; font-family:'Marcellus',serif; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--emerald-deep); margin-bottom:5px; }
  .notes .box { min-height:56px; white-space:pre-wrap; border:1px dashed var(--gold-deep); border-radius:8px; padding:8px 10px; font-size:13.5px; color:var(--ink); }
  .notes .box:empty:before { content:attr(data-ph); color:#a99; }
  .foot { margin-top:26px; border-top:2px solid var(--gold); padding-top:12px; text-align:center; }
  .foot .org { font-family:'Marcellus',serif; font-weight:700; letter-spacing:.05em; color:var(--brown); font-size:13px; }
  .foot .tag { font-style:italic; color:var(--brown-soft); font-size:11.5px; margin:4px 0; }
  .foot .meta2 { font-size:11px; color:var(--brown-soft); line-height:1.7; }
  @media print {
    @page { margin:12mm; }
    body { background:#fff; padding:0; }
    .print { display:none !important; }
    .sheet { box-shadow:none; max-width:100%; border-top:none; }
    input, .fld { background:transparent !important; }
    .billto, .notes .box { border-style:solid; }
    .lh, thead th, .foot { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
</style>
</head>
<body>
  <a class="print" href="#" onclick="window.print();return false;">&#128424; Print / Save PDF</a>
  <div class="sheet"><div class="pad">
    <div class="lh">
      <p class="motto">&ldquo;Leadership Rooted in Service, Royalty Defined by Impact.&rdquo;</p>
      <img class="crest" src="/images/summit-emblem.png" alt="Aruk II crest" />
      <p class="org">ARUK II HUMANITARIAN SERVICES (UK) C.I.C</p>
      <p class="tag">Promoting Cultural Heritage &bull; Empowering Communities &bull; Advancing Humanitarian Initiatives</p>
    </div>

    <div class="inv-title">Invoice</div>

    <div class="meta">
      <div class="box">
        <label>Bill To</label>
        <div class="billto" id="billto" contenteditable="true" data-ph="Name / organisation and address&hellip;"></div>
      </div>
      <div class="box" style="max-width:240px;">
        <label>Invoice No.</label>
        <input class="fld" id="inv-no" value="AQS-2026-" />
        <label style="margin-top:12px;">Invoice Date</label>
        <input class="fld" id="inv-date" value="" />
        <label style="margin-top:12px;">Due Date</label>
        <input class="fld" id="inv-due" placeholder="&mdash;" />
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="c">Qty / Nights</th>
          <th class="c">Unit (&pound;)</th>
          <th class="c">Amount (&pound;)</th>
        </tr>
      </thead>
      <tbody>
      ${rows}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>&pound;<span id="subtotal">0.00</span></span></div>
      <div class="row"><span>Deposit / Amount Paid</span><span>&pound;<input id="paid" type="number" min="0" step="0.01" placeholder="0.00" /></span></div>
      <div class="row grand"><span>Balance Due</span><span>&pound;<span id="balance">0.00</span></span></div>
    </div>

    <div class="bank">
      <label>Payment &mdash; Bank Details</label>
      <div class="bank-grid">
        <div class="bk"><span class="bl">Account Name</span><input class="bkf" id="bk-name" /></div>
        <div class="bk"><span class="bl">Bank</span><input class="bkf" id="bk-bank" /></div>
        <div class="bk"><span class="bl">Sort Code</span><input class="bkf" id="bk-sort" /></div>
        <div class="bk"><span class="bl">Account Number</span><input class="bkf" id="bk-acct" /></div>
        <div class="bk"><span class="bl">IBAN</span><input class="bkf" id="bk-iban" /></div>
        <div class="bk"><span class="bl">SWIFT / BIC</span><input class="bkf" id="bk-swift" /></div>
        <div class="bk wide"><span class="bl">Payment Reference</span><input class="bkf" id="bk-ref" /></div>
      </div>
    </div>

    <div class="notes">
      <label>Notes &amp; Payment Terms</label>
      <div class="box" id="notes" contenteditable="true" data-ph="Terms, or any additional notes&hellip;"></div>
    </div>

    <div class="foot">
      <div class="org">ARUK II HUMANITARIAN SERVICES (UK) C.I.C</div>
      <div class="tag">Promoting Cultural Heritage &bull; Empowering Communities &bull; Advancing Humanitarian Initiatives</div>
      <div class="meta2">Hawkhill Place, Stanton St John, Oxford. OX33 1HS. United Kingdom &middot; Tel: +44 793 250 6556<br />obonganwan.aruk@yahoo.com &middot; africanqueenssummit@gmail.com &middot; Company Registration No: 17110628</div>
    </div>
  </div></div>

  <script>
  (function () {
    function money(n) { if (!isFinite(n)) n = 0; return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function num(el) { var v = el ? parseFloat(el.value) : 0; return isFinite(v) ? v : 0; }
    var rows = document.querySelectorAll('tr.item');
    function recalc() {
      var sub = 0;
      for (var i = 0; i < rows.length; i++) {
        var amt = num(rows[i].querySelector('.qty')) * num(rows[i].querySelector('.rate'));
        rows[i].querySelector('.amt').textContent = money(amt);
        sub += amt;
      }
      document.getElementById('subtotal').textContent = money(sub);
      document.getElementById('balance').textContent = money(sub - num(document.getElementById('paid')));
    }
    document.addEventListener('input', function (e) {
      if (e.target && (e.target.classList.contains('qty') || e.target.classList.contains('rate') || e.target.id === 'paid')) recalc();
    });
    // Prefill from an encoded invoice link (?d=), e.g. built by the invoice master page.
    (function () {
      try {
        var raw = new URLSearchParams(location.search).get('d');
        if (!raw) return;
        var d = JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/')))));
        var set = function (id, v) { var el = document.getElementById(id); if (el && v != null) { if (el.tagName === 'INPUT') el.value = v; else el.textContent = v; } };
        set('billto', d.billTo); set('inv-no', d.invNo); set('inv-date', d.date); set('inv-due', d.due); set('notes', d.notes); set('paid', d.paid);
        if (d.bank) { set('bk-name', d.bank.name); set('bk-bank', d.bank.bank); set('bk-sort', d.bank.sort); set('bk-acct', d.bank.acct); set('bk-iban', d.bank.iban); set('bk-swift', d.bank.swift); set('bk-ref', d.bank.ref); }
        if (d.items) for (var i = 0; i < rows.length && i < d.items.length; i++) {
          var it = d.items[i] || {};
          if (it.qty != null) rows[i].querySelector('.qty').value = it.qty;
          if (it.rate != null) rows[i].querySelector('.rate').value = it.rate;
        }
        document.title = 'Invoice ' + (d.invNo || '') + ' \\u2014 African Queens Summit';
      } catch (e) {}
    })();
    recalc();
  })();
  </script>
</body>
</html>
`;
}

// ====================================================================
// INVOICE MASTER PAGE — create numbered invoices, save them (per browser),
// list past ones, and share (each invoice is an encoded link that reopens
// the invoice pre-filled at /invite/invoice/?d=…).
// ====================================================================

function invoiceMasterPage() {
  const labels = [
    'Summit Events',
    'Accommodation &mdash; Queen Aruk II Village (Gazebos) &middot; sleeps four',
    'Accommodation &mdash; Hawkhill Main Residence &middot; sleeps four',
    'Food &amp; Catering',
    'Drinks &amp; Refreshments',
    'Transportation',
  ];
  const itemRows = labels.map((l) => `<div class="irow">
          <span class="ilabel">${l}</span>
          <span class="inp"><label>Qty</label><input class="m-qty" type="number" min="0" step="1" value="1" /></span>
          <span class="inp"><label>Unit &pound;</label><input class="m-rate" type="number" min="0" step="0.01" placeholder="0.00" /></span>
        </div>`).join('\n        ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Invoices · Master Page</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Marcellus&family=Spectral:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root { --emerald:#0d6b4f; --emerald-deep:#094b38; --gold:#d4af37; --gold-deep:#b8860b; --terracotta:#c0532b; --brown:#3c2415; --sand:#f6ecd8; --paper:#fdf9f0; --ink:#2a1c10; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:'Spectral',Georgia,serif; color:var(--ink); background:#2b1810 conic-gradient(from 45deg at 50% 50%, #3c2415, #5a3a24, #3c2415) fixed; }
  .wrap { max-width:960px; margin:0 auto; padding:40px 18px 80px; }
  h1 { font-family:'Cormorant Garamond',serif; color:#fdf6e3; font-size:clamp(28px,6vw,44px); margin:0 0 6px; text-align:center; }
  .sub { text-align:center; color:#e7c89a; font-family:'Marcellus',serif; letter-spacing:.12em; text-transform:uppercase; font-size:12px; margin-bottom:22px; }
  .back { text-align:center; margin-bottom:18px; }
  .back a { color:#e7c89a; font-family:'Marcellus',serif; font-size:12px; letter-spacing:.05em; text-decoration:none; border:1px solid rgba(212,175,55,.4); padding:8px 16px; border-radius:999px; }
  .card { background:var(--paper); border:1px solid var(--gold-deep); border-radius:16px; padding:22px clamp(16px,3vw,28px); margin-bottom:24px; box-shadow:0 16px 40px rgba(0,0,0,.4); }
  .card h2 { font-family:'Cormorant Garamond',serif; color:var(--emerald-deep); font-size:22px; margin:0 0 16px; }
  .two { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .field { margin-bottom:14px; }
  label { display:block; font-family:'Marcellus',serif; font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--emerald-deep); margin-bottom:5px; }
  input, textarea { width:100%; font-family:'Spectral',serif; font-size:15px; padding:9px 11px; border:1px solid #cdbb8e; border-radius:8px; background:#fff; color:var(--ink); }
  textarea { min-height:60px; resize:vertical; }
  .items { margin:6px 0 4px; }
  .irow { display:grid; grid-template-columns:1fr 90px 120px; gap:12px; align-items:end; padding:9px 0; border-bottom:1px dashed rgba(184,134,11,.4); }
  .irow:last-child { border-bottom:none; }
  .ilabel { font-size:14px; color:var(--brown); font-weight:500; padding-bottom:8px; }
  .bankgrid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .bankgrid .wide { grid-column:1 / -1; }
  .inp label { margin-bottom:3px; }
  .inp input { text-align:right; }
  .totrow { display:flex; justify-content:flex-end; align-items:baseline; gap:10px; margin-top:12px; font-family:'Cormorant Garamond',serif; }
  .totrow .tl { font-size:14px; color:var(--emerald-deep); font-family:'Marcellus',serif; letter-spacing:.06em; text-transform:uppercase; }
  .totrow .tv { font-size:26px; font-weight:700; color:var(--emerald-deep); }
  .act { font-family:'Marcellus',serif; font-size:13px; letter-spacing:.04em; text-decoration:none; cursor:pointer; text-align:center; color:var(--brown); background:linear-gradient(180deg,#f4d97a,var(--gold)); border:1px solid var(--gold-deep); padding:10px 16px; border-radius:999px; }
  .act.ghost { background:transparent; color:var(--emerald-deep); border-color:var(--emerald); }
  .act:hover { filter:brightness(1.04); }
  .btns { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
  .out { margin-top:16px; display:none; }
  .link-out { display:flex; gap:8px; margin-bottom:10px; }
  .link-out input { font-family:ui-monospace,Menlo,monospace; font-size:12.5px; background:#fbf5e9; }
  .inv-row { display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:12px 0; border-bottom:1px dashed rgba(184,134,11,.4); }
  .inv-row:last-child { border-bottom:none; }
  .inv-no { font-family:'Marcellus',serif; font-weight:700; color:var(--terracotta); font-size:13px; }
  .inv-bt { flex:1 1 200px; font-family:'Cormorant Garamond',serif; font-size:17px; color:var(--brown); }
  .inv-tot { font-family:'Cormorant Garamond',serif; font-weight:700; color:var(--emerald-deep); font-size:17px; }
  .empty { color:#8a7250; font-style:italic; }
  .hint { font-size:13px; color:#6f5a36; margin-top:12px; }
  code { background:#efe4c7; padding:1px 6px; border-radius:4px; font-size:12px; }
  .toast { position:fixed; bottom:22px; left:50%; transform:translateX(-50%) translateY(20px); background:var(--emerald-deep); color:#fdf6e3; border:1px solid var(--gold); padding:13px 20px; border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,.5); font-family:'Marcellus',serif; font-size:14px; opacity:0; pointer-events:none; transition:opacity .3s ease, transform .3s ease; z-index:99999; }
  .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
  @media (max-width:640px){ .two{grid-template-columns:1fr;} .irow{grid-template-columns:1fr 70px 96px;} }
</style>
</head>
<body>
  <div class="wrap">
    <h1>African Queens Summit &middot; Invoices</h1>
    <div class="sub">Master Page &mdash; Create, Save &amp; Share Invoices</div>
    <div class="back"><a href="/invite/">&#10094; Back to Invitations</a></div>

    <div class="card">
      <h2>Create an invoice</h2>
      <div class="two">
        <div class="field"><label>Bill To</label><textarea id="m-billto" placeholder="Name / organisation and address&#10;(one item per line)"></textarea></div>
        <div>
          <div class="field"><label>Invoice No.</label><input id="m-no" /></div>
          <div class="two">
            <div class="field"><label>Date</label><input id="m-date" placeholder="e.g. 19 July 2026" /></div>
            <div class="field"><label>Due Date</label><input id="m-due" placeholder="&mdash;" /></div>
          </div>
        </div>
      </div>

      <label>Line items</label>
      <div class="items" id="m-items">
        ${itemRows}
      </div>

      <div class="two" style="margin-top:14px;">
        <div class="field"><label>Deposit / Amount Paid (&pound;)</label><input id="m-paid" type="number" min="0" step="0.01" placeholder="0.00" /></div>
        <div class="field"><label>Notes / Payment Terms</label><textarea id="m-notes" placeholder="Terms or notes&hellip;"></textarea></div>
      </div>

      <div class="field"><label>Bank details (optional)</label>
        <div class="bankgrid">
          <input id="m-bk-name" placeholder="Account name" />
          <input id="m-bk-bank" placeholder="Bank" />
          <input id="m-bk-sort" placeholder="Sort code" />
          <input id="m-bk-acct" placeholder="Account number" />
          <input id="m-bk-iban" placeholder="IBAN" />
          <input id="m-bk-swift" placeholder="SWIFT / BIC" />
          <input id="m-bk-ref" class="wide" placeholder="Payment reference" />
        </div>
      </div>

      <div class="totrow"><span class="tl">Total</span><span class="tv">&pound;<span id="m-total">0.00</span></span></div>

      <div class="btns"><button class="act" id="m-create">Create invoice &#10095;</button></div>

      <div class="out" id="m-out">
        <label>Shareable invoice link</label>
        <div class="link-out"><input id="m-link" readonly /><button class="act ghost" id="m-copy">Copy</button></div>
        <div class="btns">
          <a class="act" id="m-open" href="#" target="_blank" rel="noopener">Open invoice &#10095;</a>
          <a class="act ghost" id="m-email" href="#">Email</a>
        </div>
        <p class="hint">Open it to review, then use its <strong>Print / Save PDF</strong> button. The link reopens the invoice pre-filled.</p>
      </div>
    </div>

    <div class="card">
      <h2>Saved invoices</h2>
      <div id="m-list"></div>
      <p class="hint">Saved in this browser only. <code>Delete</code> removes it from the list (the link still works if you kept it).</p>
    </div>
  </div>
  <div class="toast" id="toast"></div>

  <script>
  (function () {
    var SITE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'https://africanqueenssummit.com' : location.origin;
    var KEY = 'aqs-invoices';
    function $(id) { return document.getElementById(id); }
    function money(n) { if (!isFinite(n)) n = 0; return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function b64url(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, ''); }
    function irows() { return document.querySelectorAll('#m-items .irow'); }
    function num(el) { var v = el ? parseFloat(el.value) : 0; return isFinite(v) ? v : 0; }
    function collect() {
      var its = [], rs = irows();
      for (var i = 0; i < rs.length; i++) its.push({ qty: num(rs[i].querySelector('.m-qty')), rate: num(rs[i].querySelector('.m-rate')) });
      return { billTo: $('m-billto').value.trim(), invNo: $('m-no').value.trim(), date: $('m-date').value.trim(), due: $('m-due').value.trim(), paid: num($('m-paid')), notes: $('m-notes').value.trim(), items: its, bank: { name: $('m-bk-name').value.trim(), bank: $('m-bk-bank').value.trim(), sort: $('m-bk-sort').value.trim(), acct: $('m-bk-acct').value.trim(), iban: $('m-bk-iban').value.trim(), swift: $('m-bk-swift').value.trim(), ref: $('m-bk-ref').value.trim() } };
    }
    function totalOf(d) { var s = 0; for (var i = 0; i < d.items.length; i++) s += d.items[i].qty * d.items[i].rate; return s; }
    function liveTotal() { $('m-total').textContent = money(totalOf(collect())); }
    function linkOf(d) { return SITE + '/invite/invoice/?d=' + b64url(d); }
    function loadList() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function saveList(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
    function nextNo() { return 'AQS-2026-' + (100 + loadList().length); }
    var toastEl = $('toast'), tt;
    function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, 2200); }
    function renderList() {
      var a = loadList(), el = $('m-list');
      if (!a.length) { el.innerHTML = '<p class="empty">No invoices saved yet.</p>'; return; }
      el.innerHTML = '';
      a.forEach(function (inv, idx) {
        var row = document.createElement('div'); row.className = 'inv-row';
        var bt = (inv.billTo || '').split('\\n')[0] || '(no bill-to)';
        var n0 = document.createElement('span'); n0.className = 'inv-no'; n0.textContent = inv.invNo || '\\u2014';
        var b1 = document.createElement('span'); b1.className = 'inv-bt'; b1.textContent = bt;
        var t1 = document.createElement('span'); t1.className = 'inv-tot'; t1.textContent = '\\u00a3' + money(inv.total);
        var op = document.createElement('a'); op.className = 'act'; op.textContent = 'Open'; op.href = inv.url; op.target = '_blank'; op.rel = 'noopener';
        var cp = document.createElement('button'); cp.className = 'act ghost'; cp.textContent = 'Copy'; cp.onclick = function () { navigator.clipboard.writeText(inv.url); toast('Link copied'); };
        var dl = document.createElement('button'); dl.className = 'act ghost'; dl.textContent = 'Delete'; dl.onclick = function () { var b = loadList(); b.splice(idx, 1); saveList(b); renderList(); };
        row.appendChild(n0); row.appendChild(b1); row.appendChild(t1); row.appendChild(op); row.appendChild(cp); row.appendChild(dl);
        el.appendChild(row);
      });
    }
    document.addEventListener('input', function (e) { if (e.target && (e.target.classList.contains('m-qty') || e.target.classList.contains('m-rate'))) liveTotal(); });
    $('m-create').addEventListener('click', function () {
      var d = collect();
      if (!d.invNo) { d.invNo = nextNo(); $('m-no').value = d.invNo; }
      var url = linkOf(d), tot = totalOf(d);
      $('m-link').value = url; $('m-open').href = url;
      var subj = encodeURIComponent('Invoice ' + d.invNo + ' \\u2014 African Queens Summit');
      var body = encodeURIComponent('Please find invoice ' + d.invNo + ' (total \\u00a3' + money(tot) + '): ' + url);
      $('m-email').href = 'mailto:?subject=' + subj + '&body=' + body;
      $('m-out').style.display = 'block';
      var a = loadList(); a.unshift({ invNo: d.invNo, billTo: d.billTo, date: d.date, total: tot, url: url }); saveList(a); renderList();
      toast('Invoice ' + d.invNo + ' created');
    });
    $('m-copy').addEventListener('click', function () { $('m-link').select(); navigator.clipboard.writeText($('m-link').value); toast('Link copied'); });
    $('m-no').value = nextNo();
    renderList(); liveTotal();
  })();
  </script>
</body>
</html>
`;
}

// ====================================================================
// VIEWER — a single page that renders an invitation from URL query params
// (?name=…&title=…&type=…). No personal data is stored on the site; the
// recipient's details live only in the link. Reuses the heritage styling.
// ====================================================================

function viewerPage(css, lettersHtmlMap, progRowsHtml) {
  const lettersJson = JSON.stringify(lettersHtmlMap).split('<').join('\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>A Royal Invitation · African Queens Summit 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Marcellus&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>${css}</style>
</head>
<body>
  <a class="pill" href="/rsvp/" aria-label="RSVP and reserve your place">
    <span class="pill-main">RSVP &amp; Reserve &#10095;</span>
    <span class="pill-sub">14&ndash;31 August 2026</span>
  </a>

  <div class="frame">
    <div class="kente-band tall"></div>
    <header class="hero">
      <div class="hero-inner">
        <div class="medallion"><span class="rays" aria-hidden="true"></span><img class="emblem" src="/images/summit-emblem.png" alt="Summit emblem" /></div>
        <p class="eyebrow fade fd1">By Royal Invitation</p>
        <h1 class="title fade fd2">African Global Queens Summit</h1>
        <p class="subtitle fade fd3">United Kingdom &middot; 14&ndash;31 August 2026</p>
        <div class="glyph-row fade fd4"><span>&#10022;</span><span>&#9670;</span><span>&#10022;</span><span>&#9670;</span></div>
      </div>
    </header>
    <div class="kente-band"></div>

    <div class="ribbon-wrap">
      <div class="ribbon fade fd5">
        <span class="ribbon-label">A Personal Invitation To</span>
        <span class="ribbon-honorific" id="v-honorific" style="display:none"></span>
        <span class="ribbon-name" id="v-name">Your Majesty</span>
        <span class="ribbon-kingdom" id="v-title" style="display:none"></span>
      </div>
    </div>

    <section class="content">
      <p class="salutation" id="v-salute">Your Majesty,</p>
      <div class="body" id="v-letter"></div>
    </section>

    <div class="mud-divider"></div>
    <section class="programme">
      <h2>Programme Highlights</h2>
      <div class="prog-list">
          ${progRowsHtml}
      </div>
    </section>

    <div class="kente-band"></div>
    <section class="signoff">
      <p class="regard">With Highest Royal Regard,</p>
      <img class="sig-img" src="/images/queen-aruk-signature.png" alt="Signature of Queen Aruk II" />
      <p class="name">Obonganwan Marie Erete, Queen Aruk II</p>
      <p class="role">Summit Convener &middot; African and Diaspora Queens Summit</p>
      <p class="motto">Leadership Rooted in Service, Royalty Defined by Impact.</p>
    </section>

    <section class="rsvp">
      <h2>The Honour of Your Reply Is Requested</h2>
      <a class="btn" href="/rsvp/">RSVP &amp; Reserve Your Place</a>
      <p class="alt">or confirm on <a id="v-wa" href="/rsvp/" target="_blank" rel="noopener">WhatsApp</a> &middot; email <a href="mailto:africanqueenssummit@gmail.com">africanqueenssummit@gmail.com</a></p>
    </section>

    <footer class="footer">
      <div class="kente-band tall"></div>
      <div class="footer-pad">
        <div class="partners-row">
          <div class="letterhead-box"><img src="/images/partners-letterhead.png" alt="Partners and letterhead" /></div>
          <img class="partner-logo" src="/images/foundation-african-royals.jpg" alt="Foundation of African Royals" />
        </div>
        <p class="org">ARUK II Humanitarian Services (UK) C.I.C</p>
        <p>Hawkhill Place, Stanton St John, Oxford, OX33 1HS, United Kingdom &middot; Tel: +44 793 250 6556</p>
        <p><a href="mailto:obonganwan.aruk@yahoo.com">obonganwan.aruk@yahoo.com</a> &middot; <a href="mailto:africanqueenssummit@gmail.com">africanqueenssummit@gmail.com</a> &middot; Company Reg. No. 17110628</p>
      </div>
    </footer>
  </div>

  <script>
  (function () {
    var P = new URLSearchParams(location.search);
    var nU = P.get('n'); var nFull = P.get('name');
    var hasName = !!(nU || nFull);
    var name = (nU ? nU.replace(/_/g, ' ') : (nFull || 'Your Majesty')).trim().replace(/\\s+/g, ' ').replace(/[,\\s]+$/, '');
    var title = (P.get('e') || P.get('epithet') || P.get('title') || '').replace(/_/g, ' ').trim();
    var hOverride = (P.get('h') || P.get('honorific') || '').replace(/_/g, ' ').trim();
    var TYPE_MAP = { q: 'queens', k: 'kings', mo: 'morocco', pr: 'princesses', po: 'politicians', g: 'guests', ex: 'excellency' };
    var rawType = (P.get('t') || P.get('type') || P.get('a') || 'q').trim().toLowerCase();
    var type = TYPE_MAP[rawType] || rawType || 'queens';
    // The Morocco Government letter has no individual addressee — default the ribbon to "Your Excellencies".
    if (!hasName && type === 'morocco') name = 'Your Excellencies';
    var SAL = { queens: 'Your Majesty', kings: 'Your Majesty', morocco: 'Your Excellencies', politicians: 'Your Excellency', guests: '', princesses: 'Your Highness', excellency: 'Your Excellency' };
    var LETTERS = ${lettersJson};
    var sal = SAL.hasOwnProperty(type) ? SAL[type] : 'Your Majesty';
    document.getElementById('v-name').textContent = name;
    var hEl = document.getElementById('v-honorific');
    var honorificDisplay = hOverride ? (hOverride.toLowerCase() === 'none' ? '' : hOverride) : sal;
    if (honorificDisplay) { hEl.textContent = honorificDisplay; hEl.style.display = ''; }
    var tEl = document.getElementById('v-title');
    if (title) { tEl.textContent = title; tEl.style.display = ''; }
    document.getElementById('v-salute').textContent = sal ? (sal + ',') : ('Dear ' + name + ',');
    // The Morocco letter carries its own inside address and "Your Excellencies," salutation.
    if (type === 'morocco') { var _sv = document.getElementById('v-salute'); if (_sv) _sv.style.display = 'none'; }
    document.getElementById('v-letter').innerHTML = LETTERS[type] || LETTERS.queens || '';
    // Optional: drop the letter body (hero + recipient + programme + signature only).
    // ?letter=0 (or ?nl=1 / ?nobody=1) removes the whole letter section.
    var noLetter = /^(0|no|off|false|hide|none)$/i.test(P.get('letter') || '') || /^(1|yes|on|true)$/i.test((P.get('nl') || P.get('nobody') || ''));
    if (noLetter) {
      var _c = document.querySelector('.content'); if (_c && _c.parentNode) _c.parentNode.removeChild(_c);
      // Blank stationery: add the official letterhead at the top (below the hero)
      // and drop the recipient ribbon entirely (no honorific, no name).
      var _rw = document.querySelector('.ribbon-wrap');
      if (_rw && _rw.parentNode) {
        var _lh = document.createElement('div');
        _lh.style.cssText = 'text-align:center;background:var(--sand);padding:24px 22px 6px;';
        _lh.innerHTML = '<div style="background:#fff;display:inline-flex;align-items:center;justify-content:center;padding:12px 20px;border-radius:12px;border:1px solid var(--gold);box-shadow:0 8px 22px rgba(0,0,0,0.16);"><img src="/images/partners-letterhead.png" alt="African Global Queens Summit letterhead" style="height:92px;width:auto;max-width:74vw;display:block;" /></div>';
        _rw.parentNode.insertBefore(_lh, _rw);
        _rw.parentNode.removeChild(_rw);
      }
    }
    document.title = 'A Royal Invitation \\u00b7 ' + name;
    var openers = { queens: 'Your Majesty, this is ' + name + ' \\uD83D\\uDC51', kings: 'Your Majesty, this is ' + name + ' \\uD83D\\uDC51', morocco: 'Your Majesty, this is ' + name + ' \\uD83D\\uDC51', politicians: 'Your Excellency, this is ' + name, guests: 'Hello, this is ' + name, princesses: 'Your Highness, this is ' + name + ' \\uD83D\\uDC51', excellency: 'Your Excellency, this is ' + name };
    var opener = openers[type] || openers.queens;
    var waMsg = opener + ' \\u2014 I am honoured to accept your gracious invitation and confirm my attendance at the African Queens Summit (14\\u201331 August 2026, London \\u0026 Oxford).';
    document.getElementById('v-wa').href = 'https://wa.me/447932506556?text=' + encodeURIComponent(waMsg);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      var sel = '.content p:not(.salutation), .content h2, .content ul, .programme h2, .prog-row, .signoff > *, .footer-pad > *';
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) { el.classList.add('sr'); });
      var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { io.observe(el); });
    }
  })();
  </script>
</body>
</html>
`;
}

// ====================================================================
// BUILD
// ====================================================================

if (existsSync(outRoot)) rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

const files = readdirSync(inviteesDir).filter((f) => f.endsWith('.md'));
const built = [];

for (const f of files) {
  const { data, body } = parse(join(inviteesDir, f));
  const slug = data.slug || f.replace(/\.md$/, '');
  const audience = data.audience || 'queens';
  const template = TEMPLATES[data.template] ? data.template : 'heritage';
  const { note, letter } = splitBody(body);
  const letterHtml = letter ? md(letter) : getLetter(audience);
  const noteHtml = note ? inline(note.split('\n\n')[0]) : '';
  data.custom = !!letter;
  const html = TEMPLATES[template]({ data, noteHtml, letterHtml });
  const dir = join(outRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  built.push({ slug, name: data.name || slug, template, audience });
  console.log(`  ✓ /invite/${slug}/  —  ${data.name || slug}  [${audience} · ${template}]`);
}

const rawLetters = {};
for (const a of ['queens', 'kings', 'morocco', 'politicians', 'guests', 'princesses', 'excellency']) {
  const p = join(root, 'content', 'letters', `${a}.md`);
  if (existsSync(p)) rawLetters[a] = readFileSync(p, 'utf8');
}

// Durable "invited" store: content/data/invited.json, merged with the
// WhatsApp tool's sent log (tools/whatsapp/sent.json) so a tool-send also
// shows as invited on the master page.
let invitedStore = {};
const invitedPath = join(root, 'content', 'data', 'invited.json');
if (existsSync(invitedPath)) { try { invitedStore = JSON.parse(readFileSync(invitedPath, 'utf8')); } catch (e) { invitedStore = {}; } }
const sentLogPath = join(root, 'tools', 'whatsapp', 'sent.json');
if (existsSync(sentLogPath)) {
  try {
    const sl = JSON.parse(readFileSync(sentLogPath, 'utf8'));
    const arr = Array.isArray(sl) ? sl : (sl.sent || []);
    for (const e of arr) { if (e && e.slug && !invitedStore[e.slug]) invitedStore[e.slug] = { invited: true, at: e.sentAt || null }; }
  } catch (e) {}
}

writeFileSync(join(outRoot, 'index.html'), masterPage(built, Object.keys(TEMPLATES), rawLetters, invitedStore));

// Query-param viewer at /invite/card/ — reuse the heritage CSS, bake the
// shared per-audience letters (not personal data), render name/title/type
// from the URL on the client.
const sampleHtml = heritage({ data: { name: 'Sample', audience: 'queens' }, noteHtml: '', letterHtml: '' });
const HERITAGE_CSS = (sampleHtml.match(/<style>([\s\S]*?)<\/style>/) || [null, ''])[1];
const lettersHtmlMap = {};
for (const a of ['queens', 'kings', 'morocco', 'politicians', 'guests', 'princesses', 'excellency']) lettersHtmlMap[a] = getLetter(a);
const progRowsHtml = programme
  .map(([d, t, ic], i) =>
    `<div class="prog-row${i === programme.length - 1 ? ' finale' : ''}"><span class="prog-ico" aria-hidden="true">${ic}</span><span class="when">${esc(d)}</span><span class="what">${esc(t)}</span></div>`)
  .join('\n          ');
mkdirSync(join(outRoot, 'card'), { recursive: true });
writeFileSync(join(outRoot, 'card', 'index.html'), viewerPage(HERITAGE_CSS, lettersHtmlMap, progRowsHtml));
console.log('  ✓ /invite/card/  —  query-param viewer (name/title/type)');

mkdirSync(join(outRoot, 'morocco'), { recursive: true });
writeFileSync(join(outRoot, 'morocco', 'index.html'), moroccoMasterPage());
console.log('  ✓ /invite/morocco/  —  Kingdom of Morocco letter master page');

mkdirSync(join(outRoot, 'appointment'), { recursive: true });
writeFileSync(join(outRoot, 'appointment', 'index.html'), appointmentPage());
console.log('  ✓ /invite/appointment/  —  Consultant appointment letter (Aruk II HS letterhead)');

mkdirSync(join(outRoot, 'invoice'), { recursive: true });
writeFileSync(join(outRoot, 'invoice', 'index.html'), invoicePage());
console.log('  ✓ /invite/invoice/  —  Summit invoice (Aruk II HS letterhead)');

mkdirSync(join(outRoot, 'invoices'), { recursive: true });
writeFileSync(join(outRoot, 'invoices', 'index.html'), invoiceMasterPage());
console.log('  ✓ /invite/invoices/  —  invoice master page (create/save/list/share)');

console.log(`\nBuilt ${built.length} invitation(s) + master page → public/invite/`);
