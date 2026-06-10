<script>
  import { packages, itinerary, extras } from './queens.js';

  const phone = '447932506556';
  const waLink = (msg) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  const packLink = (name, price) =>
    waLink(`Hello — I would like to book the ${name} package (£${price}) at the African Queens Summit, 14–31 August 2026.`);

  let tab = 'events';
</script>

<!-- Sticky tab bar — the very top of the page -->
<div class="tabbar">
  <div class="container">
    <div class="tabs">
      <button class:active={tab === 'events'} on:click={() => (tab = 'events')}>Events</button>
      <button class:active={tab === 'pricing'} on:click={() => (tab = 'pricing')}>Pricing</button>
    </div>
  </div>
</div>

<section class="panel">
  <div class="container">
    {#if tab === 'events'}
      <header>
        <p class="eyebrow">The programme · 14 – 31 August</p>
        <h2>Seventeen days, <span class="italic">one convocation.</span></h2>
        <p class="sub">Each engagement at a special summit rate — a saving on the individual price. Flagship engagements are marked ♕.</p>
      </header>

      <div class="egrid">
        {#each itinerary as d}
          <article class="ecard" class:flagship={d.flagship}>
            <div class="ecard-img">
              <img src={d.image} alt={d.title} loading="lazy" />
              {#if d.flagship}<span class="flag-tag">♕ Flagship</span>{/if}
            </div>
            <div class="ecard-body">
              <span class="ecard-date">{d.date}</span>
              <h3>{d.title}</h3>
              <p>{d.detail}</p>
              <div class="ecard-price">
                {#if typeof d.price === 'number'}
                  <span class="conf">£{d.price}</span>
                  {#if d.retail}
                    <span class="rrp">£{d.retail}</span>
                    <span class="save">Save £{d.retail - d.price}</span>
                  {/if}
                {:else if d.price}
                  <span class="label">{d.price}</span>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <header>
        <p class="eyebrow">Registration packages</p>
        <h2>Choose <span class="italic">your seat.</span></h2>
        <p class="sub">Every package includes the three flagship engagements — Oxford, the Royal Gala and Buckingham Palace — at a saving on the individual rate.</p>
      </header>

      <div class="pgrid">
        {#each packages as p}
          <article class="pack" class:featured={p.featured} class:premium={p.premium}>
            {#if p.premium}<div class="ribbon premium-ribbon">♕ Highest tier</div>
            {:else if p.featured}<div class="ribbon">Best value</div>{/if}
            <div class="pack-img">
              <img src={p.image} alt={p.name} loading="lazy" />
            </div>
            <div class="pack-body">
              <h3>{p.name}</h3>
              <div class="pack-price">
                <span class="amount">£{p.price}</span>
                {#if p.retail}<span class="rrp">£{p.retail}</span>{/if}
              </div>
              <div class="note">{p.note}</div>
              <p class="pbody">{p.body}</p>
              <a class="cta" href={packLink(p.name, p.price)} target="_blank" rel="noopener">Reserve →</a>
            </div>
          </article>
        {/each}
      </div>

      <div class="extras">
        <h4>Optional London attractions</h4>
        <ul>
          {#each extras as e}
            <li><span>{e.name}</span><span class="eprice">{e.price}</span></li>
          {/each}
        </ul>
      </div>

      <p class="footnote">All fees are indicative, per person, and confirmed individually by the Office of the Convener. Retail values shown for comparison.</p>
    {/if}
  </div>
</section>

<style>
  /* Sticky tab bar */
  .tabbar {
    position: sticky;
    top: 3.5rem;
    z-index: 30;
    background: rgba(247, 241, 227, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
    padding: 0.75rem 0;
  }
  .tabs {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.3rem;
    background: var(--paper-soft);
    border-radius: 999px;
    width: fit-content;
    margin: 0 auto;
  }
  .tabs button {
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--ink-soft);
    padding: 0.6rem 2.25rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .tabs button:hover { color: var(--ink); }
  .tabs button.active { background: var(--ink); color: var(--cream); }

  .panel { background: var(--paper); }

  header { text-align: center; max-width: 720px; margin: 0 auto 3.5rem; }
  h2 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 400; margin: 1rem 0 1rem; line-height: 1.05; }
  .italic { font-style: italic; color: var(--terracotta); font-weight: 300; }
  .sub {
    color: var(--ink-soft); font-family: var(--font-display); font-style: italic;
    font-size: 1.05rem; line-height: 1.5; max-width: 560px; margin: 0 auto;
  }

  /* Events gallery */
  .egrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
  }
  .ecard {
    background: var(--paper-soft);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .ecard:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -22px rgba(35, 28, 21, 0.28); }
  .ecard.flagship { outline: 2px solid var(--terracotta); outline-offset: -2px; }

  .ecard-img { position: relative; aspect-ratio: 4 / 3; overflow: hidden; background: var(--paper-deep); }
  .ecard-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .flag-tag {
    position: absolute; top: 0.75rem; left: 0.75rem;
    background: var(--terracotta); color: var(--cream);
    font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase;
    font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 3px;
  }

  .ecard-body { padding: 1.1rem 1.25rem 1.4rem; display: flex; flex-direction: column; flex-grow: 1; }
  .ecard-date {
    font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--terracotta); font-weight: 600;
  }
  .ecard-body h3 {
    font-family: var(--font-display); font-size: 1.25rem; font-weight: 400;
    margin: 0.35rem 0 0.4rem; line-height: 1.1;
  }
  .ecard-body p { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.45; flex-grow: 1; }

  .ecard-price {
    display: flex; align-items: baseline; gap: 0.55rem; flex-wrap: wrap;
    margin-top: 0.9rem; padding-top: 0.85rem; border-top: 1px solid var(--line);
  }
  .conf { font-family: var(--font-display); font-size: 1.5rem; color: var(--ink); line-height: 1; }
  .rrp { font-size: 0.95rem; color: var(--muted); text-decoration: line-through; }
  .save {
    font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700;
    background: var(--terracotta); color: var(--cream);
    padding: 0.2rem 0.5rem; border-radius: 3px; margin-left: auto;
  }
  .label {
    font-size: 0.66rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--terracotta); font-weight: 600;
  }

  /* Pricing — picture cards */
  .pgrid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem; max-width: 1100px; margin: 0 auto 2.5rem;
  }
  .pack {
    position: relative; background: var(--paper-soft); border-radius: 6px; overflow: hidden;
    display: flex; flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .pack:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -22px rgba(35, 28, 21, 0.24); }
  .pack.featured { outline: 1.5px solid var(--terracotta); outline-offset: -1.5px; }

  /* Highest tier — strongly emphasised */
  .pack.premium {
    outline: 3px solid var(--terracotta-bright);
    outline-offset: -3px;
    box-shadow: 0 22px 50px -20px rgba(200, 90, 46, 0.55);
    transform: scale(1.03);
  }
  .pack.premium:hover { transform: scale(1.03) translateY(-4px); }
  .pack.premium .pack-body { background: var(--ink); color: var(--cream); }
  .pack.premium .amount { color: var(--terracotta-bright); }
  .pack.premium .note { color: var(--terracotta-bright); }
  .pack.premium .pbody { color: rgba(250, 246, 234, 0.82); }
  .pack.premium .pack-price .rrp { color: rgba(250, 246, 234, 0.5); }

  .ribbon {
    position: absolute; top: 0.85rem; right: 0.85rem; z-index: 2;
    background: var(--terracotta-bright); color: var(--ink);
    padding: 0.3rem 0.7rem; font-size: 0.58rem; letter-spacing: 0.16em;
    text-transform: uppercase; font-weight: 700; border-radius: 3px; white-space: nowrap;
  }
  .premium-ribbon { background: var(--ink); color: var(--terracotta-bright); }
  .pack-img { aspect-ratio: 3 / 2; overflow: hidden; background: var(--paper-deep); }
  .pack-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pack-body { padding: 1.25rem 1.25rem 1.4rem; display: flex; flex-direction: column; flex-grow: 1; text-align: center; }
  .pack-body h3 { font-size: 1.05rem; font-weight: 500; margin-bottom: 0.5rem; }
  .pack-price { display: flex; align-items: baseline; justify-content: center; gap: 0.5rem; }
  .amount { font-family: var(--font-display); font-size: 2rem; color: var(--ink); line-height: 1; }
  .pack-price .rrp { font-size: 1rem; }
  .note { font-size: 0.72rem; color: var(--terracotta); margin: 0.5rem 0 0.7rem; min-height: 2.6em; }
  .pbody { font-size: 0.78rem; color: var(--ink-soft); line-height: 1.45; margin-bottom: 1.4rem; flex-grow: 1; }
  .cta {
    margin-top: auto; padding: 0.8rem 1rem; background: #25d366; color: #0b2a1f;
    border-radius: 999px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s ease;
  }
  .cta:hover { background: #30e377; transform: translateY(-1px); }

  .extras { max-width: 520px; margin: 0 auto 2.5rem; background: var(--paper-soft); border-radius: 6px; padding: 1.5rem 1.75rem; }
  .extras h4 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 400; margin-bottom: 0.75rem; }
  .extras ul { list-style: none; }
  .extras li { display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid var(--line); }
  .eprice { font-family: var(--font-display); color: var(--terracotta); }

  .footnote {
    max-width: 600px; margin: 0 auto; text-align: center; color: var(--muted);
    font-size: 0.85rem; font-family: var(--font-display); font-style: italic; line-height: 1.55;
  }

  @media (max-width: 900px) {
    .egrid { grid-template-columns: repeat(2, 1fr); }
    .pgrid { grid-template-columns: repeat(2, 1fr); }
    .note { min-height: 0; }
  }
  @media (max-width: 560px) {
    .egrid { grid-template-columns: 1fr; max-width: 380px; }
    .pgrid { grid-template-columns: 1fr; max-width: 320px; }
    .tabs button { padding: 0.6rem 1.6rem; }
  }
</style>
