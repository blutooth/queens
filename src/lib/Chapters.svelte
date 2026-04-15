<script>
  import { onMount, onDestroy } from 'svelte';

  const chapters = [
    {
      idx: '01',
      eyebrow: 'The Convocation',
      title: 'A hundred queens in England',
      body: 'Eighteen days across London and Oxford, gathering 100 queens of Africa and the Diaspora with first-class kings, scholars, and humanitarian leaders.',
      href: '#summit',
      cta: 'Explore the summit',
    },
    {
      idx: '02',
      eyebrow: 'The Convener',
      title: 'Her Royal Majesty, Queen Aruk II',
      body: 'Obonganwan Marie Erete — convener of the summit, founder of the ARUK II Humanitarian Services, and architect of the global movement it inaugurates.',
      href: '#convener',
      cta: 'Meet the convener',
    },
    {
      idx: '03',
      eyebrow: 'The Four Pillars',
      title: 'Unity · Legacy · Sovereignty · Empowerment',
      body: 'The foundations on which the summit and the movement are built — a framework for the convocation and the gatherings that will follow it.',
      href: '#pillars',
      cta: 'Read the pillars',
    },
    {
      idx: '04',
      eyebrow: 'The Venues',
      title: 'Porchester Hall · Hawkhill Place · Oxford',
      body: 'A grand London ballroom for the ceremonies, a country residence for the queens, and a capacity-building course at the University of Oxford.',
      href: '#venue',
      cta: 'See the venues',
    },
    {
      idx: '05',
      eyebrow: 'The Lineage',
      title: 'Three thousand years of queenship',
      body: 'From Nefertiti and Makeda to Nzinga and Yaa Asantewaa — the matriarchs whose reigns make this convocation possible.',
      href: '#lineage',
      cta: 'Meet the matriarchs',
    },
    {
      idx: '06',
      eyebrow: 'The Programme',
      title: 'Eighteen days, six movements',
      body: 'From the opening processional through the Oxford convocation to the closing gala — the full arc of the summit across two historic cities.',
      href: '#programme',
      cta: 'View the programme',
    },
  ];

  let index = 0;
  let timer;
  function next() { index = (index + 1) % chapters.length; reset(); }
  function prev() { index = (index - 1 + chapters.length) % chapters.length; reset(); }
  function go(i) { index = i; reset(); }
  function reset() {
    clearInterval(timer);
    timer = setInterval(() => (index = (index + 1) % chapters.length), 8000);
  }
  onMount(reset);
  onDestroy(() => clearInterval(timer));
</script>

<section id="chapters" class="chapters">
  <div class="container grid">
    <div class="side">
      <p class="eyebrow">Chapters of the Summit</p>
      <h2>Six<br /><span class="italic">ways in.</span></h2>
      <p class="lede">
        A navigator for the summit — each chapter opens onto the full section below.
      </p>

      <div class="controls">
        <button class="arrow" on:click={prev} aria-label="Previous chapter">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="count">
          <span class="cur">{chapters[index].idx}</span>
          <span class="tot">/ 06</span>
        </div>
        <button class="arrow" on:click={next} aria-label="Next chapter">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="dots" role="tablist">
        {#each chapters as _, i}
          <button class="dot" class:on={i === index} on:click={() => go(i)} aria-label="Chapter {i + 1}" role="tab"></button>
        {/each}
      </div>
    </div>

    <div class="stage">
      {#each chapters as c, i}
        <article class="slide" class:on={i === index} aria-hidden={i !== index}>
          <div class="k-row">
            <span class="k-idx">{c.idx}</span>
            <span class="k-eb">{c.eyebrow}</span>
          </div>
          <h3>{c.title}</h3>
          <p>{c.body}</p>
          <a href={c.href} class="cta">{c.cta} →</a>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .chapters {
    background: var(--paper);
    padding-top: 5rem;
    padding-bottom: 5rem;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 4rem;
    align-items: start;
  }

  /* Side */
  h2 {
    font-size: clamp(2.5rem, 5.5vw, 4.25rem);
    font-weight: 400;
    line-height: 0.95;
    margin: 1rem 0 1.25rem;
  }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .lede {
    color: var(--ink-soft);
    font-size: 1rem;
    max-width: 30ch;
    margin-bottom: 2.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .arrow {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--line-strong);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  .arrow:hover {
    background: var(--ink);
    color: var(--cream);
    border-color: var(--ink);
  }
  .count {
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 0.08em;
    color: var(--ink);
  }
  .cur { color: var(--terracotta); font-style: italic; }
  .tot { color: var(--muted); margin-left: 0.35rem; }

  .dots {
    display: flex;
    gap: 0.4rem;
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

  /* Stage */
  .stage {
    position: relative;
    min-height: 280px;
    padding: 2.5rem 2.75rem;
    background: var(--paper-soft);
    border-radius: 4px;
    overflow: hidden;
  }
  .slide {
    position: absolute;
    inset: 2.5rem 2.75rem;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.55s ease, transform 0.55s ease;
    pointer-events: none;
  }
  .slide.on {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
    position: relative;
    inset: auto;
  }
  .k-row {
    display: flex;
    gap: 0.9rem;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  .k-idx {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--terracotta);
    font-size: 1.05rem;
  }
  .k-eb {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--muted);
    padding-left: 0.9rem;
    border-left: 1px solid var(--line-strong);
    font-weight: 500;
  }
  h3 {
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 400;
    line-height: 1.05;
    margin-bottom: 1rem;
    color: var(--ink);
  }
  .slide p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 1.75rem;
    max-width: 58ch;
  }
  .cta {
    display: inline-block;
    color: var(--ink);
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 0.25rem;
    transition: all 0.2s ease;
  }
  .cta:hover {
    color: var(--terracotta);
    border-color: var(--terracotta);
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; gap: 2rem; }
    .stage { min-height: 320px; padding: 2rem; }
    .slide { inset: 2rem; }
  }
  @media (max-width: 520px) {
    .stage { padding: 1.75rem 1.5rem; }
    .slide { inset: 1.75rem 1.5rem; }
  }
</style>
