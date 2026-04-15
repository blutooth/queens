<script>
  import { tiers } from './queens.js';

  const phone = '447932506556';
  function waLink(tierName, price) {
    const msg = `Hello — I would like to reserve a ${tierName} place (${price}) at the African Queens Summit, 14–31 August 2026, London & Oxford.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }
</script>

<section id="pricing" class="pricing">
  <div class="container">
    <header>
      <p class="eyebrow">Registration tiers</p>
      <h2>
        Three ways to<br />
        <span class="italic">take your seat.</span>
      </h2>
      <p class="sub">
        Tap your tier below to open a WhatsApp chat with the Convener — the
        message is prefilled with your selection.
      </p>
    </header>

    <div class="grid">
      {#each tiers as t}
        <article class="tier" class:featured={t.featured}>
          {#if t.featured}<div class="ribbon">Most chosen</div>{/if}
          <div class="tag">{t.tag}</div>
          <h3>{t.name}</h3>
          <div class="price">
            <span class="amount">{t.price}</span>
            <span class="unit">per place</span>
          </div>
          <p class="desc">{t.body}</p>
          <ul>
            {#each t.includes as i}
              <li><span class="check">◈</span>{i}</li>
            {/each}
          </ul>
          <a
            class="cta"
            href={waLink(t.name, t.price)}
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.44 1.66 6.3L3 29l6.92-1.62A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.13 15.69c-.34-.17-1.99-.98-2.3-1.09-.31-.11-.53-.17-.76.17-.22.33-.87 1.09-1.06 1.3-.2.22-.39.24-.72.08-.34-.17-1.43-.52-2.72-1.66a10.28 10.28 0 0 1-1.9-2.36c-.2-.34 0-.52.15-.68.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.6-.09-.17-.76-1.85-1.05-2.53-.27-.66-.55-.57-.76-.58l-.65-.01a1.25 1.25 0 0 0-.9.42c-.3.33-1.17 1.15-1.17 2.8 0 1.66 1.2 3.25 1.37 3.48.17.22 2.37 3.62 5.75 5.07.8.34 1.43.54 1.92.7.8.26 1.54.22 2.11.13.64-.1 1.99-.81 2.27-1.6.28-.78.28-1.46.2-1.6-.08-.14-.3-.22-.64-.39z"/>
            </svg>
            Reserve on WhatsApp →
          </a>
        </article>
      {/each}
    </div>

    <p class="footnote">
      Prices are indicative and exclusive of VAT. Group rates for royal delegations
      of four or more are available on request from the Office of the Convener.
    </p>
  </div>
</section>

<style>
  .pricing {
    background: var(--paper);
  }

  header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 4rem;
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
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.05rem;
    line-height: 1.5;
    max-width: 520px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .tier {
    position: relative;
    background: var(--paper-soft);
    border-radius: 4px;
    padding: 2.25rem 1.75rem 2rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .tier:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px -20px rgba(35, 28, 21, 0.18);
  }
  .tier.featured {
    background: var(--ink);
    color: var(--cream);
    transform: scale(1.02);
  }
  .tier.featured:hover { transform: translateY(-4px) scale(1.02); }

  .ribbon {
    position: absolute;
    top: -10px;
    right: 1.5rem;
    background: var(--terracotta-bright);
    color: var(--ink);
    padding: 0.3rem 0.75rem;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 600;
    border-radius: 2px;
  }

  .tag {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--terracotta);
    font-weight: 500;
    margin-bottom: 0.75rem;
  }
  .tier.featured .tag { color: var(--terracotta-bright); }

  h3 {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1;
    margin-bottom: 1rem;
  }
  .tier.featured h3 { color: var(--cream); }

  .price {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding-bottom: 1.25rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--line);
  }
  .tier.featured .price { border-bottom-color: rgba(250, 246, 234, 0.15); }
  .amount {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 400;
    color: var(--ink);
    font-variation-settings: 'opsz' 144;
  }
  .tier.featured .amount { color: var(--terracotta-bright); }
  .unit {
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    color: var(--muted);
  }
  .tier.featured .unit { color: rgba(250, 246, 234, 0.6); }

  .desc {
    font-size: 0.95rem;
    color: var(--ink-soft);
    line-height: 1.55;
    margin-bottom: 1.5rem;
  }
  .tier.featured .desc { color: rgba(250, 246, 234, 0.82); }

  ul {
    list-style: none;
    margin-bottom: 1.75rem;
  }
  li {
    display: flex;
    gap: 0.6rem;
    padding: 0.45rem 0;
    font-size: 0.88rem;
    color: var(--ink);
    border-top: 1px solid var(--line);
    align-items: center;
  }
  .tier.featured li {
    color: rgba(250, 246, 234, 0.9);
    border-top-color: rgba(250, 246, 234, 0.1);
  }
  li:first-child { border-top: none; }
  .check {
    color: var(--terracotta);
    font-size: 0.75rem;
  }
  .tier.featured .check { color: var(--terracotta-bright); }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
    padding: 1rem 1.25rem;
    background: #25d366;
    color: #0b2a1f;
    border-radius: 999px;
    font-size: 0.88rem;
    font-weight: 600;
    transition: all 0.2s ease;
    border: 1px solid #25d366;
  }
  .cta:hover {
    background: #30e377;
    border-color: #30e377;
    color: #0b2a1f;
    transform: translateY(-1px);
    box-shadow: 0 14px 32px -10px rgba(37, 211, 102, 0.4);
  }

  .footnote {
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
    color: var(--muted);
    font-size: 0.85rem;
    font-family: var(--font-display);
    font-style: italic;
    line-height: 1.55;
  }

  @media (max-width: 960px) {
    .grid { grid-template-columns: 1fr; gap: 1.25rem; max-width: 460px; margin-left: auto; margin-right: auto; }
    .tier.featured { transform: none; }
    .tier.featured:hover { transform: translateY(-4px); }
  }
</style>
