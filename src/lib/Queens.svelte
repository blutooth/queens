<script>
  import { matriarchs } from './queens.js';
</script>

<section id="lineage" class="lineage">
  <div class="container">
    <header>
      <p class="eyebrow">The lineage we honour</p>
      <h2>
        Before the summit,<br />
        <span class="italic">the matriarchs.</span>
      </h2>
      <p class="sub">
        Three thousand years of African queenship — the ancestors whose reigns
        make this convocation possible. Each portrait is drawn from historical
        artefact, painting, or museum record, treated in a common palette so
        one lineage becomes visible across millennia.
      </p>
    </header>

    <div class="grid">
      {#each matriarchs as q, i}
        <article class="card">
          <div class="frame">
            <div class="duotone">
              <img src={q.image} alt="Historical depiction of {q.name}" />
            </div>
            <div class="crown-mark">♕</div>
            <div class="plate">
              <div class="idx">No. {String(i + 1).padStart(2, '0')}</div>
              <div class="artifact">{q.artifact}</div>
            </div>
          </div>
          <div class="body">
            <div class="title">{q.title}</div>
            <h3>{q.name}</h3>
            <div class="meta">
              <span>{q.reign}</span>
              <span class="sep">·</span>
              <span>{q.region}</span>
            </div>
            <p>{q.bio}</p>
          </div>
        </article>
      {/each}
    </div>

    <div class="footnote">
      <span class="mark">◈</span>
      <p>
        Historical images are public-domain artefacts from the Neues Museum,
        the Metropolitan Museum, Wikimedia Commons, and national museums of
        Ghana, Nigeria, and Angola. Treated in a unified duotone to honour
        them as a single lineage.
      </p>
    </div>
  </div>
</section>

<style>
  .lineage {
    background: var(--paper-soft);
  }

  header {
    max-width: 760px;
    margin: 0 auto 4.5rem;
    text-align: center;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin: 1rem 0 1.5rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .sub {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 620px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 3.5rem;
  }

  .card {
    background: var(--paper);
    border-radius: 4px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 48px -20px rgba(35, 28, 21, 0.2);
  }

  /* Unified image treatment */
  .frame {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--ink);
  }
  .duotone {
    position: absolute;
    inset: 0;
    background: var(--terracotta);
  }
  .duotone img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%) contrast(1.15) brightness(0.95);
    mix-blend-mode: multiply;
    opacity: 0.92;
    transition: transform 0.8s ease;
  }
  .card:hover .duotone img { transform: scale(1.03); }
  .duotone::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 45%, rgba(35, 28, 21, 0.55));
    pointer-events: none;
  }

  .crown-mark {
    position: absolute;
    top: 0.9rem;
    right: 1rem;
    color: var(--cream);
    font-size: 1.25rem;
    opacity: 0.9;
    z-index: 2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  .plate {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .idx {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--cream);
    font-size: 0.85rem;
  }
  .artifact {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(250, 246, 234, 0.8);
    text-align: right;
    max-width: 60%;
    line-height: 1.4;
  }

  .body {
    padding: 1.5rem 1.25rem 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .title {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  h3 {
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 1;
    margin-bottom: 0.5rem;
  }
  .meta {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.9rem;
    color: var(--forest);
    margin-bottom: 0.85rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid var(--line);
  }
  .meta .sep { margin: 0 0.35rem; opacity: 0.6; }
  .body p {
    color: var(--ink-soft);
    font-size: 0.88rem;
    line-height: 1.6;
  }

  .footnote {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: start;
    max-width: 760px;
    margin: 0 auto;
    padding: 1.5rem 1.75rem;
    background: var(--paper);
    border-left: 3px solid var(--terracotta);
    border-radius: 2px;
  }
  .mark {
    color: var(--terracotta);
    font-size: 1.2rem;
    line-height: 1.2;
  }
  .footnote p {
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.55;
    font-style: italic;
    font-family: var(--font-display);
  }

  @media (max-width: 1100px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 820px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 520px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
