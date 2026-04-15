<script>
  import { onMount, onDestroy } from 'svelte';
  import { asset } from './asset.js';

  const slides = [
    {
      image: asset('/images/queen-aruk-ii-throne.jpg'),
      tone: 'light',
      eyebrow: 'You are cordially invited',
      titleA: 'African',
      titleItalic: 'Queens',
      titleB: 'Summit',
      body: 'A historic convening of a hundred queens of Africa and the Diaspora, alongside first-class kings, scholars, and humanitarian leaders — across eighteen days in England.',
      cta: 'Reserve your place',
      ctaHref: '#rsvp',
      altCta: 'About the summit',
      altHref: '#summit',
      badge: 'England · 2026',
    },
    {
      image: asset('/images/queen-aruk-ii-portrait.jpg'),
      tone: 'light',
      eyebrow: 'The Convener',
      titleA: 'Her Royal',
      titleItalic: 'Majesty,',
      titleB: 'Queen Aruk II',
      body: 'Obonganwan Marie Erete — founder of ARUK II Humanitarian Services and architect of the African and Diaspora Queens movement. She convenes the summit and welcomes the royal houses of Africa to England.',
      cta: 'Meet the convener',
      ctaHref: '#convener',
      altCta: 'The four pillars',
      altHref: '#pillars',
      badge: 'Royalty Defined by Impact',
    },
    {
      image: asset('/images/matriarchs/nzinga.jpg'),
      tone: 'warm',
      eyebrow: 'Three thousand years of queenship',
      titleA: 'The',
      titleItalic: 'matriarchs',
      titleB: 'we honour',
      body: 'From Nefertiti and Makeda to Amanirenas, Nzinga, and Yaa Asantewaa — the ancestors whose reigns make this convocation possible. The summit carries their inheritance forward.',
      cta: 'Meet the matriarchs',
      ctaHref: '#lineage',
      altCta: 'Read the pillars',
      altHref: '#pillars',
      badge: 'A lineage of seven',
    },
    {
      image: asset('/images/porchester-1.jpg'),
      tone: 'dark',
      eyebrow: 'The London Ceremonies',
      titleA: 'A grand',
      titleItalic: 'Edwardian',
      titleB: 'ballroom',
      body: 'Porchester Hall in the heart of London — a gilded stage with capacity for 500 — hosts the opening processional, the royal receptions, and the closing gala of the convocation.',
      cta: 'See the venues',
      ctaHref: '#venue',
      altCta: 'View the programme',
      altHref: '#programme',
      badge: 'London · Bayswater',
    },
    {
      image: asset('/images/hawkhill-grounds.png'),
      tone: 'light',
      eyebrow: 'The Residence',
      titleA: 'A country',
      titleItalic: 'retreat',
      titleB: 'for the queens',
      body: 'Hawkhill Place, an eight-bedroom Oxfordshire estate with private grounds and spa facilities — the residential home of the summit for its eighteen days in England.',
      cta: 'Visit the residence',
      ctaHref: '#venue',
      altCta: 'About the summit',
      altHref: '#summit',
      badge: 'Oxfordshire',
    },
    {
      image: asset('/images/oxford-colleges.jpg'),
      tone: 'dark',
      eyebrow: 'The Academy',
      titleA: 'A course at',
      titleItalic: 'Oxford',
      titleB: '',
      body: 'A bespoke capacity-building curriculum at one of the world\'s oldest universities — lectures, symposia, and an honorary convocation under the spires of Oxford.',
      cta: 'Explore the programme',
      ctaHref: '#programme',
      altCta: 'See the venues',
      altHref: '#venue',
      badge: 'University of Oxford',
    },
  ];

  let index = 0;
  let timer;
  function go(i) { index = (i + slides.length) % slides.length; reset(); }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }
  function reset() {
    clearInterval(timer);
    timer = setInterval(() => (index = (index + 1) % slides.length), 7500);
  }
  onMount(reset);
  onDestroy(() => clearInterval(timer));

  function onKey(e) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }

  $: cur = slides[index];
</script>

<svelte:window on:keydown={onKey} />

