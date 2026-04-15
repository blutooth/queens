import './app.css';
import RsvpPage from './RsvpPage.svelte';

const app = new RsvpPage({
  target: document.getElementById('app'),
});

export default app;
