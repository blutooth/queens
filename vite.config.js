import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
import { writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// The site is served from the apex of africanqueenssummit.com.
// Override with VITE_BASE when deploying to a path (e.g. /queens/).
const base = process.env.VITE_BASE ?? '/';

// Dev-only: lets the /invite/ master page create an invitation locally.
// Writes content/invitees/<slug>.md and regenerates the invite pages so the
// link is immediately live in the dev server. Not present in production.
function inviteCreateApi() {
  return {
    name: 'invite-create-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/create-invite', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { slug, markdown } = JSON.parse(body || '{}');
            const safe = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
            if (!safe || !markdown) throw new Error('missing slug or markdown');
            writeFileSync(resolve(__dirname, 'content/invitees', safe + '.md'), markdown);
            execFileSync('node', ['scripts/build-invites.mjs'], { cwd: __dirname, stdio: 'ignore' });
            res.end(JSON.stringify({ ok: true, url: '/invite/' + safe + '/' }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
          }
        });
      });
    },
  };
}

// Dev-only: persist the "invited" status to content/data/invited.json so it
// survives across browsers/devices (not just localStorage). Keyed by slug.
function invitedApi() {
  return {
    name: 'invited-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/set-invited', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { slug, invited } = JSON.parse(body || '{}');
            const safe = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
            if (!safe) throw new Error('bad slug');
            const p = resolve(__dirname, 'content/data/invited.json');
            let store = {};
            if (existsSync(p)) { try { store = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { store = {}; } }
            if (invited) { store[safe] = { invited: true, at: new Date().toISOString() }; }
            else { delete store[safe]; }
            writeFileSync(p, JSON.stringify(store, null, 2));
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
          }
        });
      });
    },
  };
}

// Dev-only: serve the prebuilt /invite/** pages (master page + each
// invitation) directly from public/, so the Svelte SPA fallback doesn't
// hijack those routes during `npm run dev`. In production they're plain
// static files in dist/, so no special handling is needed.
function serveInvitePages() {
  return {
    name: 'serve-invite-pages',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const url = (req.url || '').split('?')[0];
          if (url === '/invite') { res.statusCode = 302; res.setHeader('Location', '/invite/'); res.end(); return; }
          if (url.startsWith('/invite/')) {
            const rel = decodeURIComponent(url);
            let file = resolve(__dirname, 'public' + rel);
            if (rel.endsWith('/')) {
              file = resolve(file, 'index.html');
            } else if (existsSync(file) && statSync(file).isDirectory()) {
              res.statusCode = 302; res.setHeader('Location', rel + '/'); res.end(); return;
            }
            if (existsSync(file) && statSync(file).isFile()) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(readFileSync(file));
              return;
            }
          }
        } catch (e) { /* fall through */ }
        next();
      });
    },
  };
}

export default defineConfig(() => ({
  plugins: [serveInvitePages(), svelte(), inviteCreateApi(), invitedApi()],
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rsvp: resolve(__dirname, 'rsvp/index.html'),
        glamping: resolve(__dirname, 'glamping/index.html'),
        donate: resolve(__dirname, 'donate/index.html'),
        deck: resolve(__dirname, 'deck/index.html'),
      },
    },
  },
}));
