import './app.css';
import DeckPage from './DeckPage.svelte';

const app = new DeckPage({
  target: document.getElementById('app'),
});

export default app;
