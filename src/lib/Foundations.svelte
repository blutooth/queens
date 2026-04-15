<script>
  import { onMount, onDestroy } from 'svelte';
  import { pillars } from './queens.js';

  const moments = [
    {
      src: '/images/queen-aruk-ii-throne.jpg',
      title: 'The Throne of Aruk II',
      where: 'Royal Portrait',
    },
    {
      src: '/images/queen-aruk-ii-canopy.jpg',
      title: 'The Ndebele Convocation',
      where: 'Kwajekejeke · South Africa',
    },
    {
      src: '/images/queen-aruk-ii-portrait.jpg',
      title: 'In Full Regalia',
      where: 'Throne Room',
    },
    {
      src: '/images/queen-aruk-ii-closeup.jpg',
      title: 'Coral & Crown',
      where: 'Royal Portrait',
    },
    {
      src: '/images/dancers.jpg',
      title: 'Ceremonial Dance',
      where: 'Cultural Troupe',
    },
  ];

  let index = 0;
  let timer;
  function go(i) { index = (i + moments.length) % moments.length; reset(); }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }
  function reset() {
    clearInterval(timer);
    timer = setInterval(() => (index = (index + 1) % moments.length), 6000);
  }
  onMount(reset);
  onDestroy(() => clearInterval(timer));
</script>

<section id="pillars" class="foundations">
  <div class="container grid">
    <!-- Left half: Four Pillars -->
    <div class="pillars-col">
      <p class="eyebrow">Foundations &amp; Moments</p>
      <h2>
        Four pillars,<br />
        <span class="italic">a living tradition.</span>
      </h2>
      <p class="lede">
        The foundations on which the summit is built — set beside moments
        from the life and court of Her Royal Majesty Queen Aruk II.
      </p>

      <ol class="pillars">
        {#each pillars as p, i}
          <li>
            <div class="idx">{String(i + 1).padStart(2, '0')}</div>
            <div class="body">
              <h3>{p.name}</h3>
              <p class="cap">{p.caption}</p>
              <p class="desc">{p.body}</p>
            </div>
          </li>
        {/each}
      </ol>
    </div>

    <!-- Right half: Carousel -->
    <div class="moments-col">
      <div class="stage">
        {#each moments as m, i}
          <div class="slide" class:on={i === index}>
            <img src={m.src} alt={m.title} />
            <div class="cap">
              <span class="tag">{m.where}</span>
              <span class="title">{m.title}</span>
            </div>
          </div>
        {/each}
        <button class="arrow prev" on:click={prev} aria-label="Previous moment">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="arrow next" on:click={next} aria-label="Next moment">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <div class="counter">
          <span class="cur">{String(index + 1).padStart(2, '0')}</span>
          <span class="sep">/</span>
          <span class="tot">{String(moments.length).padStart(2, '0')}</span>
        </div>
      </div>
      <div class="dots" role="tablist">
        {#each moments as _, i}
          <button class="dot" class:on={i === index} on:click={() => go(i)} aria-label="Moment {i + 1}" role="tab"></button>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .foundations {
    background: var(--paper);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: start;
  }

  /* Pillars side */
  h2 {
    font-size: clamp(2rem, 4.5vw, 3.25rem);
    font-weight: 400;
    line-height: 1.05;
    margin: 1rem 0 1.25rem;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.55;
    margin-bottom: 2.5rem;
    max-width: 44ch;
  }

  .pillars {
    list-style: none;
  }
  .pillars li {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 1.25rem;
    padding: 1.4rem 0;
    border-top: 1px solid var(--line);
  }
  .pillars li:last-child { border-bottom: 1px solid var(--line); }
  .idx {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta);
    font-size: 1rem;
    padding-top: 0.35rem;
  }
  .pillars h3 {
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 0.15rem;
    line-height: 1.1;
  }
  .pillars .cap {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--forest);
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  .pillars .desc {
    color: var(--ink-soft);
    font-size: 0.88rem;
    line-height: 1.55;
  }

  /* Moments side */
  .moments-col {
    position: sticky;
    top: 6rem;
  }
  .stage {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ink);
    box-shadow: 0 30px 70px -25px rgba(35, 28, 21, 0.4);
  }
  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1s ease;
  }
  .slide.on { opacity: 1; }
  .slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .slide .cap {
    position: absolute;
    left: 1.5rem;
    right: 1.5rem;
    bottom: 1.5rem;
    color: var(--cream);
    padding: 0;
  }
  .cap .tag {
    display: inline-block;
    background: var(--terracotta);
    color: var(--cream);
    padding: 0.3rem 0.7rem;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }
  .cap .title {
    display: block;
    font-family: var(--font-display);
    font-size: 1.7rem;
    line-height: 1.1;
    color: var(--cream);
    font-weight: 500;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 42px; height: 42px;
    border-radius: 50%;
    background: rgba(247, 241, 227, 0.92);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(6px);
  }
  .arrow:hover {
    background: var(--terracotta);
    color: var(--cream);
  }
  .prev { left: 1rem; }
  .next { right: 1rem; }

  .counter {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    font-family: var(--font-display);
    color: var(--cream);
    background: rgba(35, 28, 21, 0.55);
    backdrop-filter: blur(6px);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
  }
  .cur { color: var(--terracotta-bright); font-style: italic; }
  .sep { margin: 0 0.25rem; opacity: 0.5; }
  .tot { opacity: 0.7; }

  .dots {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1rem;
  }
  .dot {
    width: 28px;
    height: 2px;
    background: var(--line-strong);
    transition: all 0.25s ease;
  }
  .dot.on {
    background: var(--terracotta);
    width: 44px;
  }

  @media (max-width: 960px) {
    .grid { grid-template-columns: 1fr; gap: 3rem; }
    .moments-col { position: static; }
    .stage { aspect-ratio: 3 / 4; max-width: 480px; margin: 0 auto; }
  }
</style>
