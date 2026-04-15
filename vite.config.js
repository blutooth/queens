import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

// The site is served from the apex of africanqueenssummit.com.
// Override with VITE_BASE when deploying to a path (e.g. /queens/).
const base = process.env.VITE_BASE ?? '/';

export default defineConfig(() => ({
  plugins: [svelte()],
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rsvp: resolve(__dirname, 'rsvp/index.html'),
      },
    },
  },
}));
