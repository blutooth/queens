<script>
  import { highlights } from './queens.js';
</script>

<section id="summit" class="summit">
  <div class="container">
    <div class="intro">
      <p class="eyebrow">The Convocation</p>
      <h2>
        A <span class="italic">historic</span> convening<br />
        of African royalty, in England.
      </h2>
      <p class="lede">
        For eighteen days across London and Oxford, a hundred queens of Africa
        and the Diaspora gather with first-class kings, scholars, and
        humanitarian leaders — strengthening cultural heritage, advancing
        women's leadership, and reinforcing the dignity of traditional
        institutions.
      </p>
    </div>

    <div class="stats">
      <div>
        <div class="big">100</div>
        <div class="lbl">Queens in convocation</div>
      </div>
      <div>
        <div class="big">18</div>
        <div class="lbl">Days of programming</div>
      </div>
      <div>
        <div class="big">2</div>
        <div class="lbl">Historic host cities</div>
      </div>
      <div>
        <div class="big">∞</div>
        <div class="lbl">Generations honoured</div>
      </div>
    </div>

    <div class="cards">
      {#each highlights as h, i}
        <article class="card" class:alt={i === 1}>
          <div class="num">{h.num}</div>
          <h3>{h.title}</h3>
          <p>{h.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .summit {
    background: var(--paper);
  }

  .intro {
    max-width: 820px;
    margin: 0 auto 5rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2.25rem, 5.5vw, 4rem);
    margin: 1rem 0 1.5rem;
    color: var(--ink);
    line-height: 1.05;
    font-weight: 400;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    font-size: 1.1rem;
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 640px;
    margin: 0 auto;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    margin-bottom: 5rem;
  }
  .stats > div {
    background: var(--paper);
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
  .big {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 400;
    color: var(--terracotta);
    line-height: 1;
    margin-bottom: 0.5rem;
    font-style: italic;
  }
  .lbl {
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  .card {
    padding: 2.5rem 2rem;
    background: var(--paper-soft);
    border-radius: 4px;
    transition: transform 0.25s ease;
  }
  .card.alt {
    background: var(--forest);
    color: var(--cream);
  }
  .card.alt h3 { color: var(--cream); }
  .card.alt .num { color: var(--terracotta-bright); }
  .card.alt p { color: rgba(250, 246, 234, 0.8); }
  .card:hover { transform: translateY(-4px); }

  .num {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 2rem;
    color: var(--terracotta);
    margin-bottom: 1rem;
    font-weight: 300;
  }
  .card h3 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }
  .card p {
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  @media (max-width: 880px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .cards { grid-template-columns: 1fr; }
  }
</style>
