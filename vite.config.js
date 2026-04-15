import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The site is served from the apex of africanqueenssummit.com
// (a custom domain configured via public/CNAME), so base is '/'.
// Override with VITE_BASE when deploying to a path (e.g. /queens/).
const base = process.env.VITE_BASE ?? '/';

export default defineConfig(() => ({
  plugins: [svelte()],
  base,
}));
