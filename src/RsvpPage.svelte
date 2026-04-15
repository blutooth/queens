<script>
  import Nav from './lib/Nav.svelte';
  import Pricing from './lib/Pricing.svelte';
  import Rsvp from './lib/Rsvp.svelte';
  import Footer from './lib/Footer.svelte';
</script>

<Nav />
<main>
  <header class="sub-hero">
    <div class="container">
      <p class="eyebrow">Reserve your place</p>
      <h1>
        Pricing &amp; <span class="italic">RSVP.</span>
      </h1>
      <p class="lede">
        Three ways to take your seat at the African Queens Summit —
        14 – 31 August 2026, London &amp; Oxford. Registration closes when
        places are filled.
      </p>
      <a href="/" class="back">← Back to summit overview</a>
    </div>
  </header>

  <Pricing />
  <Rsvp />
</main>
<Footer />

<style>
  .sub-hero {
    padding: 10rem 0 4rem;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(200, 90, 46, 0.08), transparent 50%),
      var(--paper);
    text-align: center;
    border-bottom: 1px solid var(--line);
  }
  h1 {
    font-family: var(--font-display);
    font-size: clamp(3rem, 7vw, 5rem);
    font-weight: 400;
    line-height: 0.95;
    margin: 1rem 0 1.75rem;
    color: var(--ink);
    font-variation-settings: 'opsz' 144, 'SOFT' 20;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    font-size: 1.15rem;
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 640px;
    margin: 0 auto 2rem;
  }
  .back {
    display: inline-block;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    color: var(--ink);
    border-bottom: 1px solid var(--line-strong);
    padding-bottom: 0.2rem;
    transition: all 0.2s ease;
  }
  .back:hover {
    color: var(--terracotta);
    border-color: var(--terracotta);
  }
</style>
