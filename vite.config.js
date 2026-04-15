import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Repo name used as the base path on GitHub Pages project sites
// (https://USERNAME.github.io/queens/). Override with VITE_BASE if
// the repo ends up named something else.
const base = process.env.VITE_BASE ?? '/queens/';

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'build' ? base : '/',
}));