<section id="top" class="hero">
  <!-- Image layers (crossfade) -->
  <div class="layers" aria-hidden="true">
    {#each slides as s, i}
      <div class="layer" class:on={i === index}>
        <img src={s.image} alt="" />
        <div class="scrim"></div>
      </div>
    {/each}
  </div>

  <div class="container grid">
    <!-- Text carousel, synchronised with image -->
    <div class="copy">
      {#each slides as s, i}
        <div class="slide" class:on={i === index} aria-hidden={i !== index}>
          <p class="eyebrow">{s.eyebrow}</p>
          <h1>
            <span>{s.titleA}</span>
            {#if s.titleItalic}<span class="italic">{s.titleItalic}</span>{/if}
            {#if s.titleB}<span>{s.titleB}</span>{/if}
          </h1>
          <p class="body">{s.body}</p>
          <div class="badge">{s.badge}</div>
          <div class="actions">
            <a href={s.ctaHref} class="btn primary">{s.cta} →</a>
            <a href={s.altHref} class="btn ghost">{s.altCta}</a>
          </div>
        </div>
      {/each}
    </div>

    <!-- Portrait panel -->
    <aside class="panel">
      <div class="card">
        <div class="card-inner">
          <div class="mono">
            <span class="mono-1">Queen Aruk II</span>
            <span class="mono-2">Summit Convener</span>
          </div>
          <div class="facts">
            <div class="f">
              <div class="k">Dates</div>
              <div class="v">14 – 31 August 2026</div>
            </div>
            <div class="f">
              <div class="k">Cities</div>
              <div class="v">London &amp; Oxford</div>
            </div>
            <div class="f">
              <div class="k">Convocation</div>
              <div class="v">100 Queens &amp; First-Class Kings</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <button class="arrow" on:click={prev} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <div class="count">
          <span class="cur">{String(index + 1).padStart(2, '0')}</span>
          <span class="sep">/</span>
          <span class="tot">{String(slides.length).padStart(2, '0')}</span>
        </div>
        <button class="arrow" on:click={next} aria-label="Next">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="dots" role="tablist">
        {#each slides as _, i}
          <button class="dot" class:on={i === index} on:click={() => go(i)} aria-label="Slide {i + 1}" role="tab"></button>
        {/each}
      </div>
    </aside>
  </div>

  <div class="marquee" aria-hidden="true">
    <div class="track">
      {#each Array(3) as _}
        <span>Inspire</span><span class="sep">◈</span>
        <span>Empower</span><span class="sep">◈</span>
        <span>Unite</span><span class="sep">◈</span>
        <span>Unity</span><span class="sep">◈</span>
        <span>Legacy</span><span class="sep">◈</span>
        <span>Sovereignty</span><span class="sep">◈</span>
        <span>Empowerment</span><span class="sep">◈</span>
      {/each}
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: min(880px, 100vh);
    padding: 8rem 0 0;
    overflow: hidden;
    background: var(--ink);
    color: var(--cream);
    display: flex;
    flex-direction: column;
  }

  /* Background image layers */
  .layers { position: absolute; inset: 0; z-index: 0; }
  .layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1.4s ease;
  }
  .layer.on { opacity: 1; }
  .layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(1.05);
  }
  .scrim {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(100deg, rgba(20, 12, 8, 0.85) 0%, rgba(20, 12, 8, 0.55) 45%, rgba(20, 12, 8, 0.15) 100%),
      linear-gradient(180deg, rgba(20, 12, 8, 0.4) 0%, transparent 40%, rgba(20, 12, 8, 0.5) 100%);
  }

  .grid {
    position: relative;
    z-index: 1;
    flex: 1;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 3rem;
    align-items: center;
    padding-top: 1rem;
    padding-bottom: 5rem;
  }

  /* Text slides — stacked via CSS Grid so the tallest slide
     sets the height and none overflow into the marquee. */
  .copy {
    display: grid;
    grid-template-columns: 1fr;
  }
  .slide {
    grid-area: 1 / 1;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.7s ease, transform 0.7s ease;
    pointer-events: none;
  }
  .slide.on {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .eyebrow {
    color: var(--terracotta-bright);
    margin-bottom: 1.5rem;
  }
  h1 {
    font-family: var(--font-display);
    font-size: clamp(3rem, 8vw, 6.5rem);
    font-weight: 400;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--cream);
    margin: 0 0 2rem;
  }
  h1 span { display: block; }
  .italic {
    font-style: italic;
    font-weight: 300;
    color: var(--terracotta-bright);
  }

  .body {
    font-size: 1.15rem;
    color: rgba(250, 246, 234, 0.85);
    line-height: 1.55;
    max-width: 560px;
    margin-bottom: 1.75rem;
  }

  .badge {
    display: inline-block;
    padding: 0.4rem 0.9rem;
    background: rgba(250, 246, 234, 0.12);
    border: 1px solid rgba(250, 246, 234, 0.25);
    color: var(--cream);
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    backdrop-filter: blur(6px);
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .btn {
    padding: 1rem 1.75rem;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    border-radius: 999px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .primary {
    background: var(--terracotta);
    color: var(--cream);
  }
  .primary:hover {
    background: var(--terracotta-bright);
    color: var(--cream);
    transform: translateY(-1px);
  }
  .ghost {
    border-color: rgba(250, 246, 234, 0.4);
    color: var(--cream);
  }
  .ghost:hover {
    border-color: var(--cream);
    background: rgba(250, 246, 234, 0.08);
  }

  /* Side panel */
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-self: stretch;
    justify-content: flex-end;
  }

  .card {
    background: rgba(20, 12, 8, 0.5);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(250, 246, 234, 0.18);
    border-radius: 4px;
    padding: 1.5rem;
  }
  .card-inner {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .mono {
    padding-bottom: 1.25rem;
    border-bottom: 1px solid rgba(250, 246, 234, 0.15);
    display: flex;
    flex-direction: column;
  }
  .mono-1 {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta-bright);
    font-size: 1.15rem;
  }
  .mono-2 {
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(250, 246, 234, 0.75);
    margin-top: 0.3rem;
  }

  .facts {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
  .k {
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--terracotta-bright);
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  .v {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--cream);
    line-height: 1.2;
  }

  /* Controls */
  .ctrl {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 0.5rem;
  }
  .arrow {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(250, 246, 234, 0.35);
    color: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: rgba(20, 12, 8, 0.35);
    backdrop-filter: blur(8px);
  }
  .arrow:hover {
    background: var(--terracotta);
    border-color: var(--terracotta);
  }
  .count {
    flex: 1;
    font-family: var(--font-display);
    letter-spacing: 0.1em;
    font-size: 1rem;
    color: var(--cream);
    text-align: center;
  }
  .cur { color: var(--terracotta-bright); font-style: italic; }
  .sep { margin: 0 0.5rem; opacity: 0.4; }
  .tot { color: rgba(250, 246, 234, 0.6); }

  .dots {
    display: flex;
    gap: 0.35rem;
    padding: 0 0.5rem;
  }
  .dot {
    flex: 1;
    height: 2px;
    background: rgba(250, 246, 234, 0.25);
    transition: background 0.25s ease;
  }
  .dot.on { background: var(--terracotta-bright); }

  /* Marquee */
  .marquee {
    position: relative;
    z-index: 2;
    overflow: hidden;
    padding: 1.1rem 0;
    background: rgba(20, 12, 8, 0.6);
    border-top: 1px solid rgba(250, 246, 234, 0.12);
    border-bottom: 1px solid rgba(250, 246, 234, 0.12);
    backdrop-filter: blur(4px);
    display: flex;
  }
  .track {
    display: flex;
    gap: 2rem;
    white-space: nowrap;
    animation: slide 50s linear infinite;
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.3rem;
    color: var(--cream);
  }
  .track .sep { color: var(--terracotta-bright); opacity: 0.7; margin: 0; }
  @keyframes slide {
    to { transform: translateX(-33.33%); }
  }

  @media (max-width: 960px) {
    .hero { min-height: 0; padding-top: 7rem; }
    .grid { grid-template-columns: 1fr; gap: 2rem; padding-bottom: 4rem; }
    .panel { order: 2; }
  }
  @media (max-width: 560px) {
    h1 { font-size: clamp(2.5rem, 11vw, 4rem); }
    .body { font-size: 1rem; }
    .btn { padding: 0.9rem 1.3rem; font-size: 0.8rem; }
  }
</style>
