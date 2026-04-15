<script>
  import { onMount, onDestroy } from 'svelte';
  import { asset } from './asset.js';

  const slides = [
    {
      src: asset('/images/queen-aruk-ii-throne.jpg'),
      tag: 'Studio · Royal Portrait',
      title: 'The Throne of Aruk II',
      note: 'Seated in purple velvet and gold, holding the royal fan and staff',
    },
    {
      src: asset('/images/queen-aruk-ii-canopy.jpg'),
      tag: 'Kwajekejeke Cultural Village · South Africa',
      title: 'The Ndebele Convocation',
      note: '40th Anniversary of King Silamba of the Ndebele kingdom',
    },
    {
      src: asset('/images/queen-aruk-ii-portrait.jpg'),
      tag: 'Throne Room · Processional Regalia',
      title: 'In Full Regalia',
      note: 'White lace over purple, embroidered vest, royal staff and fan',
    },
    {
      src: asset('/images/queen-aruk-ii-closeup.jpg'),
      tag: 'Royal Portrait · Close',
      title: 'Coral & Crown',
      note: 'Tiara and layered coral beads of the Efik court',
    },
    {
      src: asset('/images/dancers.jpg'),
      tag: 'Cultural Troupe',
      title: 'Ceremonial Dance',
      note: 'The court dancers in purple-and-gold ceremonial dress',
    },
  ];

  let index = 0;
  let interval;

  function next() { index = (index + 1) % slides.length; reset(); }
  function prev() { index = (index - 1 + slides.length) % slides.length; reset(); }
  function go(i) { index = i; reset(); }

  function reset() {
    clearInterval(interval);
    interval = setInterval(() => (index = (index + 1) % slides.length), 6500);
  }

  onMount(() => { reset(); });
  onDestroy(() => clearInterval(interval));

  function onKey(e) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }
</script>

<svelte:window on:keydown={onKey} />

<section id="gallery" class="gallery">
  <div class="container">
    <header>
      <p class="eyebrow">A living tradition</p>
      <h2>
        Ceremony, community,<br />
        <span class="italic">continuity.</span>
      </h2>
      <p class="sub">
        Moments from the life and court of Her Royal Majesty Queen Aruk II —
        the convener whose vision brings the summit to England.
      </p>
    </header>

    <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Queen Aruk II — photo carousel">
      <div class="stage">
        <div class="track" style="transform: translateX(-{index * 100}%)">
          {#each slides as s, i}
            <div class="slide" aria-hidden={index !== i}>
              <img src={s.src} alt={s.title} />
              <div class="caption">
                <div class="cap-inner">
                  <span class="tag">{s.tag}</span>
                  <div class="title">{s.title}</div>
                  <div class="note">{s.note}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <button class="arrow prev" on:click={prev} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="arrow next" on:click={next} aria-label="Next">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="counter">
          <span class="current">{String(index + 1).padStart(2, '0')}</span>
          <span class="sep">/</span>
          <span class="total">{String(slides.length).padStart(2, '0')}</span>
        </div>
      </div>

      <div class="dots" role="tablist">
        {#each slides as _, i}
          <button
            class="dot"
            class:on={i === index}
            on:click={() => go(i)}
            aria-label="Slide {i + 1}"
            aria-selected={i === index}
            role="tab"
          ></button>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .gallery {
    background: var(--paper);
  }

  header {
    max-width: 720px;
    margin: 0 auto 4rem;
    text-align: center;
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
    font-size: 1.05rem;
    line-height: 1.55;
    max-width: 540px;
    margin: 0 auto;
  }

  .carousel {
    max-width: 1100px;
    margin: 0 auto;
  }

  .stage {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ink);
    box-shadow: 0 40px 80px -30px rgba(35, 28, 21, 0.4);
  }

  .track {
    display: flex;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
    will-change: transform;
  }
  .slide {
    flex: 0 0 100%;
    position: relative;
    height: 100%;
  }
  .slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(1.05) contrast(1.02);
  }

  .caption {
    position: absolute;
    inset: auto 0 0 0;
    padding: 3.5rem 2.5rem 2.25rem;
    background: linear-gradient(180deg, transparent, rgba(35, 28, 21, 0.85));
    color: var(--cream);
  }
  .cap-inner {
    max-width: 640px;
  }
  .tag {
    display: inline-block;
    background: var(--terracotta);
    color: var(--cream);
    padding: 0.35rem 0.8rem;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.85rem;
  }
  .title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 2.8vw, 2.2rem);
    line-height: 1.1;
    color: var(--cream);
    margin-bottom: 0.4rem;
    font-weight: 500;
  }
  .note {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1rem;
    color: rgba(250, 246, 234, 0.85);
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
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
  .arrow.prev { left: 1.25rem; }
  .arrow.next { right: 1.25rem; }

  .counter {
    position: absolute;
    top: 1.5rem;
    right: 1.75rem;
    font-family: var(--font-display);
    color: var(--cream);
    font-size: 0.95rem;
    letter-spacing: 0.1em;
    background: rgba(35, 28, 21, 0.5);
    backdrop-filter: blur(6px);
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
  }
  .current { color: var(--terracotta-bright); font-style: italic; }
  .sep { margin: 0 0.35rem; opacity: 0.5; }
  .total { opacity: 0.8; }

  .dots {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 1.75rem;
  }
  .dot {
    width: 36px;
    height: 3px;
    background: var(--line-strong);
    border-radius: 2px;
    transition: background 0.25s ease, width 0.25s ease;
  }
  .dot.on {
    background: var(--terracotta);
    width: 52px;
  }

  @media (max-width: 640px) {
    .stage { aspect-ratio: 4 / 5; }
    .caption { padding: 2.5rem 1.25rem 1.5rem; }
    .arrow { width: 40px; height: 40px; }
    .arrow.prev { left: 0.75rem; }
    .arrow.next { right: 0.75rem; }
    .counter { top: 1rem; right: 1rem; font-size: 0.85rem; }
    .dot { width: 24px; }
    .dot.on { width: 36px; }
  }
</style>
