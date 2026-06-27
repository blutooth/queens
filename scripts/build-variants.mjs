// Generates 5 design variants of one invitation for side-by-side comparison.
// Output: public/invite/_compare/<id>.html   (run `node scripts/build-variants.mjs`)
// Throwaway / comparison only — not part of the deploy build.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = join(root, 'public', 'invite', '_compare');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

function md(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = []; let para = []; let list = null;
  const fp = () => { if (para.length) { out.push(`<p>${inline(para.join(' ').trim())}</p>`); para = []; } };
  const cl = () => { if (list) { out.push('</ul>'); list = null; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim() === '---') { fp(); cl(); continue; }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { fp(); cl(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) { fp(); if (!list) { out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(li[1])}</li>`); continue; }
    cl(); para.push(line.trim());
  }
  fp(); cl(); return out.join('\n');
}

const programme = [
  ['14–15 Aug', 'Royal Arrival & Protocol Reception'],
  ['16 Aug', 'Opening of the Summit'],
  ['17–18 Aug', 'Oxford University Leadership Course & Seminar'],
  ['19 Aug', 'Visit to Blenheim Palace'],
  ['20 Aug', 'Courtesy visit to the Lord Mayor of Oxford · Art Exhibition'],
  ['21 Aug', 'Bicester Designer Village'],
  ['22 Aug', "Day of Rest · Queen's Strategic Roundtables (closed-door)"],
  ['23 Aug', 'Gala Night — Fashion, Art & Entertainment · Porchester Hall'],
  ['24 Aug', 'London bus tour — Big Ben, London Eye'],
  ['25 Aug', 'Buckingham State Rooms & Royal Mews'],
  ['26 Aug', 'Kew Gardens'],
  ['27 Aug', "St Paul's Cathedral & Tower of London"],
  ['28 Aug', 'Westminster Abbey'],
  ['29–30 Aug', 'Free'],
  ['31 Aug', 'Notting Hill Carnival — End of Summit'],
];

// ---- content ----
const letterHtml = md(readFileSync(join(root, 'content', 'letter.md'), 'utf8'));
const name = 'HRM Queen Naano Dumaaley';
const salutation = 'Your Majesty';
const dateLine = '1st June 2026';
const noteHtml = 'It would be a profound honour to welcome you among the sovereign matriarchs gathered in England this August.';
const progRows = programme
  .map(([d, t]) => `<tr><td class="d">${esc(d)}</td><td class="t">${esc(t)}</td></tr>`)
  .join('\n              ');

// ---- base structural CSS (theme-agnostic, driven by vars) ----
const BASE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--font-sans);line-height:1.6;-webkit-font-smoothing:antialiased;color:var(--ink);position:relative;background:var(--page-solid);background-image:var(--page-bg);background-attachment:fixed;padding:2.4rem 1rem 3.4rem}
  body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:radial-gradient(var(--dot-color) 1px,transparent 1.4px),radial-gradient(var(--dot-color) 1px,transparent 1.4px);background-size:26px 26px,26px 26px;background-position:0 0,13px 13px}
  body::after{content:'';position:fixed;left:50%;top:-12%;transform:translateX(-50%);width:120vw;height:70vh;z-index:0;pointer-events:none;background:radial-gradient(ellipse at center,var(--glow-color),transparent 62%);animation:glow 9s ease-in-out infinite alternate}
  @keyframes glow{from{opacity:.5}to{opacity:1}}
  img{max-width:100%;display:block}
  a{color:inherit}
  .badge-id{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:5;background:rgba(0,0,0,.7);color:#f3e6c0;font-family:var(--font-sans);font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;padding:.35rem .9rem;border-radius:999px;border:1px solid rgba(199,154,51,.5)}
  .card{max-width:680px;margin:0 auto;position:relative;z-index:1;background:var(--card-bg);border-radius:14px;overflow:hidden;box-shadow:0 26px 70px rgba(0,0,0,.5),0 0 0 1px var(--ring);animation:cardIn 1s cubic-bezier(.2,.7,.2,1) both}
  @keyframes cardIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .rule-top,.rule-bottom{height:7px;background:linear-gradient(90deg,var(--gold-deep),var(--gold-bright),var(--gold-deep),var(--gold-bright),var(--gold-deep));background-size:200% 100%;animation:shimmer 7s linear infinite}
  @keyframes shimmer{to{background-position:-200% 0}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes emblemIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  @keyframes nameIn{from{opacity:0;transform:translateY(16px);letter-spacing:.2em;filter:blur(5px)}to{opacity:1;transform:translateY(0);letter-spacing:normal;filter:blur(0)}}
  .hero{text-align:center;padding:3.2rem 2rem 2.4rem;position:relative;overflow:hidden;color:var(--hero-text);background:var(--hero-bg)}
  .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top,var(--hero-glow),transparent 60%);pointer-events:none}
  .emblem{width:174px;margin:0 auto 1.4rem;position:relative;filter:drop-shadow(0 10px 30px rgba(0,0,0,.45));animation:emblemIn 1.1s .15s cubic-bezier(.2,.7,.2,1) both}
  .eyebrow{text-transform:uppercase;letter-spacing:.34em;font-size:.72rem;color:var(--eyebrow);font-weight:600;margin-bottom:.9rem;animation:fadeUp .9s .45s ease both}
  .hero h1{font-family:var(--font-display);font-weight:600;font-size:clamp(2.2rem,5.8vw,3.2rem);line-height:1.04;color:var(--hero-title);margin-bottom:.9rem;text-shadow:var(--hero-title-shadow);animation:fadeUp 1s .6s ease both}
  .hero h1 em{font-style:italic;color:var(--gold-bright);font-weight:600}
  .dates{display:inline-block;padding:.5rem 1.25rem;border:1px solid var(--gold-deep);border-radius:999px;font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;color:var(--dates-text);font-weight:700;background:var(--dates-bg);animation:fadeUp 1s .75s ease both}
  .ribbon{background:var(--band-bg);color:var(--band-text);text-align:center;padding:1.7rem 1.5rem;border-top:var(--band-border);border-bottom:var(--band-border)}
  .ribbon .to{font-size:.66rem;letter-spacing:.34em;text-transform:uppercase;color:var(--band-label);margin-bottom:.5rem;font-weight:600}
  .ribbon .name{font-family:var(--font-display);font-style:italic;font-weight:600;font-size:clamp(1.7rem,4.8vw,2.3rem);color:var(--band-name);text-shadow:0 2px 14px rgba(0,0,0,.35);animation:nameIn 1.2s .95s cubic-bezier(.2,.7,.2,1) both}
  .letter{padding:2.9rem 2.5rem 2.2rem;background:var(--letter-bg);position:relative}
  .letter::before{content:'';position:absolute;inset:.7rem;border:1px solid var(--frame);border-radius:6px;pointer-events:none}
  .letter>*{position:relative}
  .meta{font-family:var(--font-serif);font-style:italic;font-size:.98rem;color:var(--muted);margin-bottom:1.4rem}
  .salute{font-family:var(--font-serif);font-weight:600;font-size:1.4rem;margin-bottom:1.1rem;color:var(--ink)}
  .salute strong{color:var(--accent);font-weight:600}
  .note{font-family:var(--font-serif);font-style:italic;font-weight:500;font-size:1.26rem;color:var(--note-text);background:var(--note-bg);border-left:4px solid var(--accent);padding:1rem 1.2rem;border-radius:0 8px 8px 0;margin:0 0 2rem}
  .body h2{font-family:var(--font-display);font-weight:600;font-size:1.6rem;color:var(--heading);margin:2.3rem 0 .85rem;padding-bottom:.45rem;border-bottom:2px solid;border-image:linear-gradient(90deg,var(--gold),var(--gold-bright),transparent) 1}
  .body p{font-family:var(--font-serif);font-weight:500;margin:0 0 1.05rem;font-size:1.24rem;line-height:1.72;color:var(--ink)}
  .body p strong{font-weight:700;color:var(--strong)}
  .body ul{list-style:none;margin:0 0 1.2rem}
  .body li{font-family:var(--font-serif);font-weight:500;position:relative;padding:.36rem 0 .36rem 1.7rem;font-size:1.18rem;color:var(--ink)}
  .body li::before{content:'❖';position:absolute;left:0;color:var(--accent);font-size:.85rem;top:.62rem}
  .prog{margin:2.6rem 0 1rem;border:1px solid var(--prog-line);border-radius:10px;overflow:hidden;background:var(--prog-surface)}
  .prog h2{font-family:var(--font-display);font-weight:600;font-size:1.45rem;color:var(--prog-head-text);margin:0;padding:.85rem 1.2rem;background:var(--prog-head-bg);border-bottom:2px solid var(--gold)}
  .prog table{width:100%;border-collapse:collapse}
  .prog td{padding:.55rem 1.2rem;border-bottom:1px solid var(--prog-line);vertical-align:top}
  .prog tr:last-child td{border-bottom:none}
  .prog tr:nth-child(even) td{background:var(--prog-zebra)}
  .prog .d{font-weight:700;color:var(--prog-day);white-space:nowrap;width:96px;font-size:.86rem}
  .prog .t{font-family:var(--font-serif);font-weight:500;color:var(--prog-text);font-size:1.12rem}
  .sign{margin-top:2.3rem;text-align:center}
  .sign .regard{font-family:var(--font-serif);font-weight:500;font-size:1.18rem;color:var(--sign-text);margin-bottom:.4rem}
  .sign .slip{display:inline-block;background:var(--slip-bg);padding:var(--slip-pad);border-radius:6px;box-shadow:var(--slip-shadow)}
  .sign .slip img{width:152px;mix-blend-mode:var(--sign-blend)}
  .sign .who{font-family:var(--font-display);font-weight:700;font-size:1.3rem;color:var(--sign-who);margin-top:.6rem}
  .sign .role{font-size:.84rem;color:var(--muted);margin-top:.25rem;font-weight:500}
  .sign .motto{font-style:italic;color:var(--sign-motto);font-size:.98rem;margin-top:.85rem;font-family:var(--font-display);font-weight:500}
  .attach{margin:2.3rem 2.5rem 0;background:var(--note-bg);border:1px solid var(--prog-line);border-radius:10px;padding:1rem 1.2rem;display:flex;gap:.9rem;align-items:center}
  .attach .ico{font-size:1.7rem}
  .attach .t1{font-family:var(--font-display);font-weight:700;color:var(--heading);font-size:1.1rem}
  .attach .t2{font-family:var(--font-serif);font-weight:500;font-size:1rem;color:var(--ink-soft);margin-top:.15rem}
  .cta{text-align:center;padding:2.7rem 2rem 2.9rem;background:var(--cta-bg);border-top:1px solid var(--prog-line)}
  .cta h2{font-family:var(--font-display);font-weight:700;font-size:2.1rem;color:var(--cta-h);margin-bottom:.6rem}
  .cta p{font-family:var(--font-serif);font-weight:500;color:var(--cta-p);margin-bottom:1.5rem;font-size:1.16rem}
  .btn{display:inline-block;padding:1rem 2.4rem;border-radius:999px;background:var(--btn-bg);color:var(--btn-text);font-weight:600;font-size:.96rem;letter-spacing:.03em;border:1px solid var(--btn-border);transition:transform .2s,box-shadow .2s}
  .btn:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(0,0,0,.25)}
  .rsvp-mail{font-family:var(--font-serif);font-weight:500;display:block;margin-top:1rem;font-size:.98rem;color:var(--muted)}
  .rsvp-mail a{color:var(--accent);text-decoration:underline}
  .foot{background:var(--foot-bg);text-align:center;padding:2rem 1.5rem 2.2rem;color:var(--foot-text);border-top:1px solid var(--ring)}
  .foot .partners{max-width:520px;margin:0 auto 1.2rem;border-radius:8px;background:#fff;padding:.4rem}
  .foot .f-org{font-size:.86rem;letter-spacing:.04em;color:var(--gold-bright);font-weight:600}
  .foot .f-meta{font-size:.72rem;color:var(--foot-meta);margin-top:.45rem;line-height:1.8}
  @media(prefers-reduced-motion:reduce){*{animation:none!important}}
  @media(max-width:560px){body{padding:1.2rem .6rem 2rem}.letter{padding:2.2rem 1.5rem 1.7rem}.attach{margin:1.8rem 1.5rem 0}.emblem{width:144px}}
`;

// Defaults (Theme 1 — parchment). Themes below override selectively.
const DEFAULTS = `
  --font-display:'EB Garamond','Cormorant Garamond',Garamond,Georgia,serif;
  --font-serif:'EB Garamond','Cormorant Garamond',Garamond,Georgia,serif;
  --font-sans:'Inter',system-ui,sans-serif;
  --page-solid:#0c2417; --page-bg:linear-gradient(155deg,#0c2417 0%,#14361f 38%,#2c1a0a 100%);
  --dot-color:rgba(227,194,103,.06); --glow-color:rgba(184,138,42,.2);
  --gold:#b88a2a; --gold-bright:#e3c267; --gold-deep:#7c5d18;
  --card-bg:#f8f1dc; --ring:rgba(184,138,42,.4);
  --ink:#2a2110; --ink-soft:#473a23; --muted:#8a7550;
  --accent:#bb4a23; --strong:#1c3a26; --heading:#1c3a26;
  --hero-bg:linear-gradient(165deg,#163a21 0%,#16331b 52%,#34220e 100%); --hero-text:#fdf6e3; --hero-title:#fdf6e3; --hero-title-shadow:0 2px 22px rgba(184,138,42,.45); --hero-glow:rgba(227,194,103,.32); --eyebrow:#e3c267;
  --dates-text:#2a1c06; --dates-bg:linear-gradient(180deg,#e3c267,#b88a2a);
  --band-bg:linear-gradient(180deg,#7a4a1e,#3d2410); --band-text:#fdf6e3; --band-label:#e3c267; --band-name:#fdf6e3; --band-border:2px solid #b88a2a;
  --letter-bg:linear-gradient(180deg,#f8f1dc,#f1e6c8); --frame:rgba(184,138,42,.28);
  --note-bg:rgba(184,138,42,.12); --note-text:#1c3a26;
  --prog-surface:rgba(255,255,255,.4); --prog-line:#e7d8ad; --prog-zebra:rgba(184,138,42,.07); --prog-day:#bb4a23; --prog-text:#473a23;
  --prog-head-bg:linear-gradient(180deg,#2c5639,#1c3a26); --prog-head-text:#fdf6e3;
  --sign-text:#473a23; --sign-who:#1c3a26; --sign-motto:#7c5d18; --sign-blend:multiply; --slip-bg:transparent; --slip-pad:0; --slip-shadow:none;
  --cta-bg:linear-gradient(180deg,#f1e6c8,#f8f1dc); --cta-h:#bb4a23; --cta-p:#473a23;
  --btn-bg:linear-gradient(180deg,#2c5639,#1c3a26); --btn-text:#e3c267; --btn-border:#b88a2a;
  --foot-bg:linear-gradient(180deg,#34220e,#14361f); --foot-text:#fdf6e3; --foot-meta:rgba(253,246,227,.6);
`;

const THEMES = [
  {
    id: '1-parchment',
    label: 'V1 · Parchment & Emerald Frame',
    vars: ``, // uses defaults
  },
  {
    id: '2-ivory-editorial',
    label: 'V2 · Ivory Editorial (light & airy)',
    vars: `
      --page-solid:#e9e2d0; --page-bg:linear-gradient(160deg,#efe9da,#e4dcc6);
      --dot-color:rgba(160,120,40,.05); --glow-color:rgba(187,74,35,.08);
      --card-bg:#fffdf7; --ring:rgba(160,120,40,.22);
      --ink:#2b2620; --ink-soft:#4a4338; --muted:#9a8c74;
      --accent:#bb4a23; --strong:#1c3a26; --heading:#1c3a26;
      --gold:#b88a2a; --gold-bright:#cda94f; --gold-deep:#9c7a2a;
      --hero-bg:#fffdf7; --hero-text:#2b2620; --hero-title:#1c3a26; --hero-title-shadow:none; --hero-glow:rgba(187,74,35,.1); --eyebrow:#bb4a23;
      --dates-text:#2b2620; --dates-bg:transparent;
      --band-bg:#fffdf7; --band-text:#1c3a26; --band-label:#bb4a23; --band-name:#1c3a26; --band-border:1px solid rgba(160,120,40,.3);
      --letter-bg:#fffdf7; --frame:transparent;
      --note-bg:rgba(187,74,35,.07); --note-text:#5a3618;
      --prog-surface:#fbf7ec; --prog-line:#e8dec6; --prog-zebra:rgba(160,120,40,.05); --prog-day:#bb4a23; --prog-text:#4a4338;
      --prog-head-bg:#1c3a26; --prog-head-text:#fffdf7;
      --sign-who:#1c3a26; --sign-motto:#9c7a2a;
      --cta-bg:#f6f0e2; --cta-h:#bb4a23; --cta-p:#4a4338;
      --btn-bg:#bb4a23; --btn-text:#fffdf7; --btn-border:#9c3d1c;
      --foot-bg:#1c3a26; --foot-text:#f1e8cf; --foot-meta:rgba(241,232,207,.6);
    `,
  },
  {
    id: '3-midnight-gold',
    label: 'V3 · Midnight Gold (opulent dark)',
    vars: `
      --page-solid:#08080a; --page-bg:linear-gradient(160deg,#0c0c10,#15110a 60%,#0a0a0c);
      --dot-color:rgba(227,194,103,.07); --glow-color:rgba(199,154,51,.22);
      --card-bg:linear-gradient(170deg,#17151b,#100e12); --ring:rgba(199,154,51,.45);
      --ink:#efe6cf; --ink-soft:rgba(239,230,207,.82); --muted:rgba(239,230,207,.55);
      --accent:#e3c267; --strong:#e3c267; --heading:#e3c267;
      --gold:#c79a33; --gold-bright:#f0d680; --gold-deep:#8a6a1f;
      --hero-bg:linear-gradient(165deg,#15131a,#1a1408 70%,#0c0c0f); --hero-text:#efe6cf; --hero-title:#f3ead0; --hero-title-shadow:0 2px 26px rgba(199,154,51,.5); --hero-glow:rgba(227,194,103,.3); --eyebrow:#e3c267;
      --dates-text:#1a1408; --dates-bg:linear-gradient(180deg,#f0d680,#c79a33);
      --band-bg:linear-gradient(180deg,#1f1a0d,#0f0d09); --band-text:#f3ead0; --band-label:#e3c267; --band-name:#f3ead0; --band-border:2px solid #c79a33;
      --letter-bg:linear-gradient(180deg,#17151b,#100e12); --frame:rgba(199,154,51,.3);
      --note-bg:rgba(199,154,51,.1); --note-text:#efe6cf;
      --prog-surface:rgba(0,0,0,.3); --prog-line:rgba(199,154,51,.18); --prog-zebra:rgba(255,255,255,.03); --prog-day:#f0d680; --prog-text:rgba(239,230,207,.82);
      --prog-head-bg:linear-gradient(180deg,#1f1a0d,#0f0d09); --prog-head-text:#f3ead0;
      --sign-text:#efe6cf; --sign-who:#e3c267; --sign-motto:#c79a33; --sign-blend:multiply; --slip-bg:#f3ead0; --slip-pad:.5rem 1.4rem; --slip-shadow:0 6px 18px rgba(0,0,0,.5);
      --cta-bg:linear-gradient(180deg,#15110a,#100e12); --cta-h:#e3c267; --cta-p:rgba(239,230,207,.82);
      --btn-bg:linear-gradient(180deg,#f0d680,#c79a33); --btn-text:#1a1408; --btn-border:#8a6a1f;
      --foot-bg:#0a0a0c; --foot-text:#efe6cf; --foot-meta:rgba(239,230,207,.5);
    `,
  },
  {
    id: '4-terracotta-heritage',
    label: 'V4 · Sand & Terracotta Heritage',
    vars: `
      --page-solid:#7a2f17; --page-bg:linear-gradient(155deg,#8a3a1c,#5a2410 55%,#3a1c0c);
      --dot-color:rgba(243,230,192,.06); --glow-color:rgba(216,100,47,.22);
      --card-bg:#fbf3e0; --ring:rgba(187,74,35,.4);
      --ink:#3a2415; --ink-soft:#5a4028; --muted:#9a7b5a;
      --accent:#c14a22; --strong:#1f4a32; --heading:#c14a22;
      --gold:#cf9b3a; --gold-bright:#f0cf78; --gold-deep:#a06a1f;
      --hero-bg:linear-gradient(165deg,#1f4a32 0%,#7a3318 60%,#c14a22 100%); --hero-text:#fdf4e2; --hero-title:#fdf4e2; --hero-title-shadow:0 2px 22px rgba(0,0,0,.4); --hero-glow:rgba(236,200,110,.34); --eyebrow:#f4d58a;
      --dates-text:#3a1c0c; --dates-bg:linear-gradient(180deg,#f0cf78,#cf9b3a);
      --band-bg:linear-gradient(180deg,#1f4a32,#15321f); --band-text:#fdf4e2; --band-label:#f4d58a; --band-name:#fdf4e2; --band-border:3px solid #cf9b3a;
      --letter-bg:linear-gradient(180deg,#fbf3e0,#f5e9cf); --frame:rgba(193,74,34,.3);
      --note-bg:rgba(31,74,50,.1); --note-text:#1f4a32;
      --prog-surface:rgba(255,255,255,.45); --prog-line:#ecdcb8; --prog-zebra:rgba(193,74,34,.06); --prog-day:#c14a22; --prog-text:#5a4028;
      --prog-head-bg:linear-gradient(180deg,#c14a22,#9a3818); --prog-head-text:#fdf4e2;
      --sign-who:#1f4a32; --sign-motto:#a06a1f;
      --cta-bg:linear-gradient(180deg,#f5e9cf,#fbf3e0); --cta-h:#c14a22; --cta-p:#5a4028;
      --btn-bg:linear-gradient(180deg,#d8642f,#c14a22); --btn-text:#fdf4e2; --btn-border:#9a3818;
      --foot-bg:linear-gradient(180deg,#3a1c0c,#1f4a32); --foot-text:#fdf4e2; --foot-meta:rgba(253,244,226,.6);
    `,
  },
  {
    id: '5-royal-emerald',
    label: 'V5 · Royal Emerald (rich green card)',
    vars: `
      --page-solid:#07140d; --page-bg:linear-gradient(155deg,#08160e,#0f2716 50%,#23150a);
      --dot-color:rgba(236,207,111,.05); --glow-color:rgba(199,154,51,.18);
      --card-bg:linear-gradient(170deg,#1a3d24,#0e2616); --ring:rgba(199,154,51,.4);
      --ink:#f1e8cf; --ink-soft:rgba(241,232,207,.84); --muted:rgba(241,232,207,.58);
      --accent:#e3c267; --strong:#e3c267; --heading:#e3c267;
      --gold:#c79a33; --gold-bright:#eccf6f; --gold-deep:#8a6a1f;
      --hero-bg:linear-gradient(165deg,#1c4429,#163a21 55%,#34220e); --hero-text:#f1e8cf; --hero-title:#fdf6e3; --hero-title-shadow:0 2px 22px rgba(199,154,51,.4); --hero-glow:rgba(236,207,111,.3); --eyebrow:#e3c267;
      --dates-text:#0c2417; --dates-bg:linear-gradient(180deg,#eccf6f,#c79a33);
      --band-bg:linear-gradient(180deg,#7a4a1e,#3d2410); --band-text:#f1e8cf; --band-label:#eccf6f; --band-name:#fdf6e3; --band-border:2px solid #c79a33;
      --letter-bg:linear-gradient(170deg,#1a3d24,#0e2616); --frame:rgba(199,154,51,.26);
      --note-bg:rgba(199,154,51,.12); --note-text:#f1e8cf;
      --prog-surface:rgba(0,0,0,.2); --prog-line:rgba(199,154,51,.16); --prog-zebra:rgba(255,255,255,.035); --prog-day:#eccf6f; --prog-text:rgba(241,232,207,.84);
      --prog-head-bg:linear-gradient(180deg,#7a4a1e,#3d2410); --prog-head-text:#fdf6e3;
      --sign-text:#f1e8cf; --sign-who:#eccf6f; --sign-motto:#c79a33; --sign-blend:multiply; --slip-bg:#f3ead0; --slip-pad:.5rem 1.4rem; --slip-shadow:0 6px 18px rgba(0,0,0,.45);
      --cta-bg:linear-gradient(180deg,rgba(122,74,30,.25),transparent); --cta-h:#eccf6f; --cta-p:rgba(241,232,207,.84);
      --btn-bg:linear-gradient(180deg,#eccf6f,#c79a33); --btn-text:#241405; --btn-border:#8a6a1f;
      --foot-bg:linear-gradient(180deg,#34220e,#14361f); --foot-text:#f1e8cf; --foot-meta:rgba(241,232,207,.55);
    `,
  },
];

function render(theme) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${theme.label} · Invitation preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>:root{${DEFAULTS}${theme.vars}}${BASE}</style>
</head><body>
<div class="badge-id">${esc(theme.label)}</div>
<div class="card">
  <div class="rule-top"></div>
  <header class="hero">
    <img class="emblem" src="/images/summit-emblem.png" alt="African Queens Summit — London 2026" />
    <p class="eyebrow">By Royal Invitation</p>
    <h1>African Global <em>Queens</em> Summit</h1>
    <span class="dates">United Kingdom · 14–31 August 2026</span>
  </header>
  <div class="ribbon">
    <div class="to">A Personal Invitation To</div>
    <div class="name">${esc(name)}</div>
  </div>
  <main class="letter">
    <div class="meta">${esc(dateLine)}</div>
    <p class="salute">To <strong>${esc(name)}</strong>,<br />${esc(salutation)},</p>
    <p class="note">${inline(noteHtml)}</p>
    <div class="body">${letterHtml}</div>
    <section class="prog">
      <h2>Programme Highlights</h2>
      <table><tbody>
              ${progRows}
      </tbody></table>
    </section>
    <div class="sign">
      <p class="regard">With Highest Royal Regard,</p>
      <span class="slip"><img src="/images/queen-aruk-signature.png" alt="Signature of Queen Aruk II" /></span>
      <div class="who">Obonganwan Marie Erete, Queen Aruk II</div>
      <div class="role">Summit Convener · African and Diaspora Queens Summit</div>
      <div class="motto">"Leadership Rooted in Service, Royalty Defined by Impact."</div>
    </div>
  </main>
  <div class="attach">
    <div class="ico">📜</div>
    <div>
      <div class="t1">Formal Invitation Letter</div>
      <div class="t2">The full signed letter and RSVP acknowledgement may be downloaded as a document upon confirmation.</div>
    </div>
  </div>
  <section class="cta">
    <h2>Will you join us?</h2>
    <p>Kindly confirm your attendance so the Secretariat may arrange your accommodation and protocol.</p>
    <a class="btn" href="/rsvp/">👑 RSVP &amp; Reserve Your Place →</a>
    <span class="rsvp-mail">or reply by email to <a href="mailto:africanqueenssummit@gmail.com">africanqueenssummit@gmail.com</a></span>
  </section>
  <div class="foot">
    <img class="partners" src="/images/partners-letterhead.png" alt="Aruk II crest and partner organisations" />
    <div class="f-org">👑 ARUK II Humanitarian Services (UK) C.I.C 👑</div>
    <div class="f-meta">Hawkhill Place, Stanton St John, Oxford, OX33 1HS, United Kingdom · Tel: +44 793 250 6556<br />obonganwan.aruk@yahoo.com · africanqueenssummit@gmail.com · Company Reg. No. 17110628</div>
  </div>
  <div class="rule-bottom"></div>
</div>
</body></html>`;
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const t of THEMES) {
  writeFileSync(join(outDir, `${t.id}.html`), render(t));
  console.log(`  ✓ /invite/_compare/${t.id}.html  —  ${t.label}`);
}
console.log(`\nBuilt ${THEMES.length} comparison variants.`);
