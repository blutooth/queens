<script>
  import { programme } from './queens.js';
</script>

<section id="programme" class="programme">
  <div class="container">
    <header>
      <p class="eyebrow">Programme · 14 – 31 August 2026</p>
      <h2>
        Eighteen days,<br />
        <span class="italic">six movements.</span>
      </h2>
    </header>

    <ol class="list">
      {#each programme as item, i}
        <li>
          <div class="span">
            <div class="dates">{item.span}</div>
            <div class="where">{item.where}</div>
          </div>
          <div class="body">
            <div class="top-row">
              <span class="idx">Movement {String(i + 1).padStart(2, '0')}</span>
              <span class="divider"></span>
            </div>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .programme {
    background: var(--paper);
  }

  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 5rem;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin-top: 1rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }

  .list {
    list-style: none;
    max-width: 920px;
    margin: 0 auto;
  }
  .list li {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 3rem;
    padding: 2.5rem 0;
    border-top: 1px solid var(--line);
  }
  .list li:last-child { border-bottom: 1px solid var(--line); }

  .span { padding-top: 0.25rem; }
  .dates {
    font-family: var(--font-display);
    font-size: 1.2rem;
    color: var(--ink);
    font-weight: 500;
    margin-bottom: 0.4rem;
    letter-spacing: -0.01em;
  }
  .where {
    display: inline-block;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--terracotta);
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--terracotta);
    border-radius: 999px;
    font-weight: 500;
  }

  .body { padding-top: 0.25rem; }
  .top-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.6rem;
  }
  .idx {
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  .divider {
    flex: 1;
    height: 1px;
    background: var(--line);
  }
  h4 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 400;
    margin-bottom: 0.75rem;
    line-height: 1.15;
  }
  .body p {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.6;
    max-width: 560px;
  }

  @media (max-width: 720px) {
    .list li { grid-template-columns: 1fr; gap: 1rem; padding: 2rem 0; }
    .span { display: flex; gap: 1rem; align-items: center; }
    .dates { margin-bottom: 0; }
  }
</style>
