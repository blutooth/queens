<script>
  import { programme } from './queens.js';
</script>

<section id="programme" class="programme">
  <div class="container">
    <header>
      <p class="eyebrow">Programme &amp; Engagement · 14 – 31 August 2026</p>
      <h2>
        Leadership, culture, diplomacy,<br />
        <span class="italic">legacy.</span>
      </h2>
      <p class="sub">
        A curated programme across the United Kingdom — combining academic
        engagement at Oxford, prestige engagements in London, strategic
        roundtables, and a cultural finale at the Notting Hill Carnival.
      </p>
    </header>

    <div class="grid">
      {#each programme as p}
        <article class="chapter">
          <div class="image">
            <img src={p.image} alt={p.title} />
            <div class="scrim"></div>
            <div class="badge">{p.idx}</div>
            <div class="group">{p.group}</div>
          </div>
          <div class="body">
            <h3>{p.title}</h3>
            <p class="lede">{p.body}</p>
            <ul>
              {#each p.items as it}
                <li><span class="tick">◈</span>{it}</li>
              {/each}
            </ul>
          </div>
        </article>
      {/each}
    </div>

    <aside class="footnote">
      <span class="glyph">♕</span>
      <p>
        Designed to deliver a balance of <strong>influence, cultural pride,
        and enduring legacy</strong>. The full programme &amp; engagement brief
        is provided to confirmed attendees.
      </p>
    </aside>
  </div>
</section>

<style>
  .programme {
    background: var(--paper);
  }

  header {
    text-align: center;
    max-width: 820px;
    margin: 0 auto 5rem;
  }
  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    margin: 1rem 0 1.25rem;
    line-height: 1.05;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .sub {
    color: var(--ink-soft);
    font-size: 1.08rem;
    line-height: 1.6;
    max-width: 640px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .chapter {
    background: var(--paper-soft);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .chapter:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 50px -20px rgba(35, 28, 21, 0.25);
  }

  .image {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--ink);
  }
  .image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .chapter:hover .image img { transform: scale(1.05); }
  .scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(35, 28, 21, 0.15) 0%, rgba(35, 28, 21, 0.05) 40%, rgba(35, 28, 21, 0.6) 100%);
  }
  .badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-family: var(--font-display);
    font-style: italic;
    background: var(--terracotta);
    color: var(--cream);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 6px 16px -4px rgba(200, 90, 46, 0.5);
  }
  .group {
    position: absolute;
    left: 1.25rem;
    bottom: 1.25rem;
    color: var(--cream);
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    background: rgba(35, 28, 21, 0.5);
    backdrop-filter: blur(6px);
    padding: 0.35rem 0.7rem;
    border-radius: 2px;
  }

  .body {
    padding: 1.75rem 1.5rem 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  h3 {
    font-size: 1.55rem;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 0.85rem;
    color: var(--ink);
  }
  .lede {
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.55;
    margin-bottom: 1.25rem;
  }

  ul {
    list-style: none;
    margin-top: auto;
    padding-top: 1.1rem;
    border-top: 1px solid var(--line);
  }
  li {
    display: flex;
    gap: 0.6rem;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    color: var(--ink);
    align-items: baseline;
  }
  .tick {
    color: var(--terracotta);
    font-size: 0.7rem;
  }

  .footnote {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.25rem;
    align-items: center;
    max-width: 780px;
    margin: 0 auto;
    padding: 1.75rem 2rem;
    background: var(--forest);
    color: var(--cream);
    border-radius: 4px;
  }
  .glyph {
    font-size: 2rem;
    color: var(--terracotta-bright);
    line-height: 1;
  }
  .footnote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.05rem;
    line-height: 1.55;
    color: rgba(250, 246, 234, 0.92);
  }
  .footnote strong {
    color: var(--terracotta-bright);
    font-weight: 500;
    font-style: normal;
  }

  @media (max-width: 1000px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    .footnote { grid-template-columns: 1fr; text-align: center; }
  }
</style>
