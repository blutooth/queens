# African Queens Summit — England 2026

Template site for the African & Diaspora Queens Summit, convened by
Her Royal Majesty Queen Aruk II. London & Oxford · 14–31 August 2026.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds
and publishes to GitHub Pages. The workflow sets `VITE_BASE` to the
repo name automatically.

Site will be available at `https://<user>.github.io/<repo>/`.

## Structure

- `src/lib/queens.js` — event data (dates, pillars, matriarchs, venues,
  programme, pricing, dignitaries, partners)
- `src/lib/*.svelte` — section components
- `public/images/` — all site imagery
- `reference/` — raw source material (PDFs, screenshots, notes)
