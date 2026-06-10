<script>
  import Nav from './lib/Nav.svelte';
  import Costings from './lib/Costings.svelte';
  import Rsvp from './lib/Rsvp.svelte';
  import Footer from './lib/Footer.svelte';
</script>

<Nav />
<main>
  <!-- Tabs at the very top — info first -->
  <Costings />

  <!-- WhatsApp reservation — the closing call to action -->
  <Rsvp />
</main>
<Footer />

<style>
  main { padding-top: 3.75rem; }
</style>
