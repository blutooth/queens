<script>
  import { asset } from './asset.js';

  const stats = [
    { n: '400+', k: 'Royal attendees' },
    { n: '22', k: 'African nations' },
    { n: '14', k: 'First-class kings' },
    { n: '60+', k: 'Press features' },
  ];

  const endorsements = [
    {
      quote: 'A convocation that honoured tradition and opened the future at once.',
      who: 'Motherland Beckons',
    },
    {
      quote: 'The most dignified gathering of African queens we have documented.',
      who: 'IPADA Initiatives',
    },
    {
      quote: 'A continental moment. England will feel the same weight.',
      who: 'Forum of African Traditional Authorities',
    },
  ];
</script>

<section id="prior" class="prior">
  <div class="container">
    <div class="head">
      <p class="eyebrow">Following Nigeria · IPADA 2025</p>
      <h2>
        Building on a<br />
        <span class="italic">continental success.</span>
      </h2>
      <p class="lede">
        The African Queens Summit follows the celebrated IPADA convocation held
        in Nigeria — a gathering that drew queens, kings, and traditional rulers
        from across the continent and the Diaspora.
      </p>
    </div>

    <div class="stats">
      {#each stats as s}
        <div>
          <div class="n">{s.n}</div>
          <div class="k">{s.k}</div>
        </div>
      {/each}
    </div>

    <!-- IPADA Nigeria event photography -->
    <div class="strip">
      <figure>
        <img src={asset('/images/queen-aruk-ii-canopy.jpg')} alt="Queen Aruk II at a ceremonial convocation" />
        <figcaption>Ceremonial convocation</figcaption>
      </figure>
      <figure class="wide">
        <img src={asset('/images/ipada-diaspora.jpg')} alt="Royal delegation at the IPADA Diaspora Global Conference, Nigeria" />
        <figcaption>Diaspora Global Conference · Nigeria</figcaption>
      </figure>
      <figure>
        <img src={asset('/images/dancers.jpg')} alt="Cultural troupe in ceremonial dress" />
        <figcaption>The cultural troupe</figcaption>
      </figure>
    </div>

    <!-- Endorsements -->
    <div class="endorsements">
      {#each endorsements as e, i}
        <blockquote class:dark={i === 1}>
          <p>"{e.quote}"</p>
          <footer>— {e.who}</footer>
        </blockquote>
      {/each}
    </div>

    <p class="footnote">
      Full press coverage and event photography from the Nigeria convocation
      will be published in the official summit dossier.
    </p>
  </div>
</section>

<style>
  .prior {
    background: var(--paper);
  }

  .head {
    max-width: 760px;
    margin: 0 auto 3.5rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin: 1rem 0 1.25rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 580px;
    margin: 0 auto;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    margin-bottom: 3.5rem;
  }
  .stats > div {
    background: var(--paper);
    padding: 2rem 1.25rem;
    text-align: center;
  }
  .n {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(2rem, 4vw, 3rem);
    color: var(--terracotta);
    line-height: 1;
    margin-bottom: 0.4rem;
  }
  .k {
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .strip {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 1rem;
    margin-bottom: 3.5rem;
  }
  .strip figure {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ink);
  }
  .strip figure.wide {
    aspect-ratio: 4 / 5;
  }
  .strip img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.9) contrast(1.05);
    transition: transform 0.6s ease;
  }
  .strip figure:hover img { transform: scale(1.03); }
  .strip figcaption {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    background: rgba(35, 28, 21, 0.75);
    backdrop-filter: blur(6px);
    color: var(--cream);
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    padding: 0.35rem 0.7rem;
    font-weight: 500;
  }

  .endorsements {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
  blockquote {
    padding: 2rem 1.75rem;
    background: var(--paper-soft);
    border-left: 3px solid var(--terracotta);
    border-radius: 2px;
  }
  blockquote.dark {
    background: var(--ink);
    color: var(--cream);
    border-left-color: var(--terracotta-bright);
  }
  blockquote p {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-style: italic;
    line-height: 1.45;
    margin-bottom: 1rem;
    color: inherit;
  }
  blockquote.dark p { color: var(--cream); }
  blockquote footer {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  blockquote.dark footer { color: var(--terracotta-bright); }

  .footnote {
    text-align: center;
    max-width: 580px;
    margin: 0 auto;
    color: var(--muted);
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.55;
  }

  @media (max-width: 860px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .strip { grid-template-columns: 1fr; }
    .strip figure { aspect-ratio: 16 / 10; }
    .strip figure.wide { aspect-ratio: 16 / 10; }
    .endorsements { grid-template-columns: 1fr; }
  }
</style>
