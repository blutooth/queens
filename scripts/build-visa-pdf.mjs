// Renders every built visa letter to an A4 PDF using headless Chrome, saved to
// ~/Desktop/Visa-Letters/<slug>.pdf — ready to attach to email or WhatsApp.
//
// Run `npm run visa:pdf` (which builds the letters first, then this).
// Requires Google Chrome / Chromium / Edge installed.

import { readdirSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir, tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const visaOut = join(root, 'public', 'visa');
const pdfDir = join(homedir(), 'Desktop', 'Visa-Letters');
const profile = join(tmpdir(), 'visa-chrome-profile');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];
const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error('✗ No Chrome/Chromium/Edge found — cannot generate PDFs.');
  process.exit(1);
}
if (!existsSync(visaOut)) {
  console.error('✗ No letters built yet. Run `npm run visa` first.');
  process.exit(1);
}
mkdirSync(pdfDir, { recursive: true });
// Clear any stale headless-Chrome profile so a leftover lock can't block us.
if (existsSync(profile)) rmSync(profile, { recursive: true, force: true });

const slugs = readdirSync(visaOut).filter((n) => {
  const p = join(visaOut, n);
  return statSync(p).isDirectory() && n !== '_template' && existsSync(join(p, 'index.html'));
});

let count = 0;
for (const slug of slugs) {
  const src = 'file://' + join(visaOut, slug, 'index.html');
  const out = join(pdfDir, slug + '.pdf');
  try {
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', `--user-data-dir=${profile}`,
      '--no-pdf-header-footer', `--print-to-pdf=${out}`, src,
    ], { stdio: 'ignore' });
    console.log(`  ✓ ${slug}.pdf`);
    count++;
  } catch (e) {
    console.warn(`  ✗ ${slug} — ${e.message}`);
  }
}

console.log(`\nBuilt ${count} PDF(s) → ${pdfDir}`);
