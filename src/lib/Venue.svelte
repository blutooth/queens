<script>
  import { venues } from './queens.js';
</script>

<section id="venue" class="venue">
  <div class="container">
    <div class="head">
      <p class="eyebrow">The Settings</p>
      <h2>
        Three settings.<br />
        One <span class="italic">historic</span> convening.
      </h2>
      <p class="strap">
        Across eighteen days, the summit unfolds between a grand London ballroom,
        an Oxfordshire country residence, and the academic halls of the University of Oxford.
      </p>
    </div>

    <!-- Opening editorial collage of the Porchester ballroom -->
    <div class="collage">
      <figure class="big">
        <img src="/images/porchester-2.jpg" alt="Porchester Hall ballroom dressed for a ceremony" />
        <figcaption>
          <span class="sash">Porchester Hall · London</span>
          <span class="caption-title">The Ballroom</span>
        </figcaption>
      </figure>
      <figure class="med">
        <img src="/images/porchester-1.jpg" alt="Porchester Hall in full event mode" />
      </figure>
      <figure class="med">
        <img src="/images/porchester-4.jpg" alt="Porchester Hall in reception setup" />
      </figure>
    </div>

    <!-- Three venue cards -->
    <div class="cards">
      {#each venues as v, i}
        <article class="card">
          <div class="img">
            <img src={v.image} alt={v.name} />
          </div>
          <div class="body">
            <div class="kick-row">
              <span class="badge">{String(i + 1).padStart(2, '0')}</span>
              <span class="kicker">{v.kicker}</span>
            </div>
            <h3>{v.name}</h3>
            <div class="city">{v.city}</div>
            <p class="desc">{v.description}</p>
            <ul>
              {#each v.features as f}
                <li><span class="dot">◈</span>{f}</li>
              {/each}
            </ul>
          </div>
        </article>
      {/each}
    </div>

    <div class="notice">
      <div class="n-mark">♕</div>
      <div>
        <div class="n-k">Academic Highlight</div>
        <p>
          A bespoke <strong>capacity-building course</strong> at the University of
          Oxford — lectures and seminars on leadership, governance, and heritage,
          followed by an honorary convocation and banquet.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .venue {
    background: var(--paper-soft);
  }

  .head {
    max-width: 780px;
    margin: 0 auto 4rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2.25rem, 5.5vw, 4rem);
    font-weight: 400;
    line-height: 1.02;
    margin: 1rem 0 1.5rem;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .strap {
    font-size: 1.1rem;
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 620px;
    margin: 0 auto;
  }

  /* Opening collage */
  .collage {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 4rem;
    aspect-ratio: 16 / 9;
    max-height: 560px;
  }
  .collage figure {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ink);
  }
  .collage .big {
    grid-row: 1 / 3;
  }
  .collage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .collage figure:hover img { transform: scale(1.03); }

  .collage figcaption {
    position: absolute;
    left: 1.5rem;
    bottom: 1.5rem;
    right: 1.5rem;
    color: var(--cream);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .sash {
    display: inline-block;
    width: fit-content;
    background: var(--terracotta);
    color: var(--cream);
    padding: 0.3rem 0.75rem;
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .caption-title {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-style: italic;
    color: var(--cream);
    line-height: 1;
  }

  /* Cards */
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .card {
    background: var(--paper);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px -20px rgba(35, 28, 21, 0.2);
  }

  .img {
    position: relative;
    aspect-ratio: 3 / 2;
    overflow: hidden;
  }
  .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  .card:hover .img img { transform: scale(1.04); }

  .body {
    padding: 1.75rem 1.5rem 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .kick-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .badge {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta);
    font-size: 0.95rem;
    font-weight: 400;
  }
  .kicker {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  h3 {
    font-size: 1.75rem;
    font-weight: 500;
    line-height: 1;
    margin-bottom: 0.4rem;
  }
  .city {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--forest);
    font-size: 0.95rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--line);
  }
  .desc {
    color: var(--ink-soft);
    font-size: 0.93rem;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }
  ul {
    list-style: none;
    margin-top: auto;
  }
  li {
    display: flex;
    gap: 0.6rem;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    color: var(--ink);
    align-items: center;
  }
  .dot {
    color: var(--terracotta);
    font-size: 0.7rem;
  }

  /* Academic notice */
  .notice {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    background: var(--forest);
    color: var(--cream);
    padding: 2.25rem 2.5rem;
    border-radius: 4px;
    align-items: center;
  }
  .n-mark {
    font-size: 3rem;
    color: var(--terracotta-bright);
    line-height: 1;
  }
  .n-k {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  .notice p {
    font-family: var(--font-display);
    font-size: 1.1rem;
    line-height: 1.5;
    color: var(--cream);
    max-width: 70ch;
  }
  .notice strong {
    color: var(--terracotta-bright);
    font-weight: 500;
  }

  @media (max-width: 960px) {
    .collage { grid-template-columns: 1fr; grid-template-rows: auto; aspect-ratio: auto; max-height: none; }
    .collage .big { grid-row: auto; aspect-ratio: 4 / 3; }
    .collage figure:not(.big) { aspect-ratio: 16 / 10; }
    .cards { grid-template-columns: 1fr; }
    .strip { grid-template-columns: 1fr 1fr; }
    .strip .s-big { grid-column: span 2; aspect-ratio: 16 / 9; }
    .notice { grid-template-columns: 1fr; gap: 1rem; padding: 1.75rem; text-align: center; }
  }
  @media (max-width: 560px) {
    .strip { grid-template-columns: 1fr; }
    .strip .s-big { grid-column: span 1; }
  }
</style>
