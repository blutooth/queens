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
    display: grid; grid-template-columns: 8.5rem 1fr; align-items: center;
    gap: 0.5rem 1.1rem; padding: 0.85rem 0.5rem; border-bottom: 1px solid var(--line, rgba(60,36,21,0.14));
  }
  .item:last-child { border-bottom: none; }
  .when {
    justify-self: start; display: inline-block; text-align: center; white-space: nowrap;
    background: #1f8a53; color: #fff; border: 1px solid #14663c;
    box-shadow: 0 1px 3px rgba(20, 102, 60, 0.35);
    font-size: 0.68rem; letter-spacing: 0.09em; text-transform: uppercase; font-weight: 700;
    padding: 0.4rem 0.75rem; border-radius: 999px;
  }
  .what {
    font-family: var(--font-display); font-size: 1.12rem; color: var(--ink); line-height: 1.3;
  }
  .item.finale .what { color: var(--terracotta); font-style: italic; }

  @media (max-width: 560px) {
    .item { grid-template-columns: 1fr; gap: 0.45rem; }
  }
</style>
