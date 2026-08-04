<script>
  import { programmeHighlights } from './queens.js';
</script>

<section id="highlights" class="highlights">
  <div class="container">
    <header>
      <p class="eyebrow">Programme Highlights · 14 – 31 August 2026</p>
      <h2>Seventeen days, <span class="italic">day by day.</span></h2>
      <p class="sub">
        The ceremonial itinerary as set out in the official invitation — from the
        Royal Arrival to the cultural finale at the Notting Hill Carnival.
      </p>
    </header>

    <ol class="timeline">
      {#each programmeHighlights as h}
        <li class="item" class:finale={h.title.includes('End of Summit')}>
          <span class="ico" aria-hidden="true">{h.icon}</span>
          <span class="when">{h.date}</span>
          <span class="what">{h.title}</span>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .highlights { background: var(--paper-soft, #f3ecdd); }
  header { text-align: center; max-width: 720px; margin: 0 auto 3.5rem; }
  h2 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 400; margin: 1rem 0 1rem; line-height: 1.05; }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .sub {
    color: var(--ink-soft); font-family: var(--font-display); font-style: italic;
    font-size: 1.05rem; line-height: 1.5; max-width: 560px; margin: 0 auto;
  }

  .timeline { list-style: none; margin: 0 auto; padding: 0; max-width: 760px; }
  .item {
    display: grid; grid-template-columns: 2.4rem 8.5rem 1fr; align-items: baseline;
    gap: 0.5rem 1rem; padding: 1rem 0.5rem; border-bottom: 1px solid var(--line, rgba(60,36,21,0.14));
  }
  .item:last-child { border-bottom: none; }
  .ico { font-size: 1.2rem; line-height: 1; }
  .when {
    font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--terracotta); font-weight: 700;
  }
  .what {
    font-family: var(--font-display); font-size: 1.12rem; color: var(--ink); line-height: 1.3;
  }
  .item.finale .what { color: var(--terracotta); font-style: italic; }

  @media (max-width: 560px) {
    .item { grid-template-columns: 2rem 1fr; }
    .when { grid-column: 2; }
    .what { grid-column: 2; }
    .ico { grid-row: span 2; align-self: center; }
  }
</style>
