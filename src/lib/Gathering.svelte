<script>
  import { onMount, onDestroy } from 'svelte';
  import { dignitaries } from './queens.js';
  import { asset } from './asset.js';

  const moments = [
    {
      src: asset('/images/ipada-diaspora.jpg'),
      tag: 'IPADA Convocation',
      caption: 'Royal delegation at the IPADA Diaspora Global Conference',
    },
    {
      src: asset('/images/queen-aruk-ii-canopy.jpg'),
      tag: 'Ndebele Anniversary',
      caption: 'Queen Aruk II at the Kwajekejeke cultural village, South Africa',
    },
    {
      src: asset('/images/dancers.jpg'),
      tag: 'Cultural Troupe',
      caption: 'Ceremonial dancers in full regalia',
    },
    {
      src: asset('/images/queen-aruk-ii-portrait.jpg'),
      tag: 'Royal Portrait',
      caption: 'In processional regalia',
    },
  ];

  function initials(name) {
    return name
      .replace(/^(The|His|Her|Dr|Chief|Sir|Lady)\s+/i, '')
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

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

<section id="dignitaries" class="gathering">
  <div class="container">
    <header>
      <p class="eyebrow">The royal houses gather</p>
      <h2>
        Building on a continental<br />
        <span class="italic">legacy of convening.</span>
      </h2>
      <p class="sub">
        The summit follows the celebrated <strong>IPADA convocation in Nigeria</strong> —
        a gathering of queens, kings, and traditional rulers from across Africa
        and the Diaspora. The images that follow are drawn from previous
        convenings of this movement.
      </p>
    </header>

    <div class="split">
      <!-- Carousel of event photography -->
      <div class="visuals">
        <div class="stage">
          {#each moments as m, i}
            <div class="slide" class:on={i === index}>
              <img src={m.src} alt={m.caption} />
              <div class="cap">
                <span class="tag">{m.tag}</span>
                <span class="cap-text">{m.caption}</span>
              </div>
            </div>
          {/each}
          <button class="arrow prev" on:click={prev} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <button class="arrow next" on:click={next} aria-label="Next">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="count">
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
        <p class="img-note">Photography from previous convenings · new summit imagery to follow</p>
      </div>

      <!-- Attendees list -->
      <div class="attendees">
        <div class="a-head">Invited royal houses</div>
        <div class="list">
          {#each dignitaries as d, i}
            <div class="row">
              <div class="seal">{initials(d.name)}</div>
              <div class="names">
                <div class="hrm">{d.honorific}</div>
                <div class="nm">{d.name}</div>
                <div class="rg">{d.region}</div>
              </div>
              <span class="status" class:confirmed={d.status === 'Confirmed'} class:convener={d.status === 'Convener'}>
                {d.status}
              </span>
            </div>
          {/each}
        </div>
        <p class="a-foot">
          Additional royal houses are finalising their delegations.
          The official list of attendees will be published in the summit programme.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .gathering {
    background: var(--paper-soft);
  }

  header {
    max-width: 820px;
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
    line-height: 1.6;
    max-width: 640px;
    margin: 0 auto;
  }
  .sub strong { color: var(--terracotta); font-weight: 500; }

  .split {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 3rem;
    align-items: start;
  }

  /* Carousel */
  .visuals { position: sticky; top: 6rem; }
  .stage {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ink);
    box-shadow: 0 30px 70px -25px rgba(35, 28, 21, 0.35);
  }
  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1s ease;
  }
  .slide.on { opacity: 1; }
  .slide img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .slide .cap {
    position: absolute;
    left: 1.5rem;
    right: 1.5rem;
    bottom: 1.5rem;
    color: var(--cream);
  }
  .cap .tag {
    display: inline-block;
    background: var(--terracotta);
    color: var(--cream);
    padding: 0.3rem 0.7rem;
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.65rem;
  }
  .cap-text {
    display: block;
    font-family: var(--font-display);
    font-size: 1.15rem;
    line-height: 1.25;
    color: var(--cream);
    max-width: 28ch;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(247, 241, 227, 0.92);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(6px);
  }
  .arrow:hover { background: var(--terracotta); color: var(--cream); }
  .prev { left: 1rem; }
  .next { right: 1rem; }
  .count {
    position: absolute;
    top: 1.1rem;
    right: 1.1rem;
    font-family: var(--font-display);
    color: var(--cream);
    background: rgba(35, 28, 21, 0.5);
    backdrop-filter: blur(6px);
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    font-size: 0.82rem;
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
  .dot.on { background: var(--terracotta); width: 44px; }

  .img-note {
    text-align: center;
    font-size: 0.78rem;
    color: var(--muted);
    margin-top: 1rem;
    font-family: var(--font-display);
    font-style: italic;
  }

  /* Attendees */
  .a-head {
    font-size: 0.7rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--terracotta);
    font-weight: 500;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--line);
  }

  .list {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: grid;
    grid-template-columns: 42px 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-top: 1px solid var(--line);
  }
  .row:first-child { border-top: none; padding-top: 0; }
  .seal {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--terracotta-bright);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 500;
  }
  .hrm {
    font-size: 0.58rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.15rem;
  }
  .nm {
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--ink);
    line-height: 1.15;
  }
  .rg {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    margin-top: 0.15rem;
  }
  .status {
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--line-strong);
    color: var(--muted);
    border-radius: 999px;
    font-weight: 500;
    background: var(--paper);
  }
  .status.confirmed {
    color: var(--forest);
    border-color: var(--forest);
  }
  .status.convener {
    background: var(--terracotta-bright);
    border-color: var(--terracotta-bright);
    color: var(--ink);
  }

  .a-foot {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
    font-size: 0.85rem;
    font-family: var(--font-display);
    font-style: italic;
    color: var(--muted);
    line-height: 1.55;
  }

  @media (max-width: 960px) {
    .split { grid-template-columns: 1fr; gap: 2.5rem; }
    .visuals { position: static; }
    .stage { aspect-ratio: 3 / 4; max-width: 520px; margin: 0 auto; }
  }
</style>
