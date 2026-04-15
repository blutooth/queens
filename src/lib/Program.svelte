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
          <div class="idx">{p.idx}</div>
          <div class="group">{p.group}</div>
          <h3>{p.title}</h3>
          <p class="body">{p.body}</p>
          <ul>
            {#each p.items as it}
              <li><span class="tick">◈</span>{it}</li>
            {/each}
          </ul>
        </article>
      {/each}
    </div>

    <aside class="footnote">
      <span class="glyph">♕</span>
      <p>
        Designed to deliver a balance of <strong>influence, cultural pride,
        and enduring legacy</strong>. A separate programme &amp; engagement brief
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
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  .chapter {
    position: relative;
    padding: 2.25rem 1.75rem 2rem;
    background: var(--paper-soft);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .chapter:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px -20px rgba(35, 28, 21, 0.18);
  }

  .idx {
    position: absolute;
    top: 1.5rem;
    right: 1.75rem;
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta);
    font-size: 1.1rem;
  }
  .group {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta);
    font-weight: 500;
    margin-bottom: 0.9rem;
  }
  h3 {
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 0.9rem;
  }
  .body {
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  ul {
    list-style: none;
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
  }
  li {
    display: flex;
    gap: 0.65rem;
    padding: 0.4rem 0;
    font-size: 0.88rem;
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
    max-width: 760px;
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
