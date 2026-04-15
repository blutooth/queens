<script>
  import { pillars } from './queens.js';
</script>

<section id="pillars" class="pillars">
  <div class="container">
    <header>
      <p class="eyebrow">The Four Pillars</p>
      <h2>
        The foundations of the<br />
        <span class="italic">movement.</span>
      </h2>
    </header>

    <div class="grid">
      {#each pillars as p, i}
        <article class="pillar" class:dark={i % 2 === 1}>
          <div class="idx">{String(i + 1).padStart(2, '0')}</div>
          <h3>{p.name}</h3>
          <p class="cap">{p.caption}</p>
          <p class="body">{p.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .pillars {
    background: var(--paper);
  }

  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 4.5rem;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-top: 1rem;
    font-weight: 400;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .pillar {
    position: relative;
    padding: 3rem 2.5rem;
    background: var(--paper);
    transition: background 0.25s ease;
    min-height: 300px;
    display: flex;
    flex-direction: column;
  }
  .pillar.dark {
    background: var(--paper-deep);
  }
  .pillar:hover { background: var(--cream); }
  .pillar.dark:hover { background: var(--paper-soft); }

  .idx {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1rem;
    color: var(--terracotta);
    margin-bottom: 2rem;
    letter-spacing: 0.1em;
    font-weight: 400;
  }
  h3 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    margin-bottom: 0.75rem;
    line-height: 1;
  }
  .cap {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.1rem;
    color: var(--forest);
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--line);
  }
  .body {
    color: var(--ink-soft);
    font-size: 0.98rem;
    line-height: 1.65;
  }

  @media (max-width: 720px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
