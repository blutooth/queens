// Prefix a site-absolute path (e.g. "/images/foo.jpg") with Vite's
// configured base URL, so it resolves correctly under GitHub Pages
// where the app is served from /queens/.
export const asset = (path) =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
